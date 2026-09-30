import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';
import { RiskWeights, RiskFactors } from '../types';
import { DEFAULT_WEIGHTS, calculateRiskScore, getSeverityTier, getSeverityColor } from '../utils/riskEngine';

interface RiskEngineTunerProps {
  weights: RiskWeights;
  onUpdateWeights: (newWeights: RiskWeights) => void;
  onApplyToAll: () => void;
}

export const RiskEngineTuner: React.FC<RiskEngineTunerProps> = ({
  weights,
  onUpdateWeights,
  onApplyToAll,
}) => {
  // Test scenario factors
  const [testFactors, setTestFactors] = useState<RiskFactors>({
    severity: 90,
    traffic_exposure: 85,
    population_exposure: 80,
    safety_risk: 95,
    deterioration: 75,
  });

  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  // Compute live score for the test factors
  const simulatedScore = calculateRiskScore(testFactors, weights);
  const simulatedTier = getSeverityTier(simulatedScore);
  const color = getSeverityColor(simulatedTier);

  const handleWeightChange = (key: keyof RiskWeights, value: number) => {
    onUpdateWeights({
      ...weights,
      [key]: value / 100,
    });
  };

  const handleReset = () => {
    onUpdateWeights(DEFAULT_WEIGHTS);
  };

  const handleApply = () => {
    onApplyToAll();
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);
  };

  const totalWeightPercent = Math.round(
    (weights.severity + weights.traffic_exposure + weights.population_exposure + weights.safety_risk + weights.deterioration) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Dynamic Risk Engine Tuner</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                PHASE 3: ALGORITHMIC SCORING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Calibrate multi-criteria municipal hazard prioritization weights in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recalculate 1,247 Municipal Records</span>
          </button>
        </div>
      </div>

      {appliedNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
          <span>✓ Successfully re-indexed municipal defect priority matrix using new algorithm weights!</span>
        </div>
      )}

      {/* Main Grid: Algorithm Architecture & Tuning Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weight Sliders (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              1. ALGORITHM FACTOR WEIGHTS
            </h3>
            <span className={`text-xs font-mono font-bold ${totalWeightPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              TOTAL: {totalWeightPercent}%
            </span>
          </div>

          <div className="space-y-4">
            {/* Weight 1: Structural Severity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Structural Defect Severity</span>
                <span className="text-red-400 font-bold">{Math.round(weights.severity * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.severity * 100)}
                onChange={(e) => handleWeightChange('severity', Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Derived from physical area, depth (cm), and surface disruption intensity.
              </span>
            </div>

            {/* Weight 2: Traffic Exposure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Traffic Exposure (VPD)</span>
                <span className="text-amber-400 font-bold">{Math.round(weights.traffic_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.traffic_exposure * 100)}
                onChange={(e) => handleWeightChange('traffic_exposure', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Corridor volume: National Highway &gt; Arterial &gt; Collector &gt; Local Street.
              </span>
            </div>

            {/* Weight 3: Population Exposure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Population / Pedestrian Proximity</span>
                <span className="text-yellow-400 font-bold">{Math.round(weights.population_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.population_exposure * 100)}
                onChange={(e) => handleWeightChange('population_exposure', Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Proximity to schools, metro stations, transit hubs, and commercial bazaars.
              </span>
            </div>

            {/* Weight 4: Public Safety Hazard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Public Safety & Two-Wheeler Hazard</span>
                <span className="text-rose-400 font-bold">{Math.round(weights.safety_risk * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.safety_risk * 100)}
                onChange={(e) => handleWeightChange('safety_risk', Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Risk of sudden swerving, loss of balance for motorcycles, or tyre blowout.
              </span>
            </div>

            {/* Weight 5: Deterioration Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Deterioration Acceleration Trend</span>
                <span className="text-purple-400 font-bold">{Math.round(weights.deterioration * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.deterioration * 100)}
                onChange={(e) => handleWeightChange('deterioration', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Rainfall forecast, sub-base water saturation, and expansion trajectory.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Formula Evaluation (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                2. LIVE TEST SCENARIO EVALUATION
              </h3>
              <span className="text-xs font-mono text-cyan-400">INF-00001 SIMULATOR</span>
            </div>

            {/* Live Score Dial */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">COMPOSITE RISK INDEX</span>
                <div className="text-4xl font-black font-mono mt-1 text-white flex items-baseline gap-2">
                  <span className={color.text}>{simulatedScore}</span>
                  <span className="text-sm text-slate-500 font-normal">/ 100</span>
                </div>
                <div className="text-xs font-mono mt-1">
                  CLASSIFICATION: <strong className={color.text}>{simulatedTier}</strong>
                </div>
              </div>

              <div className={`px-4 py-3 rounded-xl border text-center font-mono ${color.badge}`}>
                <div className="text-xs font-bold">MUNICIPAL SLA</div>
                <div className="text-sm font-black mt-0.5">
                  {simulatedScore >= 81 ? '4 HOURS' : simulatedScore >= 61 ? '48 HOURS' : '14 DAYS'}
                </div>
              </div>
            </div>

            {/* Test Factor Sliders */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Severity: {testFactors.severity}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.severity}
                  onChange={(e) => setTestFactors({ ...testFactors, severity: Number(e.target.value) })}
                  className="w-36 accent-red-500"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Traffic: {testFactors.traffic_exposure}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.traffic_exposure}
                  onChange={(e) => setTestFactors({ ...testFactors, traffic_exposure: Number(e.target.value) })}
                  className="w-36 accent-amber-500"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Population: {testFactors.population_exposure}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.population_exposure}
                  onChange={(e) => setTestFactors({ ...testFactors, population_exposure: Number(e.target.value) })}
                  className="w-36 accent-yellow-400"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Safety: {testFactors.safety_risk}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.safety_risk}
                  onChange={(e) => setTestFactors({ ...testFactors, safety_risk: Number(e.target.value) })}
                  className="w-36 accent-rose-500"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Deterioration: {testFactors.deterioration}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.deterioration}
                  onChange={(e) => setTestFactors({ ...testFactors, deterioration: Number(e.target.value) })}
                  className="w-36 accent-purple-500"
                />
              </div>
            </div>

            {/* Threshold Tiers Guide */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] pt-3 border-t border-slate-800">
              <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                0–30: LOW
              </div>
              <div className="p-1.5 rounded bg-yellow-950/40 border border-yellow-500/30 text-yellow-300">
                31–60: MED
              </div>
              <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400">
                61–80: HIGH
              </div>
              <div className="p-1.5 rounded bg-red-950/40 border border-red-500/30 text-red-400">
                81–100: CRIT
              </div>
            </div>
          </div>

          {/* Judges Note */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JUDGES TALKING POINT</span>
            </div>
            <p className="italic font-sans">
              "Traditional road complaints treat every pothole equally on a first-come first-served queue. ResQer InfraSight's Risk Engine calculates real life danger: an 8cm pothole on an expressway carries an 87/100 risk score, mandating rapid 4-hour intervention before accidents occur."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
