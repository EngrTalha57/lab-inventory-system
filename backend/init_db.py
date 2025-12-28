import random
import string
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, User
from passlib.context import CryptContext

# ✅ Synchronized hashing context with crud.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    print("Initializing Department Lab Inventory Database...")
    
    # ✅ Step 1: Create fresh database file and tables
    # SQLAlchemy will auto-create 'inventory.db' if it doesn't exist in the current directory.
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # ✅ Step 2: Check for existing admin
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            # Generate 4-digit recovery code
            recovery_code = ''.join(random.choices(string.digits, k=4))
            
            # Hash password using passlib to match auth routes
            password = "Admin@123"
            hashed_password = pwd_context.hash(password)
            
            # Create the default administrator account
            admin_user = User(
                username="admin",
                email="admin@labinventory.com",
                full_name="System Administrator",
                hashed_password=hashed_password,
                recovery_code=recovery_code,
                is_active=1
            )
            
            db.add(admin_user)
            db.commit()
            
            print("=" * 50)
            print("🆕 NEW INSTALLATION DETECTED: ADMIN CREATED")
            print(f"Username: admin")
            print(f"Password: {password}")
            print(f"Recovery Code: {recovery_code}")
            print("=" * 50)
            print("IMPORTANT: Log in and change this password immediately!")
            print("=" * 50)
        else:
            print("✔️ Database found. Admin user already exists.")
            
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("Database initialization process complete!")

if __name__ == "__main__":
    init_db()