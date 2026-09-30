import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  MapPin, 
  ShieldAlert, 
  Wrench, 
  Calendar,
  Layers,
  Dna
} from 'lucide-react';
import { InfrastructureDNA } from '../types';
import { getSeverityColor } from '../utils/riskEngine';

interface WorkOrderModalProps {
  defect: InfrastructureDNA | null;
  onClose: () => void;
  onDispatch: (defectId: string) => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  defect,
  onClose,
  onDispatch,
}) => {
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (!defect) return null;

  const color = getSeverityColor(defect.severity);
  const workOrderId = defect.work_order_id || `WO-2026-${defect.defect_id.replace('INF-', '')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDispatchAction = () => {
    onDispatch(defect.defect_id);
    setIsDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Municipal Rapid Maintenance Work Order
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Order #{workOrderId} • Infrastructure DNA Verified
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

        {/* Printable Work Order Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-slate-200">
          {/* Official Letterhead */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-sm font-black tracking-wider text-amber-400">
                GREATER CHENNAI CORPORATION & HIGHWAYS DEPT
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                ResQer Autonomous Infrastructure Incident Dispatch Center
              </div>
            </div>

            <div className="text-right">
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${color.badge}`}>
                {defect.severity} PRIORITY
              </span>
              <div className="text-[10px] text-slate-400 mt-1">SLA: 4 HOURS</div>
            </div>
          </div>

          {/* Grid of Key Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">DEFECT IDENTIFIER</div>
              <div className="text-white font-bold text-sm mt-0.5">{defect.defect_id}</div>
              <div className="text-slate-400 text-[10px] capitalize mt-0.5">
                Class: {defect.type.replace('_', ' ')}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">RISK THREAT SCORE</div>
              <div className={`font-bold text-sm mt-0.5 ${color.text}`}>
                {defect.risk_score} / 100 ({defect.severity})
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                AI Confidence: {(defect.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">EXACT GPS GEOTAG</div>
              <div className="text-white font-bold mt-0.5">
                {defect.latitude.toFixed(6)}° N, {defect.longitude.toFixed(6)}° E
              </div>
              <div className="text-slate-400 text-[10px] truncate mt-0.5">{defect.location_name}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">DIMENSIONS & CAVITY DEPTH</div>
              <div className="text-amber-400 font-bold mt-0.5">
                {defect.dimensions.length_cm}cm × {defect.dimensions.width_cm}cm × {defect.dimensions.depth_cm}cm
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Impact Shock: +{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G
              </div>
            </div>
          </div>

          {/* Action Directive */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[11px] font-bold">MANDATED CORRECTIVE ACTION:</div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {defect.recommended_action}
            </p>
          </div>

          {/* Budget & Contractor Assignment */}
          <div className="grid grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] block">ESTIMATED REPAIR ALLOCATION:</span>
              <strong className="text-emerald-400 text-sm">₹ {defect.estimated_repair_cost_inr.toLocaleString()}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">ASSIGNED HIGHWAYS CREW:</span>
              <strong className="text-white">Zone 03 Rapid Response Unit #4</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Work Order</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition"
            >
              Close
            </button>

            <button
              onClick={handleDispatchAction}
              disabled={isDispatched}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition ${
                isDispatched
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isDispatched ? <CheckCircle className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
              <span>{isDispatched ? 'Dispatched to Crew' : 'Authorize Rapid Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
