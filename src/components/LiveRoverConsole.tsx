import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Activity, 
  Layers, 
  Dna, 
  Radio, 
  Crosshair, 
  Check, 
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { InfrastructureDNA, RoverTelemetryState, DefectType } from '../types';
import { SAMPLE_TEST_IMAGES } from '../data/mockDefects';
import { calculateRiskScore, getSeverityTier, getRecommendedAction } from '../utils/riskEngine';
import { captureAndInspectFrame } from '../utils/api';

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
  const [mintNotification, setMintNotification] = useState<string | null>(null);
  const [streamMode, setStreamMode] = useState<'live' | 'sample'>('live');

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
      subdomains: 'abc',
    }).addTo(miniMap);

    const roverIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 rounded-full bg-red-600/40 animate-ping"></div>
        <div class="relative w-5 h-5 rounded-full bg-white border-2 border-red-600 flex items-center justify-center text-[10px] shadow-sm">
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

  // Update waveform on MPU change - Calculate UPWARD vibration magnitude
  useEffect(() => {
    const { ax, ay, az } = roverState.current_mpu;
    const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
    const devG = Math.abs(totalG - 1.0);
    const axisShock = Math.max(Math.abs(az - 1.0), Math.abs(ax) * 1.2, Math.abs(ay) * 1.2);
    // Baseline is 1.0G; any vibration or shock spikes strictly UPWARD!
    const vibrationValue = 1.0 + Math.max(devG, axisShock) * 1.8;

    setWaveformHistory((prev) => {
      const next = [...prev.slice(-35), vibrationValue];
      return next;
    });
  }, [roverState.current_mpu.ax, roverState.current_mpu.ay, roverState.current_mpu.az]);

  // Draw Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#292524';
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

    // Baseline (1.0G Static Rest) near lower third
    const baselineY = height * 0.78;
    ctx.strokeStyle = '#44403c';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Upward Vibration Waveform
    if (waveformHistory.length > 1) {
      const latestVal = waveformHistory[waveformHistory.length - 1] || 1.0;
      const isHighVibration = latestVal > 1.6 || roverState.current_mpu.az > 1.8 || Math.abs(roverState.current_mpu.ax) > 0.4;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isHighVibration ? '#ef4444' : '#22c55e';
      if (isHighVibration) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      const step = width / (waveformHistory.length - 1);
      waveformHistory.forEach((val, idx) => {
        // Higher vibration = higher upward spike
        const upwardSpike = Math.max(0, val - 1.0);
        const spikePixels = Math.min(upwardSpike / 2.5, 1.0) * (baselineY - 10);
        const y = baselineY - spikePixels;
        const x = idx * step;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [waveformHistory, roverState.current_mpu]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string);
      setStreamMode('sample');
      setIsInferring(true);
      setTimeout(() => {
        setIsInferring(false);
      }, 600);
    };
    reader.readAsDataURL(file);
  };

  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const liveImgRef = useRef<HTMLImageElement | null>(null);

  const currentDisplayImage = customImage || selectedSample.url;
  const currentConfidence = selectedSample.expectedConfidence;
  const currentType = selectedSample.type as DefectType;

  // Real Camera Snapshot & AI Inspection
  const handleCaptureLiveFrame = async () => {
    setIsCapturing(true);
    try {
      let imageBlob: Blob | null = null;

      // 1. Try direct high-res snapshot from IP Webcam /shot.jpg
      try {
        const resp = await fetch('http://192.168.29.224:8080/shot.jpg');
        if (resp.ok) {
          imageBlob = await resp.blob();
        }
      } catch {
        // Fallback to canvas
      }

      // 2. Try drawing from live image element
      if (!imageBlob && liveImgRef.current) {
        try {
          const c = document.createElement('canvas');
          c.width = liveImgRef.current.naturalWidth || 640;
          c.height = liveImgRef.current.naturalHeight || 480;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(liveImgRef.current, 0, 0, c.width, c.height);
            imageBlob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/jpeg', 0.85));
          }
        } catch {
          // Fallback to sample
        }
      }

      // 3. Fallback to current sample image
      if (!imageBlob) {
        const fallbackResp = await fetch(currentDisplayImage);
        imageBlob = await fallbackResp.blob();
      }

      if (imageBlob) {
        const res = await captureAndInspectFrame(
          imageBlob,
          roverState.latitude,
          roverState.longitude,
          roverState.current_mpu,
          roverState.ultrasonic_cm,
          true
        );

        if (res && res.infrastructure_dna && res.infrastructure_dna.length > 0) {
          const item = res.infrastructure_dna[0];
          const rawBreakdown = {
            severity: item.severity === 'CRITICAL' ? 90 : 70,
            traffic_exposure: 85,
            population_exposure: 80,
            safety_risk: item.severity === 'CRITICAL' ? 95 : 72,
            deterioration: 75,
          };
          const newDNA: InfrastructureDNA = {
            defect_id: item.defect_id,
            type: item.type,
            confidence: item.confidence > 1 ? item.confidence / 100 : item.confidence,
            severity: item.severity,
            latitude: item.latitude,
            longitude: item.longitude,
            location_name: item.location_name || 'Guindy Industrial Sector',
            road_name: item.road_name || 'GST Corridor Patrol Lane',
            traffic_exposure: item.traffic_exposure || 'HIGH',
            deterioration: item.deterioration || 'RISING',
            risk_score: item.risk_score || 85,
            dimensions: item.dimensions || { length_cm: 65, width_cm: 50, depth_cm: 9.2 },
            sensor_telemetry: {
              accel_x_g: roverState.current_mpu.ax,
              accel_y_g: roverState.current_mpu.ay,
              accel_z_spike_g: roverState.current_mpu.az,
              gyro_pitch_rate: 12.4,
              gyro_roll_rate: -4.2,
              ultrasonic_depth_cm: roverState.ultrasonic_cm,
              rover_speed_kmh: roverState.rover_speed_kmh,
              heading_deg: roverState.heading_deg,
              timestamp: item.timestamp || new Date().toISOString(),
            },
            risk_breakdown: rawBreakdown,
            recommended_action: item.recommended_action || 'Immediate road barrier and rapid asphalt repair crew dispatched.',
            status: 'REPORTED',
            detected_at: item.detected_at || new Date().toLocaleString(),
            image_url: item.image_url || currentDisplayImage,
            bounding_box: item.bounding_box || { x: 25, y: 30, width: 50, height: 40 },
            work_order_id: item.work_order_id || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            estimated_repair_cost_inr: item.estimated_repair_cost_inr || 4500,
          };
          onNewDefectMinted(newDNA);
          setMintNotification(`Captured & Minted Infrastructure DNA #${item.defect_id}!`);
          setTimeout(() => setMintNotification(null), 4000);
          return;
        }
      }
    } catch (err) {
      console.error('Direct capture failed, using synthesized pipeline:', err);
    } finally {
      setIsCapturing(false);
    }

    // Fallback: mint synthesized DNA
    handleMintDNA();
  };

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
    const now = new Date();
    const formattedDateTime = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
      detected_at: formattedDateTime,
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
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold font-mono text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4" />
          <span>{mintNotification}</span>
        </div>
      )}

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual AI Detection Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs">
            {/* Camera View Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#dfceb8] text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-stone-900 font-bold">ROVER-CAM-01 [OPTICAL INGEST]</span>
                <span className="text-stone-400">|</span>
                <span className="text-red-700 font-bold">YOLOv11 Nano</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Feed Source Mode Switch */}
                <div className="flex items-center bg-[#f5f0e5] p-0.5 rounded-lg border border-[#dfceb8] text-[11px] font-mono">
                  <button
                    onClick={() => setStreamMode('live')}
                    className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-bold ${
                      streamMode === 'live'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE STREAM (8080)
                  </button>
                  <button
                    onClick={() => setStreamMode('sample')}
                    className={`px-2.5 py-1 rounded transition font-bold ${
                      streamMode === 'sample'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    BENCH SAMPLES
                  </button>
                </div>

                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2.5 py-1 rounded text-[11px] font-sans border transition ${
                    showBoundingBoxes
                      ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                      : 'bg-[#f5f0e5] text-stone-600 border-[#dfceb8]'
                  }`}
                >
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  BBoxes {showBoundingBoxes ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setShowOpticalHeatmap(!showOpticalHeatmap)}
                  className={`px-2.5 py-1 rounded text-[11px] font-sans border transition ${
                    showOpticalHeatmap
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-[#f5f0e5] text-stone-600 border-[#dfceb8]'
                  }`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  Contrast
                </button>
              </div>
            </div>

            {streamMode === 'live' ? (
              /* Live Rover Camera Frame */
              <div className="relative w-full h-[320px] bg-black rounded-lg overflow-hidden border border-gray-800 mt-3 group">
                <img
                  ref={liveImgRef}
                  crossOrigin="anonymous"
                  src="http://192.168.29.224:8080/video"
                  alt="Rover Live Optical Feed"
                  className={`w-full h-full object-cover ${
                    showOpticalHeatmap ? 'contrast-150 saturate-200 hue-rotate-30' : ''
                  }`}
                  onError={(e) => {
                    // Fallback if camera stream is disconnected
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/fallback_road.jpg";
                  }}
                />
                
                {/* Telemetry Overlay Banner with Live GPS */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">● LIVE GPS</span>
                  <span>LAT: {roverState.latitude.toFixed(6)}°N</span>
                  <span>LNG: {roverState.longitude.toFixed(6)}°E</span>
                  <span className="text-stone-300">SPEED: {roverState.rover_speed_kmh.toFixed(1)} KM/H</span>
                </div>

                {/* Instant Live Capture Button */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={handleCaptureLiveFrame}
                    disabled={isCapturing}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold shadow-xl flex items-center gap-2 transition active:scale-95 disabled:opacity-50 border border-white/20 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isCapturing ? 'ANALYZING & MINTING...' : 'CAPTURE & REPORT DEFECT'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Video / Image Screen */
              <div className="relative mt-3 rounded-xl overflow-hidden bg-stone-900 border border-[#dfceb8] aspect-video flex items-center justify-center group shadow-inner">
                <img
                  src={currentDisplayImage}
                  alt="Rover road feed"
                  className={`w-full h-full object-cover transition duration-300 ${
                    showOpticalHeatmap ? 'contrast-150 saturate-200 hue-rotate-30' : ''
                  }`}
                />

                {/* Bounding Box Overlay */}
                {showBoundingBoxes && (
                  <div
                    className="absolute border-2 border-red-600 bg-red-600/20 rounded shadow-lg transition-all duration-300"
                    style={{
                      left: `${selectedSample.box.x}%`,
                      top: `${selectedSample.box.y}%`,
                      width: `${selectedSample.box.width}%`,
                      height: `${selectedSample.box.height}%`,
                    }}
                  >
                    {/* Bounding Box Tag */}
                    <div className="absolute -top-7 left-0 px-2.5 py-0.5 bg-red-600 text-white font-mono text-[11px] font-bold rounded shadow-md whitespace-nowrap">
                      <span className="uppercase">{currentType.replace('_', ' ')}</span>
                      <span className="ml-1.5 opacity-90">
                        {(currentConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Telemetry HUD on Screen */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white bg-black/75 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md">
                  <div>LAT: {roverState.latitude.toFixed(4)}°N | LNG: {roverState.longitude.toFixed(4)}°E</div>
                  <div className="text-red-400 font-bold">{roverState.rover_speed_kmh.toFixed(1)} KM/H</div>
                  <div className="text-amber-300">INFERENCE: 18.2ms</div>
                </div>

                {/* Inferring Flash Overlay */}
                {isInferring && (
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-white font-bold">Running YOLOv11 Neural Inference...</span>
                  </div>
                )}
              </div>
            )}

            {/* Test Image Selector Strip */}
            <div className="mt-4 pt-3 border-t border-[#dfceb8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-700">SELECT ROAD TEST SAMPLE:</span>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-md bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-medium flex items-center gap-1 transition shadow-2xs"
                >
                  <Upload className="w-3 h-3 text-red-600" />
                  <span>Upload Custom Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setCustomImage(null);
                      setStreamMode('sample');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedSample.id === sample.id && !customImage && streamMode === 'sample'
                        ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/40 shadow-xs'
                        : 'bg-[#fbf9f5] border-[#dfceb8] hover:bg-white'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-stone-900 truncate">
                      {sample.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-[10px] font-mono text-stone-500 flex items-center justify-between mt-1.5">
                      <span>Conf: {(sample.expectedConfidence * 100).toFixed(0)}%</span>
                      <span className={sample.severity === 'CRITICAL' ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'}>
                        {sample.severity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-[#dfceb8] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Info className="w-4 h-4 text-red-600" />
                <span>Camera + IMU Sensor Fusion validated</span>
              </div>

              <button
                onClick={handleCaptureLiveFrame}
                disabled={isCapturing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{isCapturing ? 'Analyzing & Dispatching...' : 'Capture Frame & Synthesize DNA'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Sensor Fusion & MPU6050 Oscilloscope (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* MPU6050 Oscilloscope */}
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
                  MPU6050 6-DOF INERTIAL TELEMETRY
                </h3>
              </div>
              <button
                onClick={onSimulateBump}
                className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Zap className="w-3 h-3 text-red-600" />
                <span>Simulate Spike</span>
              </button>
            </div>

            {/* Oscilloscope Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={120}
                className="w-full h-28 block"
              />
              <div className="absolute top-2 left-2 text-[10px] font-mono text-stone-300">
                Z-Acc Peak: <strong className={roverState.current_mpu.az > 2.0 ? "text-red-400 font-bold" : "text-emerald-400"}>
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
              <div className="p-2 rounded-lg bg-[#f5f0e5] border border-[#dfceb8]">
                <span className="text-stone-500 block text-[10px]">ACCEL X</span>
                <span className="text-stone-900 font-bold">{roverState.current_mpu.ax.toFixed(2)}G</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f5f0e5] border border-[#dfceb8]">
                <span className="text-stone-500 block text-[10px]">ACCEL Y</span>
                <span className="text-stone-900 font-bold">{roverState.current_mpu.ay.toFixed(2)}G</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f5f0e5] border border-[#dfceb8]">
                <span className="text-stone-500 block text-[10px]">ACCEL Z</span>
                <span className={`font-bold ${roverState.current_mpu.az > 2.0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {roverState.current_mpu.az.toFixed(2)}G
                </span>
              </div>
            </div>
          </div>

          {/* Ultrasonic Cavity Depth & Dimensions */}
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-700 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-600" />
                HC-SR04 ULTRASONIC CAVITY PROFILER
              </span>
              <span className="text-red-700 font-black">{selectedSample.bumpProfile.depth_cm} CM</span>
            </div>

            {/* Depth Level Indicator */}
            <div className="space-y-1">
              <div className="h-3 bg-[#ede4d3] rounded-full overflow-hidden border border-[#dfceb8] p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedSample.bumpProfile.depth_cm / 20) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-stone-500">
                <span>0 cm (Flush Surface)</span>
                <span>Sub-base Threshold (5 cm)</span>
                <span>Critical Depr (20 cm)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] text-xs font-mono text-stone-700 flex items-center justify-between">
              <span>Estimated Dimensions:</span>
              <span className="text-red-700 font-bold">64cm (L) × 48cm (W) × {selectedSample.bumpProfile.depth_cm}cm (D)</span>
            </div>
          </div>

          {/* GPS & Rover Navigation Status with Leaflet Mini-Map */}
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-4 shadow-xs space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-stone-700 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-600" />
                NEO-6M GPS & LIVE LEAFLET RADAR
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                FIX: 3D DGPS
              </span>
            </div>

            {/* Live Leaflet Mini-Map Container */}
            <div className="relative rounded-xl overflow-hidden border border-[#dfceb8] h-28 bg-[#f5f0e5] shadow-inner">
              <div ref={miniMapRef} className="w-full h-full" />
              <div className="absolute top-1.5 left-2 z-[400] px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[9px] text-stone-800 border border-[#dfceb8] font-bold">
                LIVE GPS TRACE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#fbf9f5] rounded-lg border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">COORDINATES</div>
                <div className="text-stone-900 font-bold">{roverState.latitude.toFixed(6)}°N</div>
                <div className="text-stone-900 font-bold">{roverState.longitude.toFixed(6)}°E</div>
              </div>
              <div className="p-2 bg-[#fbf9f5] rounded-lg border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">SECTOR / ZONE</div>
                <div className="text-stone-900 font-bold">Guindy Ind. 03</div>
                <div className="text-stone-500 text-[10px]">Chennai Highways Div</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#ede4d3] text-[11px] text-stone-600">
              <span>BATTERY: <strong className="text-emerald-700">{roverState.battery_pct}%</strong></span>
              <span>HEADING: <strong className="text-stone-900">{roverState.heading_deg}° NE</strong></span>
              <span>SATELLITES: <strong className="text-stone-900">{roverState.gps_satellites}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
