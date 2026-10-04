import cv2
import requests
import time
import threading
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

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


def get_hardware_telemetry():
    """Fetch latest ESP32 MPU/GPS data from backend telemetry state."""
    try:
        r = requests.get("http://localhost:8000/api/telemetry", timeout=1.0)
        if r.ok:
            data = r.json()
            t = data.get("telemetry", {})
            return {
                "latitude": t.get("latitude", 12.9257),
                "longitude": t.get("longitude", 80.1005),
                "traffic_exposure": t.get("traffic_exposure", "HIGH"),
                "ax": str(t.get("ax", 0.05)),
                "ay": str(t.get("ay", -0.08)),
                "az": str(t.get("az", 1.02)),
                "depth_cm": str(t.get("depth_cm", 9.2)),
            }
    except Exception:
        pass
    # Fallback when hardware is offline
    return {
        "latitude": 12.9257,
        "longitude": 80.1005,
        "traffic_exposure": "HIGH",
        "ax": "0.05",
        "ay": "-0.08",
        "az": "1.02",
        "depth_cm": "9.2",
    }


print("🚀 Starting Low-Latency Mobile Stream...")
cam = FastCamStream(STREAM_URL).start()
time.sleep(1.0) # Warmup

last_analysis_time = 0

while True:
    frame = cam.read()
    if frame is None:
        continue

    # Draw Telemetry and Control HUD on OpenCV preview
    display_frame = frame.copy()
    telemetry = get_hardware_telemetry()
    cv2.putText(display_frame, "RESQER LIVE CAMERA BRIDGE", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv2.putText(display_frame, f"GPS: {telemetry['latitude']:.4f}N, {telemetry['longitude']:.4f}E | MPU Z: {telemetry['az']}G", (15, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)
    cv2.putText(display_frame, "[SPACE / C] Capture Defect | [Q] Quit", (15, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

    # Show smooth real-time preview
    cv2.imshow("ResQer Ultra-Fast Camera Bridge", display_frame)

    # Keypress controls
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        cam.stop()
        break
    elif key in [32, ord('c')]:  # Spacebar or 'C' key
        print("📸 MANUAL CAPTURE TRIGGERED! Sending frame to ResQer AI engine...")
        _, cap_buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        cap_payload = {
            "latitude": telemetry["latitude"],
            "longitude": telemetry["longitude"],
            "traffic_exposure": telemetry["traffic_exposure"],
            "ax": telemetry["ax"],
            "ay": telemetry["ay"],
            "az": telemetry["az"],
            "depth_cm": telemetry["depth_cm"],
            "force_capture": "true",
        }
        def send_manual(jpg_b):
            try:
                files = {"image": ("manual_capture.jpg", jpg_b.tobytes(), "image/jpeg")}
                res = requests.post(BACKEND_URL, data=cap_payload, files=files, timeout=3.0)
                print(f"✅ MANUAL CAPTURE LOGGED | Status: {res.status_code}")
            except Exception as e:
                print(f"Manual capture error: {e}")
        threading.Thread(target=send_manual, args=(cap_buffer,), daemon=True).start()

    # Background AI stream sync every 1.2 seconds
    if time.time() - last_analysis_time > 1.2:
        last_analysis_time = time.time()
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        
        payload = {
            "latitude": telemetry["latitude"],
            "longitude": telemetry["longitude"],
            "traffic_exposure": telemetry["traffic_exposure"],
            "ax": telemetry["ax"],
            "ay": telemetry["ay"],
            "az": telemetry["az"],
            "depth_cm": telemetry["depth_cm"],
        }

        def send_frame(jpg_buffer):
            try:
                files = {"image": ("frame.jpg", jpg_buffer.tobytes(), "image/jpeg")}
                res = requests.post(BACKEND_URL, data=payload, files=files, timeout=1.5)
            except Exception:
                pass

        threading.Thread(target=send_frame, args=(buffer,), daemon=True).start()

cv2.destroyAllWindows()