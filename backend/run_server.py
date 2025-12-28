# Force the console to use UTF-8 encoding
import sys
import os
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr:
    sys.stderr.reconfigure(encoding='utf-8') 
import uvicorn
import multiprocessing
import sys
import os

#  CRITICAL FIX: Handle PyInstaller's internal path structure
if getattr(sys, 'frozen', False):
    # If running as EXE, look in the directory of the EXE
    base_path = sys._MEIPASS
    # Add the base path to sys.path so 'import main' works
    sys.path.append(base_path)
else:
    # If running as a normal script
    base_path = os.path.dirname(os.path.abspath(__file__))

try:
    from main import app
    from init_db import init_db
except ImportError as e:
    import tkinter.messagebox as mb
    mb.showerror("Startup Error", f"Could not load application modules: {str(e)}")
    sys.exit(1)

if __name__ == "__main__":
    multiprocessing.freeze_support() 

    # ✅ STEP 1: AUTOMATIC DATABASE CREATION
    # Use the current working directory for the database file
    db_file = os.path.join(os.getcwd(), "inventory.db")
    
    if not os.path.exists(db_file):
        print("Fresh installation detected. Initializing database...")
        try:
            init_db()
        except Exception as e:
            import tkinter.messagebox as mb
            mb.showerror("Database Error", f"Failed to initialize database: {str(e)}")
            sys.exit(1)

    # ✅ STEP 2: START SERVER
    uvicorn.run(app, host="127.0.0.1", port=8000)
    

# Force the console to use UTF-8 encoding
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr:
    sys.stderr.reconfigure(encoding='utf-8')    
    