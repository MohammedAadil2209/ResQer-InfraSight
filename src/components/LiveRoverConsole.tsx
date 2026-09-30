import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Activity, 
  Maximize2, 
  Layers, 
  Dna, 
  Radio, 
  Crosshair, 
  Check, 
  Compass,
  Zap,
  Info,
  MapPin
} from 'lucide-react';
import { InfrastructureDNA, RoverTelemetryState, DefectType } from '../types';
import { SAMPLE_TEST_IMAGES } from '../data/mockDefects';
import { calculateRiskScore, getSeverityTier, getRecommendedAction } from '../utils/riskEngine';

interface LiveRoverConsoleProps {
  roverState: RoverTelemetryState;
  onSimulateBump: () => void;
  onNewDefectMinted: (dna: InfrastructureDNA) => void;
}

export const LiveRoverConsole: React.FC<LiveRoverConsoleProps> = ({
  roverState,
  onSimulateBump,
  onNewDefectMinted,
}) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_TEST_IMAGES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showOpticalHeatmap, setShowOpticalHeatmap] = useState<boolean>(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [mintNotification, setMintNotification] = useState<string | null>(null);

  // MPU6050 Waveform History
  const [waveformHistory, setWaveformHistory] = useState<number[]>([1.0, 1.02, 0.98, 1.01, 1.0, 1.03, 0.99, 1.01, 1.0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mini Leaflet GPS Map Refs
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Mini Leaflet Map
  useEffect(() => {
    if (!miniMapRef.current || miniMapInstanceRef.current) return;

    const miniMap = L.map(miniMapRef.current, {
      center: [roverState.latitude, roverState.longitude],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-map-tiles',
      subdomains: 'abc',
    }).addTo(miniMap);

    const roverIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 rounded-full bg-cyan-400/40 animate-ping"></div>
        <div class="relative w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-[10px]">
          🚗
        </div>
      </div>
    `;
    const roverIcon = L.divIcon({
      html: roverIconHtml,
      className: 'custom-rover-pin',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([roverState.latitude, roverState.longitude], { icon: roverIcon }).addTo(miniMap);
    miniMarkerRef.current = marker;
    miniMapInstanceRef.current = miniMap;

    setTimeout(() => {
      miniMap.invalidateSize();
    }, 200);

    return () => {
      miniMap.remove();
      miniMapInstanceRef.current = null;
    };
  }, []);

  // Update Mini Leaflet Marker as Rover moves
  useEffect(() => {
    if (miniMarkerRef.current) {
      miniMarkerRef.current.setLatLng([roverState.latitude, roverState.longitude]);
    }
    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.panTo([roverState.latitude, roverState.longitude], { animate: false });
    }
  }, [roverState.latitude, roverState.longitude]);

  // Update waveform on MPU change
  useEffect(() => {
    setWaveformHistory((prev) => {
      const next = [...prev.slice(-35), roverState.current_mpu.az];
      return next;
    });
  }, [roverState.current_mpu.az]);

  // Draw Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline (1.0G)
    const baselineY = height * 0.65;
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Z-Axis Acceleration Waveform
    if (waveformHistory.length > 1) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = roverState.current_mpu.az > 2.0 ? '#ef4444' : '#10b981';
      ctx.beginPath();

      const step = width / (waveformHistory.length - 1);
      waveformHistory.forEach((val, idx) => {
        // Map 0G to 4G to canvas height
        const normalized = (val - 0.5) / 3.5;
        const y = height - (normalized * height * 0.85 + height * 0.1);
        const x = idx * step;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [waveformHistory, roverState.current_mpu.az]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string);
      setIsInferring(true);
      setTimeout(() => {
        setIsInferring(false);
      }, 600);
    };
    reader.readAsDataURL(file);
  };

  const currentDisplayImage = customImage || selectedSample.url;
  const currentConfidence = selectedSample.expectedConfidence;
  const currentType = selectedSample.type as DefectType;

  // Mint Infrastructure DNA from current view
  const handleMintDNA = () => {
    const rawBreakdown = {
      severity: selectedSample.severity === 'CRITICAL' ? 90 : 70,
      traffic_exposure: 85,
      population_exposure: 80,
      safety_risk: selectedSample.severity === 'CRITICAL' ? 95 : 72,
      deterioration: 75,
    };

    const riskScore = calculateRiskScore(rawBreakdown);
    const severityTier = getSeverityTier(riskScore);
    const defectId = `INF-${Math.floor(10000 + Math.random() * 90000)}`;

    const newDNA: InfrastructureDNA = {
      defect_id: defectId,
      type: currentType,
      confidence: currentConfidence,
      severity: severityTier,
      latitude: roverState.latitude,
      longitude: roverState.longitude,
      location_name: 'Guindy Industrial Sector, Near Flyover',
      road_name: 'GST Corridor Lane 1',
      traffic_exposure: 'HIGH',
      deterioration: 'RISING',
      risk_score: riskScore,
      dimensions: {
        length_cm: Math.round(50 + Math.random() * 25),
        width_cm: Math.round(35 + Math.random() * 20),
        depth_cm: selectedSample.bumpProfile.depth_cm,
      },
      sensor_telemetry: {
        accel_x_g: roverState.current_mpu.ax,
        accel_y_g: roverState.current_mpu.ay,
        accel_z_spike_g: roverState.current_mpu.az,
        gyro_pitch_rate: 12.4,
        gyro_roll_rate: -4.2,
        ultrasonic_depth_cm: selectedSample.bumpProfile.depth_cm,
        rover_speed_kmh: roverState.rover_speed_kmh,
        heading_deg: roverState.heading_deg,
        timestamp: new Date().toISOString(),
      },
      risk_breakdown: rawBreakdown,
      recommended_action: getRecommendedAction(riskScore, currentType),
      status: 'REPORTED',
      detected_at: new Date().toLocaleTimeString(),
      image_url: currentDisplayImage,
      bounding_box: selectedSample.box,
      work_order_id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      estimated_repair_cost_inr: riskScore > 80 ? 5500 : 3200,
    };

    onNewDefectMinted(newDNA);
    setMintNotification(`Infrastructure DNA #${defectId} synthesized & dispatched!`);
    setTimeout(() => setMintNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {mintNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold font-mono text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4" />
          <span>{mintNotification}</span>
        </div>
      )}

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual AI Detection Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            {/* Camera View Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-white font-bold">ROVER-CAM-01 [OPTICAL FEED]</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400">YOLOv11 Nano</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2 py-1 rounded text-[11px] font-sans border transition ${
                    showBoundingBoxes
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  BBoxes {showBoundingBoxes ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setShowOpticalHeatmap(!showOpticalHeatmap)}
                  className={`px-2 py-1 rounded text-[11px] font-sans border transition ${
                    showOpticalHeatmap
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  Heatmap
                </button>
              </div>
            </div>

            {/* Video / Image Screen */}
            <div className="relative mt-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group">
              <img
                src={currentDisplayImage}
                alt="Rover road feed"
                className={`w-full h-full object-cover transition duration-300 ${
                  showOpticalHeatmap ? 'contrast-150 saturate-200 hue-rotate-30' : ''
                }`}
              />

              {/* Grid Radar Scan Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              {/* Bounding Box Overlay */}
              {showBoundingBoxes && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/15 rounded shadow-lg transition-all duration-300"
                  style={{
                    left: `${selectedSample.box.x}%`,
                    top: `${selectedSample.box.y}%`,
                    width: `${selectedSample.box.width}%`,
                    height: `${selectedSample.box.height}%`,
                  }}
                >
                  {/* Bounding Box Tag */}
                  <div className="absolute -top-7 left-0 px-2 py-0.5 bg-red-600/90 text-white font-mono text-[11px] font-bold rounded flex items-center gap-1.5 shadow backdrop-blur-sm whitespace-nowrap">
                    <span className="uppercase">{currentType.replace('_', ' ')}</span>
                    <span className="text-amber-200 font-extrabold">
                      {(currentConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Telemetry HUD on Screen */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-950/75 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                <div>LAT: {roverState.latitude.toFixed(4)}°N | LNG: {roverState.longitude.toFixed(4)}°E</div>
                <div className="text-cyan-400 font-bold">{roverState.rover_speed_kmh.toFixed(1)} KM/H</div>
                <div className="text-amber-400">INFERENCE: 18.2ms</div>
              </div>

              {/* Inferring Flash Overlay */}
              {isInferring && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-amber-400">Running YOLOv11 Neural Inference...</span>
                </div>
              )}
            </div>

            {/* Test Image Selector Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">SELECT ROAD TEST SAMPLE:</span>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                >
                  <Upload className="w-3 h-3 text-cyan-400" />
                  <span>Upload Custom Road Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setCustomImage(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedSample.id === sample.id && !customImage
                        ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-white truncate">
                      {sample.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-1">
                      <span>Conf: {(sample.expectedConfidence * 100).toFixed(0)}%</span>
                      <span className={sample.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}>
                        {sample.severity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Camera + IMU Sensor Fusion validated</span>
              </div>

              <button
                onClick={handleMintDNA}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <Dna className="w-4 h-4" />
                <span>Synthesize Infrastructure DNA & Dispatch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Sensor Fusion & MPU6050 Oscilloscope (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* MPU6050 Oscilloscope */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  MPU6050 6-DOF INERTIAL TELEMETRY
                </h3>
              </div>
              <button
                onClick={onSimulateBump}
                className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold transition flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-red-400" />
                <span>Simulate Bump Spike</span>
              </button>
            </div>

            {/* Oscilloscope Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <canvas
                ref={canvasRef}
                width={360}
                height={120}
                className="w-full h-28 block"
              />
              <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400">
                Z-Acc Peak: <strong className={roverState.current_mpu.az > 2.0 ? "text-red-400" : "text-emerald-400"}>
                  {roverState.current_mpu.az.toFixed(2)} G
                </strong>
              </div>
              {roverState.current_mpu.az > 2.0 && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold animate-ping">
                  SHOCK DETECTED
                </div>
              )}
            </div>

            {/* 3-Axis Readout Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACCEL X</span>
                <span className="text-slate-200 font-bold">{roverState.current_mpu.ax.toFixed(2)}G</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACCEL Y</span>
                <span className="text-slate-200 font-bold">{roverState.current_mpu.ay.toFixed(2)}G</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ACCEL Z</span>
                <span className={`font-bold ${roverState.current_mpu.az > 2.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {roverState.current_mpu.az.toFixed(2)}G
                </span>
              </div>
            </div>
          </div>

          {/* Ultrasonic Cavity Depth & Physical Dimensions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                HC-SR04 ULTRASONIC CAVITY PROFILER
              </span>
              <span className="text-cyan-400 font-bold">{selectedSample.bumpProfile.depth_cm} CM</span>
            </div>

            {/* Depth Level Indicator */}
            <div className="space-y-1">
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedSample.bumpProfile.depth_cm / 20) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 cm (Flush Surface)</span>
                <span>Sub-base Threshold (5 cm)</span>
                <span>Critical Depr (20 cm)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Estimated Dimensions:</span>
              <span className="text-amber-400 font-bold">64cm (L) × 48cm (W) × {selectedSample.bumpProfile.depth_cm}cm (D)</span>
            </div>
          </div>

          {/* GPS & Rover Navigation Status with Leaflet Mini-Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                NEO-6M GPS & LIVE LEAFLET RADAR
              </span>
              <span className="text-emerald-400 font-bold">FIX: 3D DGPS</span>
            </div>

            {/* Live Leaflet Mini-Map Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 h-28 bg-slate-950 shadow-inner">
              <div ref={miniMapRef} className="w-full h-full" />
              <div className="absolute top-1.5 left-2 z-[400] px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] text-cyan-300 border border-slate-800">
                LIVE GPS TRACE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">COORDINATES</div>
                <div className="text-slate-200 font-bold">{roverState.latitude.toFixed(6)}°N</div>
                <div className="text-slate-200 font-bold">{roverState.longitude.toFixed(6)}°E</div>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">SECTOR / ZONE</div>
                <div className="text-amber-300 font-bold">Guindy Ind. 03</div>
                <div className="text-slate-400 text-[10px]">Chennai Highways Div</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
              <span>BATTERY: <strong className="text-emerald-400">{roverState.battery_pct}%</strong></span>
              <span>HEADING: <strong className="text-white">{roverState.heading_deg}° NE</strong></span>
              <span>SATELLITES: <strong className="text-cyan-400">{roverState.gps_satellites}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
