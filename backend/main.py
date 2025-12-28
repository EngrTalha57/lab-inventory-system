import sys
import io
import os
import pandas as pd
from typing import List, Optional
from datetime import date
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

# 1. Force UTF-8 encoding to prevent console crashes on Windows
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr:
    sys.stderr.reconfigure(encoding='utf-8')

# Import local modules
import models
import schemas
import crud
from database import engine, get_db, SessionLocal
from routes import auth as auth_router
from routes.auth import get_current_user

# ==========================================
#  DATABASE AUTO-INITIALIZATION
# ==========================================
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Department Lab Inventory API",
    version="2.4.0"
)

# ==========================================
#  STARTUP EVENT: CREATE ADMIN
# ==========================================
@app.on_event("startup")
def startup_populate():
    """Ensures a new installation has a default admin account."""
    db = SessionLocal()
    try:
        admin = crud.get_user_by_username(db, "admin")
        if not admin:
            print(" New installation detected. Creating default admin...")
            admin_in = schemas.UserCreate(
                username="admin",
                password="Admin@123",
                confirm_password="Admin@123",
                email="admin@lab.com",
                full_name="System Admin"
            )
            crud.create_user(db, admin_in)
            print(" Default admin created. Login with admin / Admin@123")
    except Exception as e:
        print(f" Error during startup check: {e}")
    finally:
        db.close()

# ==========================================
#  CORS CONFIGURATION (Security Fix)
# ==========================================

origins = [
    "http://localhost:5173",  # For local testing
    "http://localhost:3000",
    "https://lab-inventory-system-nu.vercel.app" # <--- YOUR VERCEL APP URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # We use the specific list, NOT ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)

# ==========================================
#  EQUIPMENT ENDPOINTS
# ==========================================

@app.get("/equipments", response_model=List[schemas.Equipment])
def read_equipments(db: Session = Depends(get_db)):
    return crud.get_all_equipment(db)

@app.post("/equipments", response_model=schemas.Equipment, status_code=201)
def create_equipment(equipment_in: schemas.EquipmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_equipment(db, equipment_in)

@app.put("/equipments/{equipment_id}", response_model=schemas.Equipment)
def update_equipment(equipment_id: int, equipment_in: schemas.EquipmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    for key, value in equipment_in.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/equipments/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_equipment(db, equipment_id):
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"detail": "Equipment deleted"}

# ==========================================
#  MAINTENANCE ENDPOINTS (FIXED)
# ==========================================

@app.get("/maintenance", response_model=List[schemas.Maintenance])
def read_maintenance(db: Session = Depends(get_db)):
    return crud.get_maintenance_records(db)

@app.post("/maintenance", response_model=schemas.Maintenance, status_code=201)
def create_maintenance(maint_in: schemas.MaintenanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        return crud.create_maintenance(db, maint_in)
    except Exception as e:
        print(f"CRITICAL MAINTENANCE ERROR: {e}")
        raise HTTPException(status_code=400, detail=f"Database Error: {str(e)}")

# ✅ FIX: Added Update (PUT) Endpoint for Maintenance
@app.put("/maintenance/{maintenance_id}", response_model=schemas.Maintenance)
def update_maintenance(maintenance_id: int, maint_in: schemas.MaintenanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.Maintenance).filter(models.Maintenance.id == maintenance_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Update fields manually
    for key, value in maint_in.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

# ✅ FIX: Added Delete (DELETE) Endpoint for Maintenance
@app.delete("/maintenance/{maintenance_id}")
def delete_maintenance(maintenance_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.Maintenance).filter(models.Maintenance.id == maintenance_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    db.delete(db_item)
    db.commit()
    return {"detail": "Maintenance record deleted"}

# ==========================================
#  ISSUE RECORDS ENDPOINTS
# ==========================================
@app.get("/issues", response_model=List[schemas.IssueRecord])
def read_issues(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_issue_records(db)

@app.post("/issues", response_model=schemas.IssueRecord, status_code=201)
def create_issue(issue_in: schemas.IssueRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_issue_record(db, issue_in)

# ==========================================
#  CSV EXPORT & UPLOAD
# ==========================================
@app.get("/equipment/export-csv")
def export_equipment_csv(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    equipments = db.query(models.Equipment).execution_options(populate_existing=True).all()
    data = [{"ID": i.id, "Name": i.name, "Code": i.code, "Category": i.category, "Lab": i.lab, "Total": i.total_qty, "Available": i.available_qty, "Status": i.status} for i in equipments]
    
    if not data:
        raise HTTPException(status_code=404, detail="No equipment data found")

    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=verified_inventory.csv"
    return response

@app.post("/equipment/bulk-upload")
async def bulk_upload_equipment(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read CSV file")

    new_items = []
    for index, row in df.iterrows():
        name = str(row.get('name', '')).strip()
        if not name or name == "nan": continue
        qty = int(row.get('total_qty', 0))
        new_items.append(models.Equipment(
            name=name, code=str(row.get('code', '')).strip(), category=str(row.get('category', 'General')),
            lab=str(row.get('lab', 'Main Lab')), total_qty=qty, available_qty=qty, status=str(row.get('status', 'Available')).strip()
        ))
    db.add_all(new_items)
    db.commit()
    return {"message": f"Successfully uploaded {len(new_items)} items"}

# ==========================================
#  SERVE STATIC FRONTEND
# ==========================================
def get_frontend_path():
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    path_internal = os.path.join(base_path, "dist")
    path_local = os.path.join(os.path.dirname(base_path), "dist")

    if os.path.exists(path_internal): return path_internal
    elif os.path.exists(path_local): return path_local
    return None

static_dir = get_frontend_path()
if static_dir:
    print(f" Frontend files detected at: {static_dir}")
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    print(f" ERROR: Cannot find 'dist' folder. Dashboard UI will not load.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)