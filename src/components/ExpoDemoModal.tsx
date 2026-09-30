import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Cpu, 
  Activity, 
  MapPin, 
  Layers, 
  Dna, 
  AlertTriangle, 
  CheckCircle,
  Truck,
  Wrench,
  Sparkles
} from 'lucide-react';
import { InfrastructureDNA } from '../types';

interface ExpoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteDemo: (dna: InfrastructureDNA) => void;
}

export const ExpoDemoModal: React.FC<ExpoDemoModalProps> = ({
  isOpen,
  onClose,
  onCompleteDemo,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const totalSteps = 10;

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, totalSteps]);

  if (!isOpen) return null;

  const demoDNA: InfrastructureDNA = {
    defect_id: 'INF-00001',
    type: 'pothole',
    confidence: 0.962,
    severity: 'CRITICAL',
    latitude: 12.9249,
    longitude: 80.1000,
    location_name: 'Guindy Industrial Estate, Sector 3',
    road_name: 'Inner Ring Road / GST Flyover Ramp',
    traffic_exposure: 'HIGH',
    deterioration: 'RISING',
    risk_score: 87,
    dimensions: {
      length_cm: 64,
      width_cm: 48,
      depth_cm: 9.2,
    },
    sensor_telemetry: {
      accel_x_g: 0.12,
      accel_y_g: -0.28,
      accel_z_spike_g: 3.42,
      gyro_pitch_rate: 14.8,
      gyro_roll_rate: -6.2,
      ultrasonic_depth_cm: 9.4,
      rover_speed_kmh: 18.5,
      heading_deg: 42.1,
      timestamp: new Date().toISOString(),
    },
    risk_breakdown: {
      severity: 90,
      traffic_exposure: 85,
      population_exposure: 80,
      safety_risk: 95,
      deterioration: 75,
    },
    recommended_action: 'Immediate maintenance required. Deploy rapid patch crew & barrier cordon within 4 hours.',
    status: 'REPORTED',
    detected_at: new Date().toLocaleTimeString(),
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    bounding_box: { x: 26, y: 35, width: 48, height: 38 },
    work_order_id: 'WO-2026-8812',
    estimated_repair_cost_inr: 4500,
  };

  const stepsData = [
    {
      step: 1,
      title: 'ROVER MOVES',
      tag: 'HARDWARE TELEMETRY',
      icon: <Truck className="w-6 h-6 text-cyan-400" />,
      color: 'cyan',
      description: 'Autonomous inspection rover patrols assigned sector at 18.5 km/h. Optical camera, MPU6050 6-DOF IMU, ultrasonic transducer, and GPS Neo-6M stream synchronized telemetry at 10Hz.',
      judgeNote: 'Judges: Explain that the rover continuously scans roads autonomously, eliminating slow and dangerous manual human inspection surveys.',
    },
    {
      step: 2,
      title: 'CAMERA SEES POTHOLE',
      tag: 'OPTICAL INGEST',
      icon: <Camera className="w-6 h-6 text-blue-400" />,
      color: 'blue',
      description: 'Forward monocular camera captures asphalt surface at 60 FPS. Frame buffer identifies high contrast visual surface disruption 3.2 meters ahead of rover chassis.',
      judgeNote: 'Judges: Mention that high-definition video frames are streamed directly to the onboard edge compute module for inference.',
    },
    {
      step: 3,
      title: 'YOLO DETECTS IT',
      tag: 'EDGE AI INFERENCE',
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      color: 'purple',
      description: 'Custom fine-tuned YOLOv11 deep neural network infers over the frame in 18ms. Object classified as "POTHOLE" with 96.2% confidence and precise bounding box coordinates.',
      judgeNote: 'Judges: Explain how YOLOv11 allows real-time edge processing without requiring cloud GPU dependency during patrol.',
    },
    {
      step: 4,
      title: 'MPU6050 DETECTS BUMP',
      tag: 'INERTIAL SHOCK SENSING',
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      color: 'amber',
      description: 'As the rover traverses the depression, the MPU6050 accelerometer registers a sharp Z-axis vertical acceleration shock of +3.42 G and pitch tremor of 14.8°/s.',
      judgeNote: 'Judges: Highlight that camera alone has optical illusions (shadows, oil stains); physical vibration sensor confirms true road roughness!',
    },
    {
      step: 5,
      title: 'GPS RECORDS LOCATION',
      tag: 'GEOSPATIAL TAGGING',
      icon: <MapPin className="w-6 h-6 text-emerald-400" />,
      color: 'emerald',
      description: 'u-blox Neo-6M GPS latches satellite lock, recording precise coordinates: Latitude 12.9249° N, Longitude 80.1000° E (Guindy Industrial Estate, Chennai).',
      judgeNote: 'Judges: Precise geofencing enables automated road contractor work orders and pinpoint location dispatch without manual survey crews.',
    },
    {
      step: 6,
      title: 'SENSOR FUSION',
      tag: 'MULTI-MODAL CORRELATION',
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      color: 'indigo',
      description: 'Sensor Fusion Engine correlates optical confidence (96.2%), accelerometer spike (3.42G), and ultrasonic depth echo (9.4 cm). False-positive probability reduced to < 0.3%.',
      judgeNote: 'Judges: THIS is your core innovation! Sensor fusion eliminates shadows, puddles, and painted road markers from falsely triggering repairs.',
    },
    {
      step: 7,
      title: 'INFRASTRUCTURE DNA CREATED',
      tag: 'DIGITAL TWIN SYNTHESIS',
      icon: <Dna className="w-6 h-6 text-pink-400" />,
      color: 'pink',
      description: 'A standardized, cryptographic Infrastructure DNA record (INF-00001) is minted containing exact dimensions, bump vectors, traffic class, and geotag.',
      judgeNote: 'Judges: Infrastructure DNA creates a permanent digital passport for every crack and pothole, tracking deterioration history over months.',
    },
    {
      step: 8,
      title: 'RISK = 87 / 100',
      tag: 'DYNAMIC RISK ENGINE',
      icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
      color: 'rose',
      description: 'Algorithmic Risk Engine evaluates Severity (90), Traffic Exposure (85), Population (80), Safety Hazard (95), and Deterioration (75) = Composite Risk Score: 87 (CRITICAL).',
      judgeNote: 'Judges: Explain that not all potholes are equal — a pothole near a school bus route or high-speed flyover is prioritized over a remote lane.',
    },
    {
      step: 9,
      title: 'AI PRIORITIZES IT',
      tag: 'AUTONOMOUS QUEUING',
      icon: <Sparkles className="w-6 h-6 text-amber-300" />,
      color: 'amber',
      description: 'ResQer AI automatically elevates INF-00001 to Rank #1 in the municipal emergency maintenance queue, surpassing 1,246 other recorded road defects.',
      judgeNote: 'Judges: Automates bureaucratic triage — emergency hazards get immediate attention rather than sitting on a desk.',
    },
    {
      step: 10,
      title: 'IMMEDIATE MAINTENANCE',
      tag: 'MUNICIPAL ACTION DISPATCH',
      icon: <Wrench className="w-6 h-6 text-emerald-400" />,
      color: 'emerald',
      description: 'High-priority Work Order WO-2026-8812 is generated and transmitted to the Highways Department. Rapid asphalt crew dispatched with an SLA of 4 hours.',
      judgeNote: 'Judges: Closes the entire autonomous loop: from robotic wheel on road to contractor patch crew on site!',
    },
  ];

  const currentStepData = stepsData[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ResQer InfraSight — Live Expo Demonstration
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  PHASE 1–6 END-TO-END FLOW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                10-Step Autonomous Pipeline: Rover Movement → Sensor Fusion → Work Order
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Step Progress Stepper Bar */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[650px] gap-1">
            {stepsData.map((s) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`flex flex-col items-center gap-1 group transition ${
                  currentStep === s.step
                    ? 'opacity-100 scale-105'
                    : currentStep > s.step
                    ? 'opacity-80'
                    : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition ${
                    currentStep === s.step
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-md shadow-amber-500/50'
                      : currentStep > s.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > s.step ? '✓' : s.step}
                </div>
                <span className="text-[10px] font-mono whitespace-nowrap text-slate-300">
                  {s.title.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Step Demonstration Showcase Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner of the Active Step */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-inner">
                {currentStepData.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    STEP {currentStep} OF {totalSteps}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    {currentStepData.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-wide text-white">
                  {currentStepData.title}
                </h3>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              Target ID: <span className="text-amber-400 font-bold">INF-00001</span>
              <div>Guindy Sector 3, Chennai</div>
            </div>
          </div>

          {/* Interactive Visual Canvas depending on Step */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Visual Screen / Graphic */}
            <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-center min-h-[260px]">
              {/* Step 1: Rover Moving */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>SECTOR: CHENNAI_GUINDY_04</span>
                    <span className="text-emerald-400 animate-pulse">● MOTOR DRIVER ACTIVE</span>
                  </div>
                  <div className="h-36 bg-slate-900/80 rounded-lg border border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 animate-[pulse_2s_infinite]" />
                    <Truck className="w-12 h-12 text-cyan-400 animate-bounce relative z-10" />
                    <div className="mt-2 text-sm font-mono font-bold text-white relative z-10">
                      Rover Speed: <span className="text-cyan-400">18.5 km/h</span> | Heading: 42° NE
                    </div>
                    <div className="text-xs font-mono text-slate-400 relative z-10">
                      ESP32 Wi-Fi Telemetry Stream: 10 Hz
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 & 3: Camera & YOLO Detection */}
              {(currentStep === 2 || currentStep === 3) && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src={demoDNA.image_url}
                    alt="Road inspection"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                  {/* Camera reticle overlay */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                    CAM_01: 1080p @ 60 FPS
                  </div>

                  {/* Step 3: YOLO Bounding Box */}
                  {currentStep === 3 && (
                    <div
                      className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-lg animate-in zoom-in-95 duration-200"
                      style={{
                        left: `${demoDNA.bounding_box.x}%`,
                        top: `${demoDNA.bounding_box.y}%`,
                        width: `${demoDNA.bounding_box.width}%`,
                        height: `${demoDNA.bounding_box.height}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 px-2 py-0.5 bg-red-600 text-white font-mono text-[11px] font-bold rounded flex items-center gap-1.5 shadow">
                        <span>POTHOLE</span>
                        <span className="text-amber-200">96.2%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: MPU6050 Bump Shock */}
              {currentStep === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">MPU6050 INERTIAL OSCILLOSCOPE</span>
                    <span className="text-red-400 font-bold animate-pulse">
                      VERTICAL SPIKE: +3.42 G (THRESHOLD &gt; 2.2G)
                    </span>
                  </div>
                  {/* Waveform representation */}
                  <div className="h-44 bg-slate-900 rounded-lg border border-slate-800 p-3 flex flex-col justify-end relative overflow-hidden">
                    <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500">
                      Z-Axis Acceleration Profile (G-force vs Time)
                    </div>
                    {/* SVG Shock Waveform */}
                    <svg className="w-full h-28" viewBox="0 0 300 80" preserveAspectRatio="none">
                      <path
                        d="M 0,40 L 40,40 L 80,41 L 110,39 L 130,40 L 140,10 L 150,75 L 160,18 L 170,55 L 185,38 L 220,40 L 300,40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                      <span>Baseline: 1.02G</span>
                      <span className="text-red-400 font-bold">Peak Bump: +3.42G @ t+140ms</span>
                      <span>Damped</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: GPS Lock */}
              {currentStep === 5 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>u-blox NEO-6M SATELLITE FIX</span>
                    <span className="text-emerald-400">11 SATELLITES LOCKED</span>
                  </div>
                  <div className="h-44 bg-slate-900 rounded-lg border border-emerald-500/40 p-4 flex flex-col justify-center items-center text-center space-y-2">
                    <MapPin className="w-10 h-10 text-emerald-400 animate-bounce" />
                    <div className="text-xl font-mono font-bold text-white">
                      12.9249° N, 80.1000° E
                    </div>
                    <div className="text-xs text-slate-300">
                      Guindy Industrial Estate, Sector 3, Inner Ring Road, Chennai
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      Geofence Radial Accuracy: ± 1.8 meters
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Sensor Fusion */}
              {currentStep === 6 && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-indigo-300">
                    MULTI-MODAL SENSOR FUSION ENGINE
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-slate-900 rounded border border-blue-500/40">
                      <div className="text-[10px] font-mono text-slate-400">OPTICAL AI</div>
                      <div className="text-base font-bold text-blue-400">96.2%</div>
                      <div className="text-[10px] text-slate-400">YOLO Pothole</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-amber-500/40">
                      <div className="text-[10px] font-mono text-slate-400">IMU BUMP</div>
                      <div className="text-base font-bold text-amber-400">+3.42 G</div>
                      <div className="text-[10px] text-slate-400">Vertical Shock</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-cyan-500/40">
                      <div className="text-[10px] font-mono text-slate-400">ULTRASONIC</div>
                      <div className="text-base font-bold text-cyan-400">9.4 cm</div>
                      <div className="text-[10px] text-slate-400">Cavity Depth</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 text-center font-mono">
                    ✓ Cross-Validated: Physical Shock matches Visual Hole Bounding Box!
                  </div>
                </div>
              )}

              {/* Step 7: Infrastructure DNA Created */}
              {currentStep === 7 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-pink-400 flex items-center gap-1">
                      <Dna className="w-3.5 h-3.5" />
                      INFRASTRUCTURE DNA MINTED
                    </span>
                    <span className="text-slate-400">DIGITAL TWIN #INF-00001</span>
                  </div>
                  <pre className="p-3 rounded bg-slate-900 border border-pink-500/40 text-[11px] font-mono text-pink-200 overflow-x-auto leading-relaxed">
{`{
  "defect_id": "INF-00001",
  "type": "pothole",
  "confidence": 0.962,
  "severity": "HIGH",
  "latitude": 12.9249,
  "longitude": 80.1000,
  "traffic_exposure": "HIGH",
  "deterioration": "RISING",
  "risk_score": 87
}`}
                  </pre>
                </div>
              )}

              {/* Step 8: Risk Engine Score */}
              {currentStep === 8 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">MULTI-FACTOR WEIGHTED RISK SCORE</span>
                    <span className="text-red-400 font-bold">87 / 100 — CRITICAL</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Severity (Weight 25%): 90</span>
                      <span>= 22.5</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Traffic Exposure (Weight 20%): 85</span>
                      <span>= 17.0</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Population Exposure (Weight 15%): 80</span>
                      <span>= 12.0</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Safety Hazard (Weight 25%): 95</span>
                      <span>= 23.75</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Deterioration Rate (Weight 15%): 75</span>
                      <span>= 11.25</span>
                    </div>
                    <div className="border-t border-slate-700 pt-1.5 flex justify-between font-bold text-red-400 text-sm">
                      <span>TOTAL RISK SCORE</span>
                      <span>87 / 100 (CRITICAL)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 9: AI Prioritization */}
              {currentStep === 9 && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-amber-300">
                    MUNICIPAL QUEUE TRIAGE ENGINE
                  </div>
                  <div className="p-3 bg-red-950/40 rounded border border-red-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white font-mono font-bold flex items-center justify-center">
                        #1
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">INF-00001 (Guindy Flyover)</div>
                        <div className="text-xs text-red-300 font-mono">Score: 87/100 • IMMEDIATE ACTION</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-red-600/30 text-red-300 text-xs font-mono font-bold">
                      TOP PRIORITY
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 opacity-60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#2</span>
                      <span className="text-slate-300">INF-00003 (OMR Rajiv Gandhi Salai)</span>
                    </div>
                    <span className="font-mono text-slate-400">Score: 72/100</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 opacity-40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#3</span>
                      <span className="text-slate-300">INF-00005 (Tambaram Sanatorium)</span>
                    </div>
                    <span className="font-mono text-slate-400">Score: 54/100</span>
                  </div>
                </div>
              )}

              {/* Step 10: Immediate Maintenance Action */}
              {currentStep === 10 && (
                <div className="space-y-3 text-center py-2">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    WORK ORDER DISPATCHED: WO-2026-8812
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Immediate maintenance alert triggered for Greater Chennai Highways Crew #4. High-performance asphalt patch mix & traffic diversion protocol deployed within 4-hour SLA.
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-600/50">
                    Loop Complete: 100% Autonomous from Rover to Road Crew
                  </div>
                </div>
              )}
            </div>

            {/* Explanation & Presentation Notes for the Student */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Step Description
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Presentation Cheat Sheet for the Expo Judges */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EXPO JUDGES PRESENTATION SCRIPT</span>
                </div>
                <p className="text-xs text-amber-200/90 italic leading-relaxed">
                  "{currentStepData.judgeNote}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Stepper Controls */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Auto-Run' : 'Auto Play Demo'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setIsPlaying(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Flow</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/30 transition"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onCompleteDemo(demoDNA);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Demo & View in DNA Explorer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
