import React, { useState } from 'react';
import { 
  Dna, 
  Copy, 
  Check, 
  MapPin, 
  Activity, 
  Radio, 
  Wrench, 
  CheckCircle, 
  Layers, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { InfrastructureDNA } from '../types';
import { getSeverityColor } from '../utils/riskEngine';

interface InfrastructureDNAViewerProps {
  defect: InfrastructureDNA;
  onUpdateStatus: (defectId: string, newStatus: InfrastructureDNA['status']) => void;
  onOpenWorkOrder: (defect: InfrastructureDNA) => void;
}

export const InfrastructureDNAViewer: React.FC<InfrastructureDNAViewerProps> = ({
  defect,
  onUpdateStatus,
  onOpenWorkOrder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'fusion' | 'risk' | 'json'>('visual');
  const [copied, setCopied] = useState<boolean>(false);

  const color = getSeverityColor(defect.severity);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(defect, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header with Holographic DNA ID */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-mono tracking-tight text-white">
                {defect.defect_id}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${color.badge}`}>
                {defect.severity} RISK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                STATUS: {defect.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Infrastructure DNA Digital Twin Record • {defect.location_name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenWorkOrder(defect)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Generate Work Order</span>
          </button>

          {defect.status !== 'RESOLVED' ? (
            <button
              onClick={() => onUpdateStatus(defect.defect_id, 'RESOLVED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium text-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              RESOLVED
            </span>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('visual')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'visual' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Visual & Location
        </button>
        <button
          onClick={() => setActiveSubTab('fusion')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'fusion' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sensor Fusion Telemetry
        </button>
        <button
          onClick={() => setActiveSubTab('risk')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'risk' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Risk Engine Breakdown ({defect.risk_score}/100)
        </button>
        <button
          onClick={() => setActiveSubTab('json')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'json' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Raw DNA Object (JSON)
        </button>
      </div>

      {/* Sub-Tab 1: Visual & Location */}
      {activeSubTab === 'visual' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Photo with Bounding Box */}
          <div className="md:col-span-5 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video md:aspect-auto">
            <img
              src={defect.image_url}
              alt={defect.type}
              className="w-full h-full object-cover"
            />
            {/* Bounding Box */}
            <div
              className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-lg"
              style={{
                left: `${defect.bounding_box.x}%`,
                top: `${defect.bounding_box.y}%`,
                width: `${defect.bounding_box.width}%`,
                height: `${defect.bounding_box.height}%`,
              }}
            >
              <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded">
                {(defect.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-300">
              DETECTED: {defect.detected_at}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DEFECT CLASSIFICATION</span>
                <span className="text-white font-bold text-sm uppercase">{defect.type.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AI CONFIDENCE (YOLO)</span>
                <span className="text-emerald-400 font-bold text-sm">{(defect.confidence * 100).toFixed(2)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TRAFFIC EXPOSURE</span>
                <span className="text-amber-400 font-bold text-sm">{defect.traffic_exposure}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DETERIORATION TREND</span>
                <span className="text-rose-400 font-bold text-sm">{defect.deterioration}</span>
              </div>
            </div>

            {/* Physical Dimensions */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 text-[11px] font-semibold">ESTIMATED PHYSICAL DIMENSIONS:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">LENGTH</span>
                  <span className="text-white font-bold">{defect.dimensions.length_cm} cm</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">WIDTH</span>
                  <span className="text-white font-bold">{defect.dimensions.width_cm} cm</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CAVITY DEPTH</span>
                  <span className="text-amber-400 font-bold">{defect.dimensions.depth_cm} cm</span>
                </div>
              </div>
            </div>

            {/* Location & Recommended Action */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">{defect.road_name}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Geotag: {defect.latitude.toFixed(6)}° N, {defect.longitude.toFixed(6)}° E ({defect.location_name})
              </p>
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Recommended Action:</strong> {defect.recommended_action}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Sensor Fusion Telemetry */}
      {activeSubTab === 'fusion' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>INSPECTION ROVER SENSOR LOG (MPU6050 + ULTRASONIC + GPS)</span>
              </span>
              <span className="text-slate-500">{defect.sensor_telemetry.timestamp}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Z-ACCEL SHOCK</div>
                <div className="text-lg font-bold text-red-400 mt-1">
                  +{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G
                </div>
                <div className="text-[10px] text-slate-500">Normal: ~1.00 G</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">GYRO PITCH RATE</div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {defect.sensor_telemetry.gyro_pitch_rate.toFixed(1)}°/s
                </div>
                <div className="text-[10px] text-slate-500">Chassis tilt tremor</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">ULTRASONIC DEPTH</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">
                  {defect.sensor_telemetry.ultrasonic_depth_cm.toFixed(1)} cm
                </div>
                <div className="text-[10px] text-slate-500">Surface offset echo</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">ROVER SPEED</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {defect.sensor_telemetry.rover_speed_kmh.toFixed(1)} km/h
                </div>
                <div className="text-[10px] text-slate-500">Heading: {defect.sensor_telemetry.heading_deg}°</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-indigo-200 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>SENSOR FUSION REASONING ENGINE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Visual inference detected asphalt disruption with <strong>{(defect.confidence * 100).toFixed(1)}%</strong> certainty. When rover passed over the locus, the MPU6050 accelerometer recorded an abnormal vertical jerk of <strong>{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G</strong>, perfectly synchronized with ultrasonic cavity measurement of <strong>{defect.sensor_telemetry.ultrasonic_depth_cm} cm</strong>. This dual-verification eliminates false-positive optical noise (e.g. shadows, wet oil slicks) with 99.7% confidence.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Risk Engine Breakdown */}
      {activeSubTab === 'risk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-300">
                5-FACTOR COMPOSITE THREAT FORMULA
              </span>
              <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${color.badge}`}>
                COMPOSITE SCORE: {defect.risk_score} / 100
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Severity Factor */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>1. Structural Severity (Weight: 25%)</span>
                  <span className="text-red-400 font-bold">{defect.risk_breakdown.severity} / 100</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${defect.risk_breakdown.severity}%` }} />
                </div>
              </div>

              {/* Traffic Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>2. Traffic Exposure (Weight: 20%)</span>
                  <span className="text-amber-400 font-bold">{defect.risk_breakdown.traffic_exposure} / 100</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${defect.risk_breakdown.traffic_exposure}%` }} />
                </div>
              </div>

              {/* Population Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>3. Population / Pedestrian Exposure (Weight: 15%)</span>
                  <span className="text-yellow-400 font-bold">{defect.risk_breakdown.population_exposure} / 100</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${defect.risk_breakdown.population_exposure}%` }} />
                </div>
              </div>

              {/* Public Safety Hazard */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>4. Public Safety Hazard (Weight: 25%)</span>
                  <span className="text-rose-400 font-bold">{defect.risk_breakdown.safety_risk} / 100</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${defect.risk_breakdown.safety_risk}%` }} />
                </div>
              </div>

              {/* Deterioration Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>5. Deterioration Rate (Weight: 15%)</span>
                  <span className="text-purple-400 font-bold">{defect.risk_breakdown.deterioration} / 100</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${defect.risk_breakdown.deterioration}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Raw JSON Inspector */}
      {activeSubTab === 'json' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>STANDARDIZED RESQER INFRASTRUCTURE DNA OBJECT</span>
            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-pink-300/90 overflow-x-auto max-h-72 leading-relaxed">
            {JSON.stringify(defect, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
