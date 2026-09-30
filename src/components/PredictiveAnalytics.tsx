import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  BarChart3
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
      <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">Predictive Road Deterioration & Municipal ROI</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-300">
                LIFECYCLE FORECASTING
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Machine learning models projecting surface degradation, asphalt failure probability, and preventive budget savings.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>ANNUAL SAVINGS</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">₹ 1.84 Crores</div>
          <div className="text-[11px] text-stone-600 mt-1 font-sans">
            Saved by early micro-surfacing vs full structural rebuilds
          </div>
        </div>

        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>ACCIDENTS PREVENTED</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700 mt-2">142 Incidents</div>
          <div className="text-[11px] text-stone-600 mt-1 font-sans">
            Estimated high-risk two-wheeler falls avoided in 90 days
          </div>
        </div>

        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>ROVER PATROL EFFICIENCY</span>
            <BarChart3 className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-2">12.4× Faster</div>
          <div className="text-[11px] text-stone-600 mt-1 font-sans">
            Compared to manual municipal visual surveys
          </div>
        </div>
      </div>

      {/* Deterioration Timeline Breakdown */}
      <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#dfceb8]">
          <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
            ROAD DETERIORATION EXPANSION TRAJECTORY
          </h3>
          <span className="text-xs font-mono text-stone-500">MONSOON ACCELERATION MODEL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#fbf9f5] border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-emerald-800 font-bold">
              <span>DAY 0: CRACK</span>
              <span>STAGE 1</span>
            </div>
            <div className="text-sm font-bold text-stone-900">Hairline Fissure</div>
            <p className="text-xs text-stone-600">
              Width: 2–4mm. Water begins penetrating bitumen surface layer.
            </p>
            <div className="pt-2 border-t border-[#ede4d3] text-xs font-mono text-emerald-800 font-bold">
              Fix Cost: ₹850
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fbf9f5] border border-yellow-300 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-yellow-800 font-bold">
              <span>DAY 14: CAVITY</span>
              <span>STAGE 2</span>
            </div>
            <div className="text-sm font-bold text-stone-900">Minor Pothole</div>
            <p className="text-xs text-stone-600">
              Depth: 3–5cm. Traffic dislodges loose aggregate. Cavity expands.
            </p>
            <div className="pt-2 border-t border-[#ede4d3] text-xs font-mono text-yellow-800 font-bold">
              Fix Cost: ₹2,400
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fbf9f5] border border-amber-300 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-amber-800 font-bold">
              <span>DAY 30: HAZARD</span>
              <span>STAGE 3</span>
            </div>
            <div className="text-sm font-bold text-stone-900">Severe Pothole (INF-00001)</div>
            <p className="text-xs text-stone-600">
              Depth: 9.4cm. High two-wheeler crash probability. MPU6050 spike: 3.42G.
            </p>
            <div className="pt-2 border-t border-[#ede4d3] text-xs font-mono text-amber-800 font-bold">
              Fix Cost: ₹5,500
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-300 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-red-700 font-bold">
              <span>DAY 60: COLLAPSE</span>
              <span>STAGE 4</span>
            </div>
            <div className="text-sm font-bold text-stone-900">Sub-Base Structural Failure</div>
            <p className="text-xs text-stone-600">
              Craters merge, underlying soil saturated. Entire road lane destroyed.
            </p>
            <div className="pt-2 border-t border-red-200 text-xs font-mono text-red-700 font-bold">
              Fix Cost: ₹48,000+
            </div>
          </div>
        </div>
      </div>

      {/* Zone Health Table */}
      <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
          MUNICIPAL ZONE INFRASTRUCTURE HEALTH INDEX (PCI)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-stone-500 border-b border-[#dfceb8] bg-[#f5f0e5]">
              <tr>
                <th className="p-3">ZONE / SECTOR</th>
                <th className="p-3">HEALTH SCORE</th>
                <th className="p-3">ACTIVE DEFECTS</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">30-DAY TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede4d3]">
              {zones.map((z, idx) => (
                <tr key={idx} className="hover:bg-[#fbf9f5] transition">
                  <td className="p-3 font-bold text-stone-900">{z.name}</td>
                  <td className="p-3">
                    <span className={`font-bold ${z.score >= 80 ? 'text-emerald-700' : z.score >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {z.score} / 100
                    </span>
                  </td>
                  <td className="p-3 text-stone-700">{z.defects} defects</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      z.status === 'Good' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      z.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {z.status}
                    </span>
                  </td>
                  <td className="p-3 text-stone-500">{z.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
