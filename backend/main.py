import os
import uuid
import pandas as pd
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from services.validator import DataValidator
from services.processor import FileProcessor

app = FastAPI(title="TransactValidate Pro API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
CONFIG_PATH = "config.json"

validator = DataValidator(CONFIG_PATH)
processor = FileProcessor(UPLOAD_DIR, PROCESSED_DIR, chunk_size=5000)

# In-memory store for job status (Use Redis for production)
jobs = {}

@app.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    job_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil_copy = buffer.write(await file.read())
        
    jobs[job_id] = {"status": "processing", "filename": file.filename}
    
    background_tasks.add_task(process_csv, job_id, file_path)
    
    return {"job_id": job_id}

async def process_csv(job_id: str, file_path: str):
    try:
        df = pd.read_csv(file_path)
        valid_df, invalid_df = validator.validate_dataframe(df)
        
        chunk_files = processor.split_and_save(valid_df, job_id)
        
        jobs[job_id].update({
            "status": "completed",
            "total_records": len(df),
            "valid_records": len(valid_df),
            "invalid_records": len(invalid_df),
            "chunks": chunk_files
        })
    except Exception as e:
        jobs[job_id].update({
            "status": "failed",
            "error": str(e)
        })
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/download/{job_id}/{filename}")
async def download_file(job_id: str, filename: str):
    file_path = os.path.join(PROCESSED_DIR, job_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=filename, media_type='text/csv')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
