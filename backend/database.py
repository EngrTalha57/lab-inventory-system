import os
import sys
import shutil
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Determine the writable path (AppData)
# This creates: C:\Users\YourName\AppData\Roaming\TasInventory
APP_NAME = "TasInventory"
USER_DATA_DIR = os.path.join(os.getenv('APPDATA'), APP_NAME)

if not os.path.exists(USER_DATA_DIR):
    os.makedirs(USER_DATA_DIR)

# 2. Define the paths
DB_FILENAME = "inventory.db"
WRITABLE_DB_PATH = os.path.join(USER_DATA_DIR, DB_FILENAME)

# 3. Locate the bundled database (The "Template")
# In dev, it's in the current folder. In prod, it's in the _internal or resource folder.
if getattr(sys, 'frozen', False):
    # Running as EXE
    BASE_DIR = os.path.dirname(sys.executable)
else:
    # Running as script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BUNDLED_DB_PATH = os.path.join(BASE_DIR, DB_FILENAME)

# 4. Copy the DB if it doesn't exist in AppData
# This preserves your "Admin" account from the build but allows new writes.
if not os.path.exists(WRITABLE_DB_PATH):
    if os.path.exists(BUNDLED_DB_PATH):
        print(f"Copying database template to {WRITABLE_DB_PATH}")
        shutil.copy2(BUNDLED_DB_PATH, WRITABLE_DB_PATH)
    else:
        print("No template database found. A new empty one will be created.")

# 5. Connect to the WRITABLE database
print(f"Connecting to database at: {WRITABLE_DB_PATH}")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{WRITABLE_DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()