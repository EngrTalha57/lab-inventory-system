from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime, date
import re

# ==========================================
#  AUTHENTICATION & USER SCHEMAS
# ==========================================

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyRecoveryCode(BaseModel):
    email: EmailStr
    recovery_code: str

class ResetPassword(BaseModel):
    email: EmailStr
    recovery_code: str
    new_password: str
    confirm_new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_new_password')
    def new_passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UserResponse(UserBase):
    id: int
    recovery_code: Optional[str] = None
    is_active: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None


# ==========================================
#  EQUIPMENT SCHEMAS
# ==========================================

class EquipmentBase(BaseModel):
    name: str
    code: str
    category: Optional[str] = None
    lab: Optional[str] = None
    total_qty: int 
    available_qty: int 
    status: str

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category: Optional[str] = None
    lab: Optional[str] = None
    total_qty: Optional[int] = None
    available_qty: Optional[int] = None
    status: Optional[str] = None

class Equipment(EquipmentBase):
    id: int

    class Config:
        from_attributes = True


# ==========================================
#  ISSUE RECORD SCHEMAS
# ==========================================

class IssueRecordBase(BaseModel):
    issued_to: str
    issued_lab: str
    quantity: int
    issue_date: date  # Changed to 'date' for better validation
    return_date: Optional[date] = None
    status: str = "issued"

class IssueRecordCreate(IssueRecordBase):
    equipment_id: int

class IssueRecord(IssueRecordBase):
    id: int
    equipment_id: int

    class Config:
        from_attributes = True


# ==========================================
#  MAINTENANCE SCHEMAS (UPDATED)
# ==========================================

class MaintenanceBase(BaseModel):
    fault_description: str
    fault_date: date  # Using 'date' ensures the string "YYYY-MM-DD" is valid
    sent_for_repair_date: Optional[date] = None
    return_from_repair_date: Optional[date] = None
    status: str = "pending"
    remarks: Optional[str] = None
    cost: float = 0.0  # ✅ REQUIRED: Matches the new column in models.py

class MaintenanceCreate(MaintenanceBase):
    equipment_id: int

class Maintenance(MaintenanceBase):
    id: int
    equipment_id: int

    class Config:
        from_attributes = True