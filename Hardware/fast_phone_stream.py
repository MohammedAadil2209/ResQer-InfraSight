import cv2
import requests
import time
import threading

# Your Mobile IP Webcam Stream
STREAM_URL = "http://192.168.29.224:8080/video"
BACKEND_URL = "http://localhost:8000/api/inspect"

class FastCamStream:
    def __init__(self, src):
        self.cap = cv2.VideoCapture(src)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Keep buffer minimal to eliminate video lag
        self.ret, self.frame = self.cap.read()
        self.stopped = False

    def start(self):
        threading.Thread(target=self.update, args=(), daemon=True).start()
        return self

    def update(self):
        while not self.stopped:
            if not self.cap.isOpened():
                break
            self.ret, self.frame = self.cap.read()

    def read(self):
        return self.frame

    def stop(self):
        self.stopped = True
        self.cap.release()

print("🚀 Starting Low-Latency Mobile Stream...")
cam = FastCamStream(STREAM_URL).start()
time.sleep(1.0) # Warmup

last_analysis_time = 0

while True:
    frame = cam.read()
    if frame is None:
        continue

    # Show smooth real-time preview
    cv2.imshow("ResQer Ultra-Fast Camera Bridge", frame)

    # Process AI inference every 0.8 seconds (1.25 FPS AI rate)
    if time.time() - last_analysis_time > 0.8:
        last_analysis_time = time.time()

        # Encode frame directly in RAM memory (No slow disk write!)
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        
        payload = {
            "latitude": 12.9257,
            "longitude": 80.1005,
            "traffic_exposure": "HIGH",
            "ax": 0.05, "ay": -0.30, "az": 0.95
        }

        def send_frame(jpg_buffer):
            try:
                files = {"image": ("frame.jpg", jpg_buffer.tobytes(), "image/jpeg")}
                res = requests.post(BACKEND_URL, data=payload, files=files, timeout=1.5)
                print(f"⚡ Live Sync OK | Status: {res.status_code}")
            except Exception as e:
                print(f"⚠️ Sync timeout: {e}")

        # Send asynchronously so video preview never stutters
        threading.Thread(target=send_frame, args=(buffer,), daemon=True).start()

    if cv2.waitKey(1) & 0xFF == ord('q'):
        cam.stop()
        break

cv2.destroyAllWindows()  