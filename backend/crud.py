# backend/crud.py

from sqlalchemy.orm import Session
import models
import schemas
import random
import string
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =============================
#         Authentication CRUD
# =============================

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_in: schemas.UserCreate):
    # Check if user already exists
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        return None, "Username already exists"
    
    existing_email = get_user_by_email(db, user_in.email)
    if existing_email:
        return None, "Email already registered"
    
    # Check password length for bcrypt (max 72 bytes)
    if len(user_in.password.encode('utf-8')) > 72:
        return None, "Password is too long (maximum 72 characters allowed)"
    
    # Generate 4-digit recovery code
    recovery_code = ''.join(random.choices(string.digits, k=4))
    
    # Create new user
    db_user = models.User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=pwd_context.hash(user_in.password),
        recovery_code=recovery_code
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user, None

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None, "Invalid username or password"
    
    if not pwd_context.verify(password, user.hashed_password):
        return None, "Invalid username or password"
    
    if user.is_active != 1:
        return None, "Account is deactivated"
    
    return user, None

def generate_recovery_code(db: Session, email: str):
    user = get_user_by_email(db, email)
    if not user:
        return None, "User with this email not found"
    
    # Generate new 4-digit recovery code
    recovery_code = ''.join(random.choices(string.digits, k=4))
    user.recovery_code = recovery_code
    db.commit()
    db.refresh(user)
    return user, None

def verify_recovery_code(db: Session, email: str, recovery_code: str):
    user = get_user_by_email(db, email)
    if not user:
        return None, "User with this email not found"
    
    if user.recovery_code != recovery_code:
        return None, "Invalid recovery code"
    
    return user, None

def reset_password(db: Session, email: str, recovery_code: str, new_password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None, "User with this email not found"
    
    if user.recovery_code != recovery_code:
        return None, "Invalid recovery code"
    
    # Update password and clear recovery code
    user.hashed_password = pwd_context.hash(new_password)
    user.recovery_code = None
    db.commit()
    db.refresh(user)
    return user, None

# =============================
#         Equipment CRUD
# =============================

def get_all_equipment(db: Session):
    return db.query(models.Equipment).all()

def get_equipment(db: Session, equipment_id: int):
    return db.query(models.Equipment).filter(
        models.Equipment.id == equipment_id
    ).first()

def get_equipment_by_code(db: Session, code: str):
    return db.query(models.Equipment).filter(
        models.Equipment.code == code
    ).first()

def create_equipment(db: Session, equipment_in: schemas.EquipmentCreate):
    """
    If equipment with same CODE exists:
        -> increase quantity
    Else:
        -> create new equipment
    """
    existing_item = get_equipment_by_code(db, equipment_in.code)

    if existing_item:
        # Update quantity and status
        existing_item.total_qty += equipment_in.total_qty
        existing_item.available_qty += equipment_in.available_qty
        existing_item.status = equipment_in.status

        db.commit()
        db.refresh(existing_item)
        return existing_item

    # Create new equipment using total_qty and available_qty
    db_item = models.Equipment(
        name=equipment_in.name,
        code=equipment_in.code,
        category=equipment_in.category,
        lab=equipment_in.lab,
        total_qty=equipment_in.total_qty,
        available_qty=equipment_in.available_qty,
        status=equipment_in.status,
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_equipment(db: Session, equipment_id: int, equipment_in: schemas.EquipmentUpdate):
    db_item = get_equipment(db, equipment_id)
    if not db_item:
        return None

    update_data = equipment_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

def delete_equipment(db: Session, equipment_id: int):
    db_item = get_equipment(db, equipment_id)
    if not db_item:
        return False

    db.delete(db_item)
    db.commit()
    return True

# =============================
#       Issue Record CRUD
# =============================

def get_issue_records(db: Session):
    return db.query(models.IssueRecord).all()

def get_issue_record(db: Session, issue_id: int):
    return db.query(models.IssueRecord).filter(
        models.IssueRecord.id == issue_id
    ).first()

def create_issue_record(db: Session, issue_in: schemas.IssueRecordCreate):
    db_item = models.IssueRecord(
        equipment_id=issue_in.equipment_id,
        issued_to=issue_in.issued_to,
        issued_lab=issue_in.issued_lab,
        quantity=issue_in.quantity,
        issue_date=issue_in.issue_date,
        return_date=issue_in.return_date,
        status=issue_in.status,
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_issue_record(db: Session, issue_id: int, issue_in: schemas.IssueRecordCreate):
    db_item = get_issue_record(db, issue_id)
    if not db_item:
        return None

    db_item.equipment_id = issue_in.equipment_id
    db_item.issued_to = issue_in.issued_to
    db_item.issued_lab = issue_in.issued_lab
    db_item.quantity = issue_in.quantity
    db_item.issue_date = issue_in.issue_date
    db_item.return_date = issue_in.return_date
    db_item.status = issue_in.status

    db.commit()
    db_item.refresh(db_item)
    return db_item

def delete_issue_record(db: Session, issue_id: int):
    db_item = get_issue_record(db, issue_id)
    if not db_item:
        return False

    db.delete(db_item)
    db.commit()
    return True

# =============================
#         Maintenance CRUD
# =============================

def get_maintenance_records(db: Session):
    return db.query(models.Maintenance).all()

def get_maintenance_record(db: Session, m_id: int):
    return db.query(models.Maintenance).filter(
        models.Maintenance.id == m_id
    ).first()

def create_maintenance(db: Session, m_in: schemas.MaintenanceCreate):
    db_item = models.Maintenance(
        equipment_id=m_in.equipment_id,
        fault_description=m_in.fault_description,
        fault_date=m_in.fault_date,
        sent_for_repair_date=m_in.sent_for_repair_date,
        return_from_repair_date=m_in.return_from_repair_date,
        status=m_in.status,
        remarks=m_in.remarks,
        cost=m_in.cost # Added cost field
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_maintenance(db: Session, m_id: int, m_in: schemas.MaintenanceCreate):
    db_item = get_maintenance_record(db, m_id)
    if not db_item:
        return None

    db_item.equipment_id = m_in.equipment_id
    db_item.fault_description = m_in.fault_description
    db_item.fault_date = m_in.fault_date
    db_item.sent_for_repair_date = m_in.sent_for_repair_date
    db_item.return_from_repair_date = m_in.return_from_repair_date
    db_item.status = m_in.status
    db_item.remarks = m_in.remarks
    db_item.cost = m_in.cost # Added cost field

    db.commit()
    db.refresh(db_item)
    return db_item

def delete_maintenance(db: Session, m_id: int):
    db_item = get_maintenance_record(db, m_id)
    if not db_item:
        return False

    db.delete(db_item)
    db.commit()
    return True
