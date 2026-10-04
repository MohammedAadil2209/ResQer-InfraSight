import cv2
import requests
import time

# Mobile phone IP Webcam video stream URL
STREAM_URL = "http://192.168.29.224:8080/video"
BACKEND_URL = "http://localhost:8000/api/inspect"

print(f"📡 Connecting to Mobile Camera at {STREAM_URL}...")
cap = cv2.VideoCapture(STREAM_URL)

if not cap.isOpened():
    print("❌ Connection failed! Make sure your laptop and phone are on the same Wi-Fi.")
    exit()

print("✅ Connected to Mobile Camera Stream!")
print("Press 'q' on the preview window to stop streaming.")

last_sent = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Waiting for video frame...")
        time.sleep(0.1)
        continue

    # Live preview window on laptop screen
    cv2.imshow("ResQer Mobile Camera Stream Test", frame)

    # Analyze frame with AI backend every 3 seconds
    if time.time() - last_sent > 3.0:
        last_sent = time.time()
        
        # Save snapshot
        cv2.imwrite("temp_mobile_frame.jpg", frame)

        payload = {
            "latitude": 12.9249,
            "longitude": 80.1000,
            "traffic_exposure": "HIGH",
            "ax": 0.0, 
            "ay": 0.0, 
            "az": 1.0
        }

        try:
            with open("temp_mobile_frame.jpg", "rb") as img:
                res = requests.post(BACKEND_URL, data=payload, files={"image": img})
                print(f"📸 Frame sent to AI Engine | Status: {res.status_code}")
        except Exception as e:
            print(f"⚠️ Error sending frame to backend: {e}")

    # Press 'q' to stop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()