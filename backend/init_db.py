# backend/init_db.py

from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base
import bcrypt
import random
import string

def init_db():
    print("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create admin user
    db = SessionLocal()
    try:
        from models import User
        
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # Generate recovery code
            recovery_code = ''.join(random.choices(string.digits, k=4))
            
            # Hash password using bcrypt
            password = "Admin@123"  # Shorter password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@labinventory.com",
                full_name="System Administrator",
                hashed_password=hashed_password.decode('utf-8'),  # Store as string
                recovery_code=recovery_code,
                is_active=1
            )
            db.add(admin_user)
            db.commit()
            
            print("=" * 50)
            print("ADMIN USER CREATED")
            print(f"Username: admin")
            print(f"Password: Admin@123")
            print(f"Recovery Code: {recovery_code}")
            print("=" * 50)
            print("IMPORTANT: Change this password after first login!")
            print("=" * 50)
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()