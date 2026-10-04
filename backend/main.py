from datetime import datetime
import os
import random
import shutil
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="ResQer InfraSight Engine")

# Allow Vite frontend / local dashboard integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained YOLO weights
MODEL_PATH = "backend/best.pt"
model = YOLO(MODEL_PATH)

DEFECTS_DB = [{
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
    "action": "Immediate maintenance required",
    "telemetry": {"ax": 0.08, "ay": -0.03, "az": 1.00, "depth_cm": 8.8},
}]


@app.get("/api/dashboard/stats")
def get_stats():
  total = len(DEFECTS_DB)
  critical = sum(1 for d in DEFECTS_DB if d["severity"] == "CRITICAL")
  high = sum(1 for d in DEFECTS_DB if d["severity"] == "HIGH")
  resolved = sum(1 for d in DEFECTS_DB if d["status"] == "RESOLVED")
  return {
      "total_defects": total,
      "critical": critical,
      "high": high,
      "resolved": resolved,
  }


@app.get("/api/defects")
def get_defects():
  return {"defects": DEFECTS_DB}


@app.post("/api/inspect")
async def inspect_road(
    image: Optional[UploadFile] = File(None),
    latitude: float = Form(12.9249),
    longitude: float = Form(80.1000),
    traffic_exposure: str = Form("HIGH"),
    ax: float = Form(0.0),
    ay: float = Form(0.0),
    az: float = Form(1.0),
    depth_cm: float = Form(0.0),
):
  new_dna = []

  # Process image if provided by camera bridge
  if image and image.filename:
    os.makedirs("temp_uploads", exist_ok=True)
    temp_path = f"temp_uploads/{image.filename}"

    with open(temp_path, "wb") as buffer:
      shutil.copyfileobj(image.file, buffer)

    try:
      # Run YOLO prediction with lowered confidence threshold for sensitivity
      results = model.predict(source=temp_path, conf=0.05)

      for result in results:
        for box in result.boxes:
          conf = float(box.conf[0]) * 100
          cls_id = int(box.cls[0])
          raw_label = model.names[cls_id]

          # Incorporate depth sensor reading into risk scoring formula
          calculated_risk = int(conf * 0.5 + (depth_cm * 5) + 20)
          risk_score = min(max(calculated_risk, 10), 100)

          severity = (
              "CRITICAL"
              if risk_score > 80
              else ("HIGH" if risk_score > 60 else "MEDIUM")
          )

          dna = {
              "defect_id": f"INF-{random.randint(10000, 99999)}",
              "type": (
                  "pothole"
                  if raw_label not in ["pothole", "road_crack"]
                  else raw_label
              ),
              "confidence": round(conf, 1),
              "severity": severity,
              "latitude": latitude,
              "longitude": longitude,
              "traffic_exposure": traffic_exposure,
              "deterioration": "RISING",
              "risk_score": risk_score,
              "timestamp": datetime.utcnow().isoformat() + "Z",
              "status": "UNRESOLVED",
              "action": (
                  "Immediate repair"
                  if severity == "CRITICAL"
                  else "Schedule inspection"
              ),
              "telemetry": {
                  "ax": ax,
                  "ay": ay,
                  "az": az,
                  "depth_cm": depth_cm,
              },
          }
          DEFECTS_DB.insert(0, dna)
          new_dna.append(dna)
    finally:
      # Clean up temporary saved file
      if os.path.exists(temp_path):
        os.remove(temp_path)

  # Telemetry fallback: handle hardware spikes (accelerometer impact or depth reading)
  # Triggers when no visual bounding box was caught OR when image is omitted
  if not new_dna and (abs(az - 1.0) > 0.4 or depth_cm > 2.0 or abs(az) > 1.5):
    risk_score = min(int(abs(az) * 20 + depth_cm * 6 + 30), 100)
    severity = "CRITICAL" if risk_score > 75 else "HIGH"

    dna = {
        "defect_id": f"INF-{random.randint(10000, 99999)}",
        "type": "pothole" if depth_cm > 3.0 else "surface_anomaly",
        "confidence": 88.5,
        "severity": severity,
        "latitude": latitude,
        "longitude": longitude,
        "traffic_exposure": traffic_exposure,
        "deterioration": "RISING",
        "risk_score": risk_score,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "UNRESOLVED",
        "action": "Sensor-flagged structural anomaly",
        "telemetry": {"ax": ax, "ay": ay, "az": az, "depth_cm": depth_cm},
    }
    DEFECTS_DB.insert(0, dna)
    new_dna.append(dna)

  return {
      "status": "success",
      "infrastructure_dna": new_dna,
      "latest_telemetry": {
          "ax": ax,
          "ay": ay,
          "az": az,
          "depth_cm": depth_cm,
      },
  }


if __name__ == "__main__":
  import uvicorn

  uvicorn.run(app, host="0.0.0.0", port=8000)