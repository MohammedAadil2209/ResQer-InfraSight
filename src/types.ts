export type DefectType = 
  | 'pothole'
  | 'road_crack'
  | 'open_manhole'
  | 'damaged_streetlight'
  | 'damaged_sign'
  | 'waterlogging';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TrafficExposure = 'LOW' | 'MEDIUM' | 'HIGH';
export type DeteriorationTrend = 'STABLE' | 'RISING' | 'ACCELERATING';
export type DefectStatus = 'REPORTED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';

export interface BoundingBox {
  x: number;      // % from left (0 to 100)
  y: number;      // % from top (0 to 100)
  width: number;  // % width
  height: number; // % height
}

export interface SensorTelemetry {
  accel_x_g: number;
  accel_y_g: number;
  accel_z_spike_g: number;  // Normal is ~1.0g, bump spike is 2.5g - 4.5g
  gyro_pitch_rate: number;
  gyro_roll_rate: number;
  ultrasonic_depth_cm: number;
  rover_speed_kmh: number;
  heading_deg: number;
  timestamp: string;
}

export interface RiskFactors {
  severity: number;           // 0 - 100
  traffic_exposure: number;   // 0 - 100
  population_exposure: number;// 0 - 100
  safety_risk: number;        // 0 - 100
  deterioration: number;      // 0 - 100
}

export interface RiskWeights {
  severity: number;
  traffic_exposure: number;
  population_exposure: number;
  safety_risk: number;
  deterioration: number;
}

export interface InfrastructureDNA {
  defect_id: string;
  type: DefectType;
  confidence: number;          // 0.0 - 1.0 (e.g. 0.962)
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  location_name: string;
  road_name: string;
  traffic_exposure: TrafficExposure;
  deterioration: DeteriorationTrend;
  risk_score: number;          // 0 - 100
  dimensions: {
    length_cm: number;
    width_cm: number;
    depth_cm: number;
  };
  sensor_telemetry: SensorTelemetry;
  risk_breakdown: RiskFactors;
  recommended_action: string;
  status: DefectStatus;
  detected_at: string;
  image_url: string;
  bounding_box: BoundingBox;
  work_order_id?: string;
  estimated_repair_cost_inr: number;
}

export interface RoverTelemetryState {
  is_connected: boolean;
  is_patrolling: boolean;
  battery_pct: number;
  rover_speed_kmh: number;
  latitude: number;
  longitude: number;
  heading_deg: number;
  current_mpu: {
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
  };
  ultrasonic_cm: number;
  gps_satellites: number;
  wifi_rssi_dbm: number;
  mode: 'AUTONOMOUS' | 'MANUAL' | 'EXPO_DEMO';
}

export interface ExpoDemoStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  highlightSensor: 'rover' | 'camera' | 'yolo' | 'mpu6050' | 'gps' | 'fusion' | 'dna' | 'risk' | 'dispatch';
}
