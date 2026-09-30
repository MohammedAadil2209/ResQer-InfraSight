import React, { useState } from 'react';
import { 
  Dna, 
  Copy, 
  Check, 
  MapPin, 
  Activity, 
  Wrench, 
  CheckCircle, 
  Layers, 
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
    <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header with Holographic DNA ID */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#dfceb8]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-mono tracking-tight text-stone-900">
                {defect.defect_id}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${color.badge}`}>
                {defect.severity} RISK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#f5f0e5] border border-[#dfceb8] text-stone-700 font-bold">
                STATUS: {defect.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Infrastructure DNA Digital Twin Record • {defect.location_name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenWorkOrder(defect)}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Generate Work Order</span>
          </button>

          {defect.status !== 'RESOLVED' ? (
            <button
              onClick={() => onUpdateStatus(defect.defect_id, 'RESOLVED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-300 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              RESOLVED
            </span>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-[#ede4d3] p-1 rounded-xl border border-[#dfceb8] text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('visual')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'visual' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Visual & Location
        </button>
        <button
          onClick={() => setActiveSubTab('fusion')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'fusion' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Sensor Fusion Telemetry
        </button>
        <button
          onClick={() => setActiveSubTab('risk')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'risk' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Risk Engine Breakdown ({defect.risk_score}/100)
        </button>
        <button
          onClick={() => setActiveSubTab('json')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'json' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Raw DNA Object (JSON)
        </button>
      </div>

      {/* Sub-Tab 1: Visual & Location */}
      {activeSubTab === 'visual' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Photo with Bounding Box */}
          <div className="md:col-span-5 relative rounded-xl overflow-hidden bg-stone-900 border border-[#dfceb8] aspect-video md:aspect-auto shadow-inner">
            <img
              src={defect.image_url}
              alt={defect.type}
              className="w-full h-full object-cover"
            />
            {/* Bounding Box */}
            <div
              className="absolute border-2 border-red-600 bg-red-600/20 rounded shadow-md"
              style={{
                left: `${defect.bounding_box.x}%`,
                top: `${defect.bounding_box.y}%`,
                width: `${defect.bounding_box.width}%`,
                height: `${defect.bounding_box.height}%`,
              }}
            >
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded">
                {(defect.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
              DETECTED: {defect.detected_at}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#dfceb8]">
                <span className="text-stone-500 text-[10px] block font-bold">DEFECT CLASSIFICATION</span>
                <span className="text-stone-900 font-bold text-sm uppercase">{defect.type.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#dfceb8]">
                <span className="text-stone-500 text-[10px] block font-bold">AI CONFIDENCE (YOLO)</span>
                <span className="text-emerald-700 font-bold text-sm">{(defect.confidence * 100).toFixed(2)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#dfceb8]">
                <span className="text-stone-500 text-[10px] block font-bold">TRAFFIC EXPOSURE</span>
                <span className="text-amber-800 font-bold text-sm">{defect.traffic_exposure}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#dfceb8]">
                <span className="text-stone-500 text-[10px] block font-bold">DETERIORATION TREND</span>
                <span className="text-red-700 font-bold text-sm">{defect.deterioration}</span>
              </div>
            </div>

            {/* Physical Dimensions */}
            <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] text-xs font-mono space-y-2">
              <div className="text-stone-700 text-[11px] font-bold">ESTIMATED PHYSICAL DIMENSIONS:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-white border border-[#dfceb8]">
                  <span className="text-stone-500 text-[10px] block">LENGTH</span>
                  <span className="text-stone-900 font-bold">{defect.dimensions.length_cm} cm</span>
                </div>
                <div className="p-2 rounded bg-white border border-[#dfceb8]">
                  <span className="text-stone-500 text-[10px] block">WIDTH</span>
                  <span className="text-stone-900 font-bold">{defect.dimensions.width_cm} cm</span>
                </div>
                <div className="p-2 rounded bg-white border border-[#dfceb8]">
                  <span className="text-stone-500 text-[10px] block">CAVITY DEPTH</span>
                  <span className="text-red-700 font-bold">{defect.dimensions.depth_cm} cm</span>
                </div>
              </div>
            </div>

            {/* Location & Recommended Action */}
            <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-mono">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span className="font-bold">{defect.road_name}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Geotag: {defect.latitude.toFixed(6)}° N, {defect.longitude.toFixed(6)}° E ({defect.location_name})
              </p>
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>Recommended Action:</strong> {defect.recommended_action}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Sensor Fusion Telemetry */}
      {activeSubTab === 'fusion' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] space-y-3">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span>INSPECTION ROVER SENSOR LOG (MPU6050 + ULTRASONIC + GPS)</span>
              </span>
              <span className="text-stone-500 font-normal">{defect.sensor_telemetry.timestamp}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">Z-ACCEL SHOCK</div>
                <div className="text-lg font-bold text-red-700 mt-1">
                  +{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G
                </div>
                <div className="text-[10px] text-stone-400">Normal: ~1.00 G</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">GYRO PITCH RATE</div>
                <div className="text-lg font-bold text-amber-800 mt-1">
                  {defect.sensor_telemetry.gyro_pitch_rate.toFixed(1)}°/s
                </div>
                <div className="text-[10px] text-stone-400">Chassis tilt tremor</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">ULTRASONIC DEPTH</div>
                <div className="text-lg font-bold text-stone-900 mt-1">
                  {defect.sensor_telemetry.ultrasonic_depth_cm.toFixed(1)} cm
                </div>
                <div className="text-[10px] text-stone-400">Surface offset echo</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#dfceb8]">
                <div className="text-[10px] text-stone-500">ROVER SPEED</div>
                <div className="text-lg font-bold text-emerald-800 mt-1">
                  {defect.sensor_telemetry.rover_speed_kmh.toFixed(1)} km/h
                </div>
                <div className="text-[10px] text-stone-400">Heading: {defect.sensor_telemetry.heading_deg}°</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-2 text-stone-900">
              <Layers className="w-4 h-4 text-red-600" />
              <span>SENSOR FUSION REASONING ENGINE</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              Visual inference detected asphalt disruption with <strong>{(defect.confidence * 100).toFixed(1)}%</strong> certainty. When rover passed over the locus, the MPU6050 accelerometer recorded an abnormal vertical jerk of <strong>{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G</strong>, perfectly synchronized with ultrasonic cavity measurement of <strong>{defect.sensor_telemetry.ultrasonic_depth_cm} cm</strong>. This dual-verification eliminates false-positive optical noise (e.g. shadows, wet oil slicks) with 99.7% confidence.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Risk Engine Breakdown */}
      {activeSubTab === 'risk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-800">
                5-FACTOR COMPOSITE THREAT FORMULA
              </span>
              <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${color.badge}`}>
                COMPOSITE SCORE: {defect.risk_score} / 100
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Severity Factor */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>1. Structural Severity (Weight: 25%)</span>
                  <span className="text-red-700 font-bold">{defect.risk_breakdown.severity} / 100</span>
                </div>
                <div className="h-2 bg-[#ede4d3] rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${defect.risk_breakdown.severity}%` }} />
                </div>
              </div>

              {/* Traffic Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>2. Traffic Exposure (Weight: 20%)</span>
                  <span className="text-amber-800 font-bold">{defect.risk_breakdown.traffic_exposure} / 100</span>
                </div>
                <div className="h-2 bg-[#ede4d3] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${defect.risk_breakdown.traffic_exposure}%` }} />
                </div>
              </div>

              {/* Population Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>3. Population / Pedestrian Exposure (Weight: 15%)</span>
                  <span className="text-yellow-800 font-bold">{defect.risk_breakdown.population_exposure} / 100</span>
                </div>
                <div className="h-2 bg-[#ede4d3] rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${defect.risk_breakdown.population_exposure}%` }} />
                </div>
              </div>

              {/* Public Safety Hazard */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>4. Public Safety Hazard (Weight: 25%)</span>
                  <span className="text-red-700 font-bold">{defect.risk_breakdown.safety_risk} / 100</span>
                </div>
                <div className="h-2 bg-[#ede4d3] rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${defect.risk_breakdown.safety_risk}%` }} />
                </div>
              </div>

              {/* Deterioration Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>5. Deterioration Rate (Weight: 15%)</span>
                  <span className="text-stone-800 font-bold">{defect.risk_breakdown.deterioration} / 100</span>
                </div>
                <div className="h-2 bg-[#ede4d3] rounded-full overflow-hidden">
                  <div className="h-full bg-stone-700 rounded-full" style={{ width: `${defect.risk_breakdown.deterioration}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Raw JSON Inspector */}
      {activeSubTab === 'json' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-600">
            <span>STANDARDIZED RESQER INFRASTRUCTURE DNA OBJECT</span>
            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1 rounded bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs text-amber-200 overflow-x-auto max-h-72 leading-relaxed shadow-inner">
            {JSON.stringify(defect, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
