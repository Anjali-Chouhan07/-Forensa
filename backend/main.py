from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib

app = FastAPI()

# ---------------- HASH FUNCTION ----------------

def sha(data: str):
    return hashlib.sha256(data.encode()).hexdigest()


# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://forensa-j6z6.vercel.app", "http://localhost:5173"], # Apne domains yahan likho
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)


# ---------------- IN MEMORY DB ----------------

db = {}


# ---------------- MODELS ----------------

class DeathReport(BaseModel):
    patient_id: str
    full_name: str
    gender: str
    dob: str
    doctor_id: str
    hospital_id: str
    date_time_of_death: str
    
    cause_of_death: str

    death_image_cid: str


class PostmortemData(BaseModel):
    patient_id: str
    pdoctor_id: str
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


# ---------------- CHECK PATIENT ----------------

@app.get("/check-patient/{pid}")
def check_patient(pid: str):
    pid = pid.strip().lower()
    return {"exists": pid in db}


# ---------------- DECLARE DEATH ----------------

@app.post("/declare-death")
def declare_death(report: DeathReport):

    pid = report.patient_id.strip().lower()

    # duplicate protection
    if pid in db:
        return {
            "status": "error",
            "message": "Patient already registered"
        }

    # doctor fields hash
    doctor_fields_hash = sha(
        report.gender +
        report.hospital_id +
        report.doctor_id +
        report.date_time_of_death +
        
        report.cause_of_death 
    
    )

    # death hash
    death_hash = sha(
        pid +
        report.full_name.strip().lower() +
        report.dob +
        doctor_fields_hash+
        report.death_image_cid
    )

    # store in DB
    db[pid] = {
        **report.dict(),
        "doctor_fields_hash": doctor_fields_hash,
        "death_hash": death_hash,
        "postmortem_fields_hash": None,
            "death_image_cid": report.death_image_cid,
        "postmortem_hash": None,
        "final_hash": None,
        "ipfs_cid": None
    }
    

    print("DB STATE:", db)

    return {
        "status": "success",
        "death_hash": death_hash
    }


# ---------------- GET DEATH HASH ----------------

@app.get("/get-death-hash/{pid}")
def get_death_hash(pid: str):

    pid = pid.strip().lower()

    if pid not in db:
        return {
            "status": "error",
            "message": "Patient not found"
        }

    return {
        "status": "success",
        "death_hash": db[pid]["death_hash"]
    }


# ---------------- POSTMORTEM ----------------

@app.post("/submit-postmortem")
def submit_postmortem(data: PostmortemData):

    pid = data.patient_id.strip().lower()

    if pid not in db:
        return {"status": "error", "message": "Patient not found"}

    record = db[pid]

    # duplicate forensic protection
    if record["postmortem_hash"] is not None:
        return {
            "status": "error",
            "message": "Forensic report already exists"
        }

    # ---------------- FORENSIC FIELD HASH ----------------

    postmortem_fields_hash = sha(
        data.external_examination +
        data.internal_examination +
        data.viscera_report +
        data.sexual_assault_findings +
        data.final_opinion +
        data.pdoctor_id
    )

    # ---------------- POSTMORTEM HASH ----------------

    postmortem_hash = sha(
        record["death_hash"] +
        postmortem_fields_hash +
        data.ipfs_hash
    )

    # ---------------- FINAL CHAIN HASH ----------------

    final_hash = sha(
        record["death_hash"] +
        postmortem_hash
    )

    # store forensic data
    record["postmortem_fields_hash"] = postmortem_fields_hash
    record["postmortem_hash"] = postmortem_hash
    record["final_hash"] = final_hash
    record["ipfs_cid"] = data.ipfs_hash
    record["pdoctor_id"] = data.pdoctor_id
    record["external_examination"] = data.external_examination
    record["internal_examination"] = data.internal_examination
    record["viscera_report"] = data.viscera_report
    record["sexual_assault_findings"] = data.sexual_assault_findings
    record["final_opinion"] = data.final_opinion

    print("FORENSIC UPDATED:", db)

    return {
        "status": "success",
        "postmortem_hash": postmortem_hash,
        "final_hash": final_hash
    }

# ---------------- HACKER / TAMPER ENDPOINT ----------------
@app.get("/inject-malware/{pid}")
def tamper_record(pid: str):
    pid = pid.strip().lower()
    if pid in db:
        # SIRF cause badlein, naam ko mat chhediye warna Identity Mismatch aayega
        db[pid]["cause_of_death"] = "Murder (Tampered)" 
        return {"status": "success", "message": "Cause of death tampered!"}
    return {"status": "error", "message": "Patient not found"}
# ---------------- VERIFY ----------------

@app.post("/verify-report")
def verify_report(req: VerifyRequest):

    pid = req.patient_id.strip().lower()

    if pid not in db:
        return {"status": "error", "message": "Record not found"}

    record = db[pid]
    # 🔴 FORCE TAMPERING
    print(f"Comparing DB Name: '{record['full_name']}' with Req Name: '{req.full_name}'")
    # identity check
    if record["full_name"].strip().lower() != req.full_name.strip().lower():
        return {"status": "error", "message": "Identity mismatch"}

    # ---------------- RE-CALCULATE DOCTOR FIELDS HASH ----------------

    doctor_fields_hash = sha(
        record["gender"] +
        record["hospital_id"] +
        record["doctor_id"] +
        record["date_time_of_death"] +
        
        record["cause_of_death"] 
        
    )

    # ---------------- RE-CALCULATE DEATH HASH ----------------

    recalc_death_hash = sha(
        record["patient_id"] +
        record["full_name"].strip().lower() +
        record["dob"] +
        doctor_fields_hash +
        record["death_image_cid"]
    )

    # ---------------- RE-CALCULATE POSTMORTEM HASH (IF EXISTS) ----------------

    recalc_postmortem_hash = None
    recalc_final_hash = None

    if record["postmortem_hash"]:

        postmortem_fields_hash = sha(
            record["external_examination"] +
            record["internal_examination"] +
            record["viscera_report"] +
            record["sexual_assault_findings"] +
            record["final_opinion"] +
            record["pdoctor_id"]
        )

        recalc_postmortem_hash = sha(
            recalc_death_hash +
            postmortem_fields_hash +
            record["ipfs_cid"]
        )

        recalc_final_hash = sha(
            recalc_death_hash +
            recalc_postmortem_hash
        )

    # ---------------- CHECK INTERNAL TAMPERING ----------------

    tampered = False

    if recalc_death_hash != record["death_hash"]:
        tampered = True

    if record["postmortem_hash"] and recalc_postmortem_hash != record["postmortem_hash"]:
        tampered = True

    if record["final_hash"] and recalc_final_hash != record["final_hash"]:
        tampered = True

    # ---------------- RESPONSE ----------------

    return {
        "status": "success",
        "tampered": tampered,
        "recalculated": {
            "death_hash": recalc_death_hash,
            "postmortem_hash": recalc_postmortem_hash,
            "final_hash": recalc_final_hash
        },
        "stored_hashes": {
            "death_hash": record["death_hash"],
            "postmortem_hash": record["postmortem_hash"],
            "final_hash": record["final_hash"]
        },
        "data": record
    }
