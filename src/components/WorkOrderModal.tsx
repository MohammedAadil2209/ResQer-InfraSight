import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Wrench
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#dfceb8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#fbf9f5] border-b border-[#dfceb8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-mono">
                MUNICIPAL RAPID MAINTENANCE WORK ORDER
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Order #{workOrderId} • Infrastructure DNA Verified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-[#ede4d3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Work Order Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-stone-800">
          {/* Official Letterhead */}
          <div className="flex items-start justify-between border-b border-[#dfceb8] pb-4">
            <div>
              <div className="text-sm font-black tracking-wider text-red-700">
                GREATER CHENNAI CORPORATION & HIGHWAYS DEPT
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                ResQer Autonomous Infrastructure Incident Dispatch Center
              </div>
            </div>

            <div className="text-right">
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${color.badge}`}>
                {defect.severity} PRIORITY
              </span>
              <div className="text-[10px] text-stone-500 mt-1">SLA: 4 HOURS</div>
            </div>
          </div>

          {/* Grid of Key Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dfceb8]">
              <div className="text-stone-500 text-[10px]">DEFECT IDENTIFIER</div>
              <div className="text-stone-900 font-bold text-sm mt-0.5">{defect.defect_id}</div>
              <div className="text-stone-600 text-[10px] capitalize mt-0.5 font-sans font-bold">
                Class: {defect.type.replace('_', ' ')}
              </div>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dfceb8]">
              <div className="text-stone-500 text-[10px]">RISK THREAT SCORE</div>
              <div className={`font-bold text-sm mt-0.5 ${color.text}`}>
                {defect.risk_score} / 100 ({defect.severity})
              </div>
              <div className="text-stone-600 text-[10px] mt-0.5">
                AI Confidence: {(defect.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dfceb8]">
              <div className="text-stone-500 text-[10px]">EXACT GPS GEOTAG</div>
              <div className="text-stone-900 font-bold mt-0.5">
                {defect.latitude.toFixed(6)}° N, {defect.longitude.toFixed(6)}° E
              </div>
              <div className="text-stone-600 text-[10px] truncate mt-0.5">{defect.location_name}</div>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dfceb8]">
              <div className="text-stone-500 text-[10px]">DIMENSIONS & CAVITY DEPTH</div>
              <div className="text-red-700 font-bold mt-0.5">
                {defect.dimensions.length_cm}cm × {defect.dimensions.width_cm}cm × {defect.dimensions.depth_cm}cm
              </div>
              <div className="text-stone-600 text-[10px] mt-0.5">
                Impact Shock: +{defect.sensor_telemetry.accel_z_spike_g.toFixed(2)} G
              </div>
            </div>
          </div>

          {/* Action Directive */}
          <div className="p-4 bg-[#fbf9f5] rounded-xl border border-[#dfceb8] space-y-2">
            <div className="text-stone-700 text-[11px] font-bold">MANDATED CORRECTIVE ACTION:</div>
            <p className="text-xs text-stone-800 leading-relaxed font-sans">
              {defect.recommended_action}
            </p>
          </div>

          {/* Budget & Contractor Assignment */}
          <div className="grid grid-cols-2 gap-3 text-stone-700">
            <div>
              <span className="text-stone-500 text-[10px] block">ESTIMATED REPAIR ALLOCATION:</span>
              <strong className="text-emerald-700 text-sm">₹ {defect.estimated_repair_cost_inr.toLocaleString()}</strong>
            </div>

            <div>
              <span className="text-stone-500 text-[10px] block">ASSIGNED HIGHWAYS CREW:</span>
              <strong className="text-stone-900">Zone 03 Rapid Response Unit #4</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-[#fbf9f5] border-t border-[#dfceb8] flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-mono flex items-center gap-1.5 transition font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Work Order</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 text-xs transition"
            >
              Close
            </button>

            <button
              onClick={handleDispatchAction}
              disabled={isDispatched}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition ${
                isDispatched
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-red-600 hover:bg-red-700 text-white'
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
