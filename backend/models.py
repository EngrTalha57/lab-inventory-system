# backend/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

# Import Base from database
from database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    recovery_code = Column(String, nullable=True)  # 4-digit code for password recovery
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)  # 1 for active, 0 for inactive
    
    # Remember me functionality
    remember_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)                 # Component name
    code = Column(String, unique=True, index=True)        # Inventory code
    category = Column(String, nullable=True)              # e.g. Resistor, Tool, IC
    lab = Column(String, nullable=True)                   # Main storage lab
    total_qty = Column(Integer, default=0)
    available_qty = Column(Integer, default=0)
    status = Column(String, default="available")          # available / issued / faulty

    # Relations
    issues = relationship("IssueRecord", back_populates="equipment")
    maintenance_records = relationship("Maintenance", back_populates="equipment")


class IssueRecord(Base):
    __tablename__ = "issue_records"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    issued_to = Column(String, nullable=False)            # Student/Teacher name
    issued_lab = Column(String, nullable=False)           # Lab name
    quantity = Column(Integer, default=1)
    issue_date = Column(String, nullable=False)           # Keep as string (simple)
    return_date = Column(String, nullable=True)
    status = Column(String, default="issued")             # issued / returned

    equipment = relationship("Equipment", back_populates="issues")


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    fault_description = Column(String, nullable=False)
    fault_date = Column(String, nullable=False)
    sent_for_repair_date = Column(String, nullable=True)
    return_from_repair_date = Column(String, nullable=True)
    status = Column(String, default="pending")            # pending / completed
    remarks = Column(String, nullable=True)

    equipment = relationship("Equipment", back_populates="maintenance_records")