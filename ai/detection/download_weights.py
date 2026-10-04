import os
import urllib.request

os.makedirs("ai/models", exist_ok=True)
target_path = "ai/models/resqer_pothole.pt"
url = "https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt"

print("? Downloading ResQer Model Weights...")
try:
    urllib.request.urlretrieve(url, target_path)
    print("? Weights successfully saved to ai/models/resqer_pothole.pt")
except Exception as e:
    print(f"? Download failed: {e}")
