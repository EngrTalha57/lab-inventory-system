# backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file
SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory.db"

# For SQLite only
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


# Dependency: get database session for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()