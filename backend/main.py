from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = {}

class DeathReport(BaseModel):
    patient_id: str
    full_name: str
    gender: str
    dob: str
    doctor_id: str
    hospital_id: str
    date_time_of_death: str
    place_of_death: str
    cause_of_death: str
    death_recorded_by: str

class PostmortemData(BaseModel):
    patient_id: str
    doctor_id: str
    death_hash: str
    external_examination: str
    internal_examination: str
    viscera_report: str
    sexual_assault_findings: str
    final_opinion: str
    ipfs_hash: str

class VerifyRequest(BaseModel):
    patient_id: str
    full_name: str
    dob: str

@app.get("/check-patient/{pid}")
def check_patient(pid: str):
    return {"exists": pid.strip() in db}

@app.get("/get-death-hash/{pid}")
def get_death_hash(pid: str):
    record = db.get(pid.strip())
    return {"death_hash": record.get("death_hash") if record else None}

@app.post("/declare-death")
def declare_death(report: DeathReport):
    # Fixed Hashing String: PID + Name + DOB
    raw = f"{report.patient_id.strip()}{report.full_name.strip()}{report.dob.strip()}"
    death_hash = hashlib.sha256(raw.encode()).hexdigest()

    db[report.patient_id.strip()] = {
        **report.dict(),
        "death_hash": death_hash,
        "postmortem_hash": None
    }
    return {"status": "success", "death_hash": death_hash}

@app.post("/submit-postmortem")
def submit_postmortem(data: PostmortemData):
    pid = data.patient_id.strip()
    record = db.get(pid)
    if not record: return {"status": "error", "message": "Record not found"}

    # Final Hash Logic: PID + InitialHash + IPFS_CID
    raw_pm = f"{pid}{data.death_hash.strip()}{data.ipfs_hash.strip()}"
    pm_hash = hashlib.sha256(raw_pm.encode()).hexdigest()

    record.update({
        "postmortem_hash": pm_hash,
        "external_examination": data.external_examination,
        "internal_examination": data.internal_examination,
        "viscera_report": data.viscera_report,
        "final_opinion": data.final_opinion,
        "ipfs_cid": data.ipfs_hash
    })
    return {"status": "success", "postmortem_hash": pm_hash}

@app.post("/verify-report")
def verify_report(req: VerifyRequest):
    pid = req.patient_id.strip()
    record = db.get(pid)
    if not record or record["full_name"].strip().lower() != req.full_name.strip().lower():
        return {"status": "error", "message": "Identity mismatch"}
    return {"status": "success", "data": record, "death_hash": record["death_hash"], "postmortem_hash": record["postmortem_hash"]}