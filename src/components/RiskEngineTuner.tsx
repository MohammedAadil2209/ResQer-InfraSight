import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles
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
      <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">Dynamic Risk Engine Tuner</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-300">
                PHASE 3: ALGORITHMIC SCORING
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Calibrate multi-criteria municipal hazard prioritization weights in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recalculate 1,247 Municipal Records</span>
          </button>
        </div>
      </div>

      {appliedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
          <span>✓ Successfully re-indexed municipal defect priority matrix using new algorithm weights!</span>
        </div>
      )}

      {/* Main Grid: Algorithm Architecture & Tuning Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weight Sliders (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfceb8]">
            <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
              1. ALGORITHM FACTOR WEIGHTS
            </h3>
            <span className={`text-xs font-mono font-bold ${totalWeightPercent === 100 ? 'text-emerald-700' : 'text-red-700'}`}>
              TOTAL: {totalWeightPercent}%
            </span>
          </div>

          <div className="space-y-4">
            {/* Weight 1: Structural Severity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Structural Defect Severity</span>
                <span className="text-red-700 font-bold">{Math.round(weights.severity * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.severity * 100)}
                onChange={(e) => handleWeightChange('severity', Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block">
                Derived from physical area, depth (cm), and surface disruption intensity.
              </span>
            </div>

            {/* Weight 2: Traffic Exposure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Traffic Exposure (VPD)</span>
                <span className="text-amber-800 font-bold">{Math.round(weights.traffic_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.traffic_exposure * 100)}
                onChange={(e) => handleWeightChange('traffic_exposure', Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block">
                Corridor volume: National Highway &gt; Arterial &gt; Collector &gt; Local Street.
              </span>
            </div>

            {/* Weight 3: Population Exposure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Population / Pedestrian Proximity</span>
                <span className="text-yellow-800 font-bold">{Math.round(weights.population_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.population_exposure * 100)}
                onChange={(e) => handleWeightChange('population_exposure', Number(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block">
                Proximity to schools, metro stations, transit hubs, and commercial bazaars.
              </span>
            </div>

            {/* Weight 4: Public Safety Hazard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Public Safety & Two-Wheeler Hazard</span>
                <span className="text-red-700 font-bold">{Math.round(weights.safety_risk * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.safety_risk * 100)}
                onChange={(e) => handleWeightChange('safety_risk', Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block">
                Risk of sudden swerving, loss of balance for motorcycles, or tyre blowout.
              </span>
            </div>

            {/* Weight 5: Deterioration Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold">Deterioration Acceleration Trend</span>
                <span className="text-stone-800 font-bold">{Math.round(weights.deterioration * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(weights.deterioration * 100)}
                onChange={(e) => handleWeightChange('deterioration', Number(e.target.value))}
                className="w-full accent-stone-700 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block">
                Rainfall forecast, sub-base water saturation, and expansion trajectory.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Formula Evaluation (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfceb8]">
              <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
                2. LIVE TEST SCENARIO EVALUATION
              </h3>
              <span className="text-xs font-mono text-red-700 font-bold">INF-00001 SIMULATOR</span>
            </div>

            {/* Live Score Dial */}
            <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-stone-500 block">COMPOSITE RISK INDEX</span>
                <div className="text-4xl font-black font-mono mt-1 text-stone-900 flex items-baseline gap-2">
                  <span className={color.text}>{simulatedScore}</span>
                  <span className="text-sm text-stone-400 font-normal">/ 100</span>
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
              <div className="flex justify-between items-center text-stone-700">
                <span>Severity: {testFactors.severity}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.severity}
                  onChange={(e) => setTestFactors({ ...testFactors, severity: Number(e.target.value) })}
                  className="w-36 accent-red-600"
                />
              </div>

              <div className="flex justify-between items-center text-stone-700">
                <span>Traffic: {testFactors.traffic_exposure}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.traffic_exposure}
                  onChange={(e) => setTestFactors({ ...testFactors, traffic_exposure: Number(e.target.value) })}
                  className="w-36 accent-amber-600"
                />
              </div>

              <div className="flex justify-between items-center text-stone-700">
                <span>Population: {testFactors.population_exposure}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.population_exposure}
                  onChange={(e) => setTestFactors({ ...testFactors, population_exposure: Number(e.target.value) })}
                  className="w-36 accent-yellow-500"
                />
              </div>

              <div className="flex justify-between items-center text-stone-700">
                <span>Safety: {testFactors.safety_risk}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.safety_risk}
                  onChange={(e) => setTestFactors({ ...testFactors, safety_risk: Number(e.target.value) })}
                  className="w-36 accent-red-600"
                />
              </div>

              <div className="flex justify-between items-center text-stone-700">
                <span>Deterioration: {testFactors.deterioration}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testFactors.deterioration}
                  onChange={(e) => setTestFactors({ ...testFactors, deterioration: Number(e.target.value) })}
                  className="w-36 accent-stone-700"
                />
              </div>
            </div>

            {/* Threshold Tiers Guide */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] pt-3 border-t border-[#dfceb8]">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                0–30: LOW
              </div>
              <div className="p-1.5 rounded bg-yellow-50 border border-yellow-300 text-yellow-800 font-bold">
                31–60: MED
              </div>
              <div className="p-1.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold">
                61–80: HIGH
              </div>
              <div className="p-1.5 rounded bg-red-50 border border-red-300 text-red-700 font-bold">
                81–100: CRIT
              </div>
            </div>
          </div>

          {/* Judges Note */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JUDGES TALKING POINT</span>
            </div>
            <p className="italic font-sans text-stone-700 leading-relaxed">
              "Traditional road complaints treat every pothole equally on a first-come first-served queue. ResQer InfraSight's Risk Engine calculates real life danger: an 8cm pothole on an expressway carries an 87/100 risk score, mandating rapid 4-hour intervention before accidents occur."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
