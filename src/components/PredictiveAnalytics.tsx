import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export const PredictiveAnalytics: React.FC = () => {
  const zones = [
    { name: 'Guindy Industrial Sector', score: 68, defects: 42, status: 'At Risk', trend: '-4%' },
    { name: 'Velachery Bypass Corridor', score: 54, defects: 78, status: 'Critical', trend: '-8%' },
    { name: 'OMR IT Expressway', score: 86, defects: 19, status: 'Good', trend: '+3%' },
    { name: 'T. Nagar Commercial Hub', score: 62, defects: 51, status: 'Moderate', trend: '-2%' },
    { name: 'Tambaram GST Highway', score: 58, defects: 64, status: 'At Risk', trend: '-5%' },
    { name: 'Chennai Central Zone', score: 79, defects: 26, status: 'Good', trend: '+1%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Predictive Road Deterioration & Municipal ROI</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                LIFECYCLE FORECASTING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Machine learning models projecting surface degradation, asphalt failure probability, and preventive budget savings.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ANNUAL SAVINGS</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">₹ 1.84 Crores</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Saved by early micro-surfacing vs full structural rebuilds
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ACCIDENTS PREVENTED</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">142 Incidents</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Estimated high-risk two-wheeler falls avoided in 90 days
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ROVER PATROL EFFICIENCY</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">12.4× Faster</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Compared to manual municipal visual surveys
          </div>
        </div>
      </div>

      {/* Deterioration Timeline Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            ROAD DETERIORATION EXPANSION TRAJECTORY
          </h3>
          <span className="text-xs font-mono text-slate-400">MONSOON ACCELERATION MODEL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-emerald-400 font-bold">
              <span>DAY 0: CRACK</span>
              <span>STAGE 1</span>
            </div>
            <div className="text-sm font-bold text-white">Hairline Fissure</div>
            <p className="text-xs text-slate-400">
              Width: 2–4mm. Water begins penetrating bitumen surface layer.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-emerald-400">
              Fix Cost: ₹850
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-yellow-500/30 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-yellow-400 font-bold">
              <span>DAY 14: CAVITY</span>
              <span>STAGE 2</span>
            </div>
            <div className="text-sm font-bold text-white">Minor Pothole</div>
            <p className="text-xs text-slate-400">
              Depth: 3–5cm. Traffic dislodges loose aggregate. Cavity expands.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-yellow-400">
              Fix Cost: ₹2,400
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-amber-400 font-bold">
              <span>DAY 30: HAZARD</span>
              <span>STAGE 3</span>
            </div>
            <div className="text-sm font-bold text-white">Severe Pothole (INF-00001)</div>
            <p className="text-xs text-slate-400">
              Depth: 9.4cm. High two-wheeler crash probability. MPU6050 spike: 3.42G.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-amber-400">
              Fix Cost: ₹5,500
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-red-400 font-bold">
              <span>DAY 60: COLLAPSE</span>
              <span>STAGE 4</span>
            </div>
            <div className="text-sm font-bold text-white">Sub-Base Structural Failure</div>
            <p className="text-xs text-slate-400">
              Craters merge, underlying soil saturated. Entire road lane destroyed.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-red-400">
              Fix Cost: ₹48,000+
            </div>
          </div>
        </div>
      </div>

      {/* Zone Health Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
          MUNICIPAL ZONE INFRASTRUCTURE HEALTH INDEX (PCI)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50">
              <tr>
                <th className="p-3">ZONE / SECTOR</th>
                <th className="p-3">HEALTH SCORE</th>
                <th className="p-3">ACTIVE DEFECTS</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">30-DAY TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {zones.map((z, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-bold text-white">{z.name}</td>
                  <td className="p-3">
                    <span className={`font-bold ${z.score >= 80 ? 'text-emerald-400' : z.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {z.score} / 100
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{z.defects} defects</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      z.status === 'Good' ? 'bg-emerald-500/20 text-emerald-400' :
                      z.status === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {z.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{z.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
