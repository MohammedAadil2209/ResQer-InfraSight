import time
import requests
import random

API_URL = "http://localhost:8000/api/inspect"
TEST_IMAGE_PATH = "ai/test_images/road.jpg"  # Ensure you have a road sample image here

print("🚗 ResQer Inspection Rover Telemetry Active...")

# Route simulation coordinates (Chennai region)
route = [
    (12.9249, 80.1000),
    (12.9255, 80.1012),
    (12.9261, 80.1025),
    (12.9270, 80.1038),
]

for i, (lat, lng) in enumerate(route):
    # Simulate occasional MPU6050 accelerometer spike (bump detected)
    bump = random.choice([True, False, False])
    az = 3.4 if bump else 1.0
    
    payload = {
        "latitude": lat,
        "longitude": lng,
        "traffic_exposure": "HIGH",
        "ax": 0.1,
        "ay": 0.2,
        "az": az
    }
    
    try:
        with open(TEST_IMAGE_PATH, "rb") as img:
            files = {"image": img}
            res = requests.post(API_URL, data=payload, files=files)
            print(f"📍 Ping {i+1}: Location ({lat}, {lng}) | MPU Bump: {bump} | Status: {res.status_code}")
    except Exception as e:
        print(f"⚠️ Simulator check: {e}")
        
    time.sleep(3)