import uvicorn
import multiprocessing
import sys
import os

# Import the actual app object from your main.py
try:
    from main import app
except ImportError:
    # This helps debug if the import is still failing
    print("Could not find main.py. Ensure run_server.py is in the same folder as main.py")
    sys.exit(1)

if __name__ == "__main__":
    # Required for frozen executables
    multiprocessing.freeze_support() 
    
    # CRITICAL: Pass 'app' (the object), NOT "main:app" (the string)
    uvicorn.run(app, host="127.0.0.1", port=8000)