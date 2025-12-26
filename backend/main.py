from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import os

# Import local modules
import models
import schemas
import crud
from database import engine, get_db

# Import Auth logic
from routes import auth as auth_router
from routes.auth import get_current_user
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Department Lab Inventory API",
    version="2.2.1"
)

# ===========================
# ✅ CORS MIDDLEWARE
# ===========================
origins = [
    "http://localhost:5137",     # React Localhost (Vite)
    "http://127.0.0.1:5137",
    "http://localhost:3000",     
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth_router.router)

# ===========================
# ✅ HEALTH CHECK (Moved to /api/health)
# ===========================
@app.get("/api/health")
def read_health():
    return {
        "message": "Department Lab Inventory API is Running",
        "status": "healthy"
    }

# ===========================
# 🚀 BULK UPLOAD ENDPOINT
# ===========================
@app.post("/equipment/bulk-upload")
async def bulk_upload_equipment(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Bulk import equipment from CSV with validation"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        df.columns = df.columns.str.strip().str.lower()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read CSV file")

    errors = []
    new_items = []

    for index, row in df.iterrows():
        line_no = index + 2 
        name = str(row.get('name', '')).strip()
        if not name or name == "nan":
            errors.append(f"Line {line_no}: Name is missing")
            continue
            
        try:
            qty_raw = row.get('total_qty')
            if qty_raw is None or pd.isna(qty_raw):
                errors.append(f"Line {line_no}: Column 'total_qty' is missing or empty")
                continue
            qty = int(qty_raw)
            if qty < 0: raise ValueError
        except (ValueError, TypeError):
            errors.append(f"Line {line_no}: total_qty must be a positive number")
            continue

        new_items.append(models.Equipment(
            name=name,
            code=str(row.get('code', '')).strip(),
            category=str(row.get('category', 'General')),
            lab=str(row.get('lab', 'Main Lab')),
            total_qty=qty,
            available_qty=qty,
            status=str(row.get('status', 'Available')).strip()
        ))

    if errors:
        raise HTTPException(status_code=422, detail={"messages": errors})

    try:
        db.add_all(new_items)
        db.commit()
        return {"message": f"Successfully uploaded {len(new_items)} items"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during bulk upload: {str(e)}")


# ===========================
# 📦 EQUIPMENT CRUD
# ===========================
@app.get("/equipments", response_model=List[schemas.Equipment])
def read_equipments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_all_equipment(db)

@app.post("/equipments", response_model=schemas.Equipment, status_code=201)
def create_equipment(equipment_in: schemas.EquipmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_equipment(db, equipment_in)

@app.put("/equipments/{equipment_id}", response_model=schemas.Equipment)
def update_equipment(equipment_id: int, equipment_in: schemas.EquipmentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = crud.update_equipment(db, equipment_id, equipment_in)
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_item

@app.delete("/equipments/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_equipment(db, equipment_id):
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"detail": "Equipment deleted successfully"}


# ===========================
# 📋 ISSUE RECORD CRUD
# ===========================
@app.get("/issues", response_model=List[schemas.IssueRecord])
def read_issues(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_issue_records(db)

@app.post("/issues", response_model=schemas.IssueRecord, status_code=201)
def create_issue(issue_in: schemas.IssueRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    equipment = crud.get_equipment(db, issue_in.equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if equipment.available_qty < issue_in.quantity:
        raise HTTPException(status_code=400, detail=f"Only {equipment.available_qty} items available")
    return crud.create_issue_record(db, issue_in)

@app.delete("/issues/{issue_id}")
def delete_issue(issue_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_issue_record(db, issue_id):
        raise HTTPException(status_code=404, detail="Issue record not found")
    return {"detail": "Issue record deleted successfully"}


# ===========================
# 🛠️ MAINTENANCE CRUD
# ===========================
@app.get("/maintenance", response_model=List[schemas.Maintenance])
def read_maintenance(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_maintenance_records(db)

@app.post("/maintenance", response_model=schemas.Maintenance, status_code=201)
def create_maintenance(maint_in: schemas.MaintenanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_maintenance(db, maint_in)

@app.delete("/maintenance/{maintenance_id}")
def delete_maintenance(maintenance_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_maintenance(db, maintenance_id):
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return {"detail": "Maintenance record deleted successfully"}

# ===========================
# 🖥️ REACT DASHBOARD (STATIC FILES)
# ===========================
# This must be the very last route in the file
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")