# backend/middleware.py

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError, jwt
from .auth import SECRET_KEY, ALGORITHM
import logging

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to validate JWT tokens for protected routes"""
    
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        self.exempt_paths = exempt_paths or [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/signup",
            "/login",
            "/forgot-password",
            "/verify-recovery-code",
            "/reset-password"
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for exempt paths
        if request.url.path in self.exempt_paths:
            return await call_next(request)
        
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            logger.warning(f"Unauthorized access attempt to {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"}
            )
        
        # Extract token
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise ValueError("Invalid authentication scheme")
        except ValueError:
            logger.warning(f"Invalid auth header for {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authentication header"}
            )
        
        # Validate token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if not username:
                raise JWTError("Invalid token payload")
            
            # Add user info to request state for later use
            request.state.user = username
        except JWTError as e:
            logger.warning(f"Invalid token for {request.url.path}: {e}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired token"}
            )
        
        return await call_next(request)