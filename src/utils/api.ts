// src/utils/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DefectItem {
  defect_id: string;
  type: string;
  confidence: number;
  severity: string;
  latitude: number;
  longitude: number;
  traffic_exposure: string;
  deterioration: string;
  risk_score: number;
  timestamp: string;
  status: string;
  detected_at?: string;
  image_url?: string;
  action?: string;
  recommended_action?: string;
  location_name?: string;
  road_name?: string;
  dimensions?: { length_cm: number; width_cm: number; depth_cm: number };
  sensor_telemetry?: {
    accel_x_g: number;
    accel_y_g: number;
    accel_z_spike_g: number;
    ultrasonic_depth_cm: number;
  };
  bounding_box?: { x: number; y: number; width: number; height: number };
  work_order_id?: string;
  estimated_repair_cost_inr?: number;
}

export interface LiveTelemetryState {
  status: string;
  is_connected: boolean;
  telemetry: {
    is_connected: boolean;
    last_seen: string | null;
    latitude: number;
    longitude: number;
    traffic_exposure: string;
    ax: number;
    ay: number;
    az: number;
    ax_raw: number;
    ay_raw: number;
    az_raw: number;
    depth_cm: number;
    rover_speed_kmh: number;
    is_bump: boolean;
    battery_pct: number;
    heading_deg: number;
    gps_satellites: number;
    source: string;
  };
  latest_defect: DefectItem | null;
  server_time: string;
}

// Fetch stats for dashboard widgets
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using fallback stats');
    return null;
  }
}

// Fetch defect list for Map and Table
export async function fetchDefects(): Promise<DefectItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/defects`);
    if (!res.ok) throw new Error('Failed to fetch defects');
    const data = await res.json();
    return data.defects;
  } catch (error) {
    console.warn('Backend unavailable, returning empty defect list');
    return [];
  }
}

// Fetch live rover telemetry from hardware (ESP32 -> Backend -> Frontend)
export async function fetchLiveTelemetry(): Promise<LiveTelemetryState | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return await res.json();
  } catch (error) {
    console.warn('Telemetry unavailable');
    return null;
  }
}

// Upload road image to Python AI model
export async function uploadInspectionImage(imageFile: File, lat = 12.9249, lng = 80.1000) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('latitude', lat.toString());
  formData.append('longitude', lng.toString());
  formData.append('traffic_exposure', 'HIGH');

  const res = await fetch(`${API_BASE_URL}/api/inspect`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Inspection upload failed');
  return await res.json();
}

// Reset defects DB to clean Expo baseline
export async function resetDefectsDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/defects/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    return await res.json();
  } catch (error) {
    console.warn('Reset unavailable');
    return null;
  }
}

// Sync live GPS location from device / browser directly to backend
export async function syncLiveLocation(latitude: number, longitude: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rover/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Capture camera frame and submit to backend AI inspection
export async function captureAndInspectFrame(
  imageBlob: Blob | File,
  latitude: number,
  longitude: number,
  mpu?: { ax: number; ay: number; az: number },
  depthCm = 9.2,
  forceCapture = true
) {
  const formData = new FormData();
  formData.append('image', imageBlob, 'capture.jpg');
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());
  formData.append('traffic_exposure', 'HIGH');
  formData.append('ax', (mpu?.ax ?? 0.05).toString());
  formData.append('ay', (mpu?.ay ?? -0.08).toString());
  formData.append('az', (mpu?.az ?? 1.02).toString());
  formData.append('depth_cm', depthCm.toString());
  if (forceCapture) {
    formData.append('force_capture', 'true');
  }

  const res = await fetch(`${API_BASE_URL}/api/inspect`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Capture and inspection upload failed');
  return await res.json();
}