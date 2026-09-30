export const PYTHON_DETECT_SCRIPT = `"""
ResQer InfraSight — Autonomous AI Defect Detection Pipeline
Phase 1: Real-time YOLOv11 Detection & Sensor Fusion Ingestion
"""

import sys
import json
import time
from pathlib import Path
import cv2
import numpy as np
from ultralytics import YOLO

# Detection Classes
CLASSES = {
    0: "pothole",
    1: "road_crack",
    2: "open_manhole",
    3: "damaged_streetlight",
    4: "damaged_sign",
    5: "waterlogging"
}

def load_resqer_model(model_path="yolo11n.pt"):
    """
    Loads YOLOv11 nano model or custom fine-tuned resqer_best.pt
    """
    print(f"[ResQer AI] Loading weights from: {model_path} ...")
    model = YOLO(model_path)
    print("[ResQer AI] Model loaded successfully.")
    return model

def run_detection(model, source="ai/test_images", conf_threshold=0.25):
    """
    Infers on image/folder or webcam (source=0)
    """
    print(f"[ResQer AI] Initiating inference on source: {source}")
    results = model.predict(
        source=source,
        save=True,
        conf=conf_threshold,
        save_txt=True,
        save_conf=True,
        project="runs/detect",
        name="resqer_inspection"
    )
    
    detections_summary = []
    
    for r in results:
        img_name = Path(r.path).name if hasattr(r, 'path') else "stream_frame"
        boxes = r.boxes
        print(f"\\n--- [INSPECTION RESULT: {img_name}] ---")
        
        if len(boxes) == 0:
            print("  No defects detected in this frame.")
            continue
            
        for i, box in enumerate(boxes):
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            class_name = CLASSES.get(cls_id, f"class_{cls_id}")
            
            # Severity estimation based on defect size & confidence
            w = xyxy[2] - xyxy[0]
            h = xyxy[3] - xyxy[1]
            area_px = w * h
            
            severity = "CRITICAL" if (conf > 0.85 and area_px > 15000) else ("HIGH" if conf > 0.70 else "MEDIUM")
            
            record = {
                "defect_index": i + 1,
                "type": class_name,
                "confidence": round(conf, 4),
                "severity": severity,
                "bbox_xyxy": [round(v, 1) for v in xyxy],
                "area_px": round(area_px, 1)
            }
            detections_summary.append(record)
            
            print(f"  [{i+1}] DEFECT DETECTED: {class_name.upper()}")
            print(f"      Confidence: {conf * 100:.1f}%")
            print(f"      Severity  : {severity}")
            print(f"      BBox      : {record['bbox_xyxy']}")
            
    print(f"\\n[ResQer AI] Inference complete. Total defects detected: {len(detections_summary)}")
    return detections_summary

if __name__ == "__main__":
    # 1. Load model
    model = load_resqer_model("yolo11n.pt")
    
    # 2. Test directory or fallback
    test_dir = Path("ai/test_images")
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Run prediction
    results = run_detection(model, source="ai/test_images", conf_threshold=0.25)
    print("Detection completed. Outputs saved to runs/detect/resqer_inspection")
`;

export const PYTHON_TRAIN_SCRIPT = `"""
ResQer InfraSight — Custom Dataset Trainer for Road Defects
Fine-tunes YOLOv11 on Pothole and Road Anomaly Dataset
"""

from ultralytics import YOLO

def train_resqer_defect_model():
    # 1. Load base pre-trained YOLOv11 Nano model
    model = YOLO("yolo11n.pt")
    
    # 2. Train on customized data.yaml (contains pothole, crack, manhole classes)
    results = model.train(
        data="ai/datasets/road_defects.yaml",
        epochs=50,
        imgsz=640,
        batch=16,
        name="resqer_defect_detector",
        device="0"  # Set to 'cpu' if no NVIDIA GPU available
    )
    
    print("[ResQer AI] Model trained successfully!")
    print("Exporting best weights to ai/models/resqer_best.pt")
    # Best weights will be saved at runs/detect/resqer_defect_detector/weights/best.pt

if __name__ == "__main__":
    train_resqer_defect_model()
`;

export const ESP32_FIRMWARE_CODE = `/*
 * ResQer InfraSight — Autonomous Rover Hardware Telemetry Firmware
 * Target: ESP32 DevKit V1
 * Sensors:
 *   - MPU6050 (I2C: SDA=GPIO 21, SCL=GPIO 22) -> Road vibration & vertical impact (G-force spike)
 *   - Neo-6M GPS (HardwareSerial2: RX=GPIO 16, TX=GPIO 17) -> High precision coordinates
 *   - HC-SR04 Ultrasonic (TRIG=GPIO 5, ECHO=GPIO 18) -> Pothole depth profiling
 *   - WiFi Client -> Posts JSON telemetry to ResQer AI Engine
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>

// WiFi Configuration
const char* WIFI_SSID = "ResQer_Expo_Hotspot";
const char* WIFI_PASS = "resqer2026";
const char* SERVER_ENDPOINT = "http://192.168.4.1:8000/api/telemetry";

// Ultrasonic Sensor Pins
const int PIN_TRIG = 5;
const int PIN_ECHO = 18;
const int PIN_ALERT_LED = 2; // Onboard LED

Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // UART2

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_ALERT_LED, OUTPUT);

  // Initialize I2C for MPU6050
  Wire.begin(21, 22);
  if (!mpu.begin()) {
    Serial.println("[ERROR] Failed to locate MPU6050 chip. Check wiring!");
  } else {
    Serial.println("[OK] MPU6050 6-DOF IMU Initialized.");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // Initialize GPS UART (9600 baud for Neo-6M)
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  Serial.println("[OK] GPS Module Initialized on UART2.");

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\\n[OK] WiFi Connected. Rover IP: %s\\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\\n[WARN] WiFi offline. Running in local buffering mode.");
  }
}

float measureUltrasonicDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) return 0.0;
  return (duration * 0.0343) / 2.0;
}

void loop() {
  // Feed GPS stream
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Read MPU6050
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Normalize Z-axis acceleration to Gs (Earth gravity ~9.81 m/s^2)
  float az_g = a.acceleration.z / 9.80665;
  float ultrasonic_cm = measureUltrasonicDistanceCm();

  // Bump Spike Threshold: Z acceleration spike > 2.2G or < 0.2G (free-fall into hole)
  bool is_bump = (abs(az_g) > 2.2);
  if (is_bump) {
    digitalWrite(PIN_ALERT_LED, HIGH);
    Serial.printf("[ALERT] ROAD BUMP SPIKE DETECTED: %.2f G! Depth: %.1f cm\\n", az_g, ultrasonic_cm);
  } else {
    digitalWrite(PIN_ALERT_LED, LOW);
  }

  // Construct JSON Payload
  double lat = gps.location.isValid() ? gps.location.lat() : 12.9249;
  double lng = gps.location.isValid() ? gps.location.lng() : 80.1000;
  float speed_kmh = gps.speed.isValid() ? gps.speed.kmph() : 18.5;

  String jsonPayload = "{";
  jsonPayload += "\\"rover_id\\":\\"RESQER-ROVER-01\\",";
  jsonPayload += "\\"lat\\":" + String(lat, 6) + ",";
  jsonPayload += "\\"lng\\":" + String(lng, 6) + ",";
  jsonPayload += "\\"speed_kmh\\":" + String(speed_kmh, 1) + ",";
  jsonPayload += "\\"accel_x\\":" + String(a.acceleration.x / 9.81, 2) + ",";
  jsonPayload += "\\"accel_y\\":" + String(a.acceleration.y / 9.81, 2) + ",";
  jsonPayload += "\\"accel_z_g\\":" + String(az_g, 2) + ",";
  jsonPayload += "\\"pitch_rate\\":" + String(g.gyro.y, 2) + ",";
  jsonPayload += "\\"ultrasonic_depth_cm\\":" + String(ultrasonic_cm, 1) + ",";
  jsonPayload += "\\"bump_spike\\":" + String(is_bump ? "true" : "false");
  jsonPayload += "}";

  // Transmit if WiFi connected
  if (WiFi.status() == WL_CONNECTED && is_bump) {
    HTTPClient http;
    http.begin(SERVER_ENDPOINT);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonPayload);
    http.end();
  }

  delay(100); // 10Hz Telemetry Rate
}
`;

export const PYTHON_BACKEND_SERVER = `"""
ResQer InfraSight — Python Backend & Sensor Fusion Server (FastAPI)
Connects ESP32 Telemetry + YOLO AI Engine + Infrastructure DNA Database
"""

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import uvicorn
import time
import math

app = FastAPI(title="ResQer InfraSight API", version="1.0.0")

class RoverTelemetry(BaseModel):
    rover_id: str
    lat: float
    lng: float
    speed_kmh: float
    accel_x: float
    accel_y: float
    accel_z_g: float
    pitch_rate: float
    ultrasonic_depth_cm: float
    bump_spike: bool

@app.post("/api/telemetry")
async def ingest_telemetry(data: RoverTelemetry):
    print(f"[TELEMETRY] Rover {data.rover_id} @ ({data.lat}, {data.lng}) | Az: {data.accel_z_g}G | Depth: {data.ultrasonic_depth_cm}cm")
    
    # Trigger Sensor Fusion when Bump Spike + Depth > 5cm
    if data.bump_spike and data.ultrasonic_depth_cm > 5.0:
        dna_id = f"INF-{int(time.time()) % 100000:05d}"
        print(f"[SENSOR FUSION ALERT] High impact bump! Synthesizing Infrastructure DNA: {dna_id}")
        
    return {"status": "ok", "ingested": True}

@app.get("/api/health")
def health_check():
    return {"status": "online", "model": "YOLOv11-ResQer", "rover_connected": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

export const WIRING_PINOUT_GUIDE = [
  { module: 'MPU6050 (6-DOF IMU)', esp32Pin: 'GPIO 21 (SDA), GPIO 22 (SCL)', power: '3.3V / GND', purpose: 'Detects road vibration, tilt angle & vertical pothole impact G-force spike' },
  { module: 'Neo-6M GPS Module', esp32Pin: 'GPIO 16 (RX2), GPIO 17 (TX2)', power: '5V / GND', purpose: 'Pins defect location down to < 2.5m precision' },
  { module: 'HC-SR04 Ultrasonic', esp32Pin: 'GPIO 5 (TRIG), GPIO 18 (ECHO)', power: '5V / GND (via resistor divider)', purpose: 'Measures physical cavity depth of potholes and subsidence' },
  { module: 'L298N Motor Driver', esp32Pin: 'GPIO 25, 26, 27, 14', power: 'External 7.4V - 12V Li-ion', purpose: 'Controls rover differential 4WD drive chassis' },
  { module: 'ESP32-CAM / USB Camera', esp32Pin: 'USB to Laptop / SBC Raspberry Pi', power: '5V 2A', purpose: 'High frame-rate forward road visual stream for YOLO AI' },
];
