# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer 
from sqlalchemy.orm import Session
from datetime import timedelta
import random
import string

from database import get_db
from models import User
# ✅ Import schemas (UserLogin now has remember_me)
from schemas import UserLogin, Token, UserCreate, UserResponse, ForgotPasswordRequest, VerifyRecoveryCode, ResetPassword
from auth import (
    create_access_token, 
    verify_password, 
    get_password_hash,
    create_remember_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 scheme: Tells FastAPI to check the "Authorization" header for a Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- Helper Functions ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    
    # 1. Decode the token
    username = decode_access_token(token)
    
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Find user in DB
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if user.is_active == 0:
        return None
    return user

# --- Routes ---

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate a random 4-digit recovery code
    recovery_code = ''.join(random.choices(string.digits, k=4))
    
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        recovery_code=recovery_code,
        is_active=1
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        recovery_code=db_user.recovery_code
    )

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Login user and optionally set remember-me cookie"""
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Short-Lived Access Token (e.g., 30 mins)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    # ✅ HANDLE REMEMBER ME
    if user_data.remember_me:
        remember_token = create_remember_token(user.id)
        user.remember_token = remember_token 
        
        # Save secure cookie (HttpOnly prevents JS theft)
        response.set_cookie(
            key="remember_token",
            value=remember_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite="lax",
            max_age=30 * 24 * 60 * 60  # 30 Days
        )
        db.commit()
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/auto-login", response_model=Token)
def auto_login(request: Request, db: Session = Depends(get_db)):
    """Restore session from HttpOnly cookie"""
    remember_token = request.cookies.get("remember_token")
    
    if not remember_token:
        raise HTTPException(status_code=401, detail="No remember token")
        
    user = db.query(User).filter(User.remember_token == remember_token).first()
    if not user or user.is_active == 0:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    # Generate new access token
    access_token = create_access_token(data={"sub": user.username})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/logout")
def logout(response: Response, db: Session = Depends(get_db)):
    """Clear cookies on logout"""
    # Delete the cookie with the same attributes to ensure removal
    response.delete_cookie(key="remember_token", httponly=True, samesite="lax")
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Return fake success to prevent email enumeration
        return {"message": "If account exists, code sent"}
    return {"message": "Code sent", "recovery_code": user.recovery_code}

@router.post("/verify-recovery-code")
def verify_recovery_code(data: VerifyRecoveryCode, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.recovery_code == data.recovery_code).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid code")
    return {"message": "Verified"}

@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.recovery_code == data.recovery_code).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    user.hashed_password = get_password_hash(data.new_password)
    # Rotate recovery code so it can't be used again
    user.recovery_code = ''.join(random.choices(string.digits, k=4))
    db.commit()
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user