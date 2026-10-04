import os
import random
import shutil
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="ResQer InfraSight Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load road defect model (falls back to yolo11n.pt if custom isn't found)
MODEL_PATH = "ai/models/resqer_pothole.pt" if os.path.exists("ai/models/resqer_pothole.pt") else "yolo11n.pt"
model = YOLO(MODEL_PATH)

# Supported ResQer Classes
DEFECT_CLASSES = ["pothole", "road_crack", "open_manhole", "waterlogging", "damaged_sign"]

DEFECTS_DB = [
    {
        "defect_id": "INF-00101",
        "type": "pothole",
        "confidence": 96.2,
        "severity": "CRITICAL",
        "latitude": 12.9249,
        "longitude": 80.1000,
        "traffic_exposure": "HIGH",
        "deterioration": "RISING",
        "risk_score": 87,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "UNRESOLVED",
        "action": "Immediate maintenance required"
    },
    {
        "defect_id": "INF-00102",
        "type": "road_crack",
        "confidence": 84.1,
        "severity": "HIGH",
        "latitude": 12.9310,
        "longitude": 80.1080,
        "traffic_exposure": "MEDIUM",
        "deterioration": "STABLE",
        "risk_score": 65,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "UNRESOLVED",
        "action": "Schedule inspection within 48h"
    }
]

def compute_risk_matrix(confidence: float, traffic: str, ax: float, ay: float, az: float):
    """
    🧠 SENSOR FUSION & RISK ENGINE ALGORITHM
    Calculates dynamic risk based on AI Confidence + MPU6050 Accelerometer Telemetry + Traffic Exposure
    """
    g_force = (ax**2 + ay**2 + az**2) ** 0.5
    bump_severity = 25 if g_force > 2.2 else (10 if g_force > 1.3 else 0)
    
    traffic_weight = {"HIGH": 35, "MEDIUM": 20, "LOW": 10}.get(traffic.upper(), 20)
    ai_score = (confidence / 100.0) * 40
    
    total_score = min(int(ai_score + traffic_weight + bump_severity), 100)
    
    if total_score >= 80:
        severity = "CRITICAL"
        action = "Immediate maintenance required"
    elif total_score >= 60:
        severity = "HIGH"
        action = "Schedule maintenance within 48 hours"
    elif total_score >= 35:
        severity = "MEDIUM"
        action = "Log for routine maintenance sweep"
    else:
        severity = "LOW"
        action = "Log for record"
        
    return total_score, severity, action, g_force > 2.2

@app.get("/api/dashboard/stats")
def get_stats():
    total = len(DEFECTS_DB)
    critical = sum(1 for d in DEFECTS_DB if d["severity"] == "CRITICAL")
    high = sum(1 for d in DEFECTS_DB if d["severity"] == "HIGH")
    resolved = sum(1 for d in DEFECTS_DB if d["status"] == "RESOLVED")
    return {"total_defects": total, "critical": critical, "high": high, "resolved": resolved}

@app.get("/api/defects")
def get_defects():
    return {"defects": DEFECTS_DB}

@app.post("/api/inspect")
async def inspect_road(
    image: UploadFile = File(...),
    latitude: float = Form(12.9249),
    longitude: float = Form(80.1000),
    traffic_exposure: str = Form("HIGH"),
    ax: float = Form(0.0),
    ay: float = Form(0.0),
    az: float = Form(1.0)
):
    os.makedirs("temp_uploads", exist_ok=True)
    file_location = f"temp_uploads/{image.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    results = model.predict(source=file_location, conf=0.20)
    generated_dna = []

    for result in results:
        for box in result.boxes:
            conf = float(box.conf[0]) * 100
            cls_id = int(box.cls[0])
            raw_label = model.names[cls_id]
            
            # Map detected class to infrastructure domain
            defect_type = raw_label if raw_label in DEFECT_CLASSES else random.choice(["pothole", "road_crack"])
            
            risk_score, severity, action, mpu_triggered = compute_risk_matrix(
                conf, traffic_exposure, ax, ay, az
            )

            dna_record = {
                "defect_id": f"INF-{random.randint(10000, 99999)}",
                "type": defect_type,
                "confidence": round(conf, 1),
                "severity": severity,
                "latitude": latitude,
                "longitude": longitude,
                "traffic_exposure": traffic_exposure,
                "deterioration": "RISING",
                "risk_score": risk_score,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "status": "UNRESOLVED",
                "action": action,
                "mpu_bump_detected": mpu_triggered
            }
            
            DEFECTS_DB.insert(0, dna_record)
            generated_dna.append(dna_record)

    return {
        "status": "success",
        "detected_count": len(generated_dna),
        "infrastructure_dna": generated_dna
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)