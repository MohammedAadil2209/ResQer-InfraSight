import os
from ultralytics import YOLO


def train():
  # Load pretrained YOLOv8 Nano model
  model = YOLO("yolov8n.pt")

  print("🚀 Starting ResQer Pothole & Defect Model Training...")
  model.train(
      data="./dataset/data.yaml",
      epochs=30,  # 30 epochs is optimal for fine-tuning
      imgsz=640,
      batch=16,
      name="resqer_yolo_v1",
  )
  print("✅ Training complete!")


if __name__ == "__main__":
  train()