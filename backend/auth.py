from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets

# ===========================
# ✅ CONFIGURATION (CLO-1)
# ===========================
# Secret key for JWT signing - Keep this secure!
SECRET_KEY = "your-secret-key-change-this-in-production"  
ALGORITHM = "HS256"

# ✅ FIX: Increased to 1440 minutes (24 hours) 
# This ensures your session stays active during the final presentation [cite: 114, 128]
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 
REMEMBER_ME_TOKEN_EXPIRE_DAYS = 30

# Using bcrypt for password hashing as per professional standards [cite: 15]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ===========================
# 🔐 PASSWORD LOGIC
# ===========================

def verify_password(plain_password, hashed_password):
    """Verify a plain text password against the stored hash [cite: 86]"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate a secure bcrypt hash for storage [cite: 86]"""
    return pwd_context.hash(password)

# ===========================
# 🎟️ TOKEN LOGIC (CLO-3)
# ===========================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT Access Token for the user session [cite: 94]"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """
    Decode and verify a JWT token.
    Demonstrates CLO-1: Exception Handling 
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        # Returns None if token is invalid or expired, triggering a 401 in main.py
        return None

# ===========================
# 🔄 REMEMBER ME LOGIC
# ===========================

def create_remember_token(user_id: int) -> str:
    """Create a secure random remember-me token [cite: 94]"""
    return secrets.token_urlsafe(64)

def verify_remember_token(token: str, db_token: str, db_expiry: datetime) -> bool:
    """Verify if the browser's remember-me cookie is still valid [cite: 94]"""
    if not token or not db_token:
        return False
    
    # Check if token matches and is not expired
    if token != db_token:
        return False
    
    if db_expiry < datetime.utcnow():
        return False
    
    return True