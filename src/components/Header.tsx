import React from 'react';
import { 
  Radio, 
  Cpu, 
  MapPin, 
  Sliders, 
  TrendingUp, 
  Terminal, 
  Play, 
  Activity,
  Layers
} from 'lucide-react';
import { RoverTelemetryState } from '../types';

interface HeaderProps {
  activeTab: 'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware';
  setActiveTab: (tab: 'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware') => void;
  roverState: RoverTelemetryState;
  onLaunchExpoDemo: () => void;
  onSimulateBump: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  roverState,
  onLaunchExpoDemo,
  onSimulateBump,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner with Rover Telemetry Strip */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold">ROVER-01: ONLINE</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>SPEED: <strong className="text-cyan-300">{roverState.rover_speed_kmh.toFixed(1)} km/h</strong></span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>GPS: <strong className="text-amber-300">{roverState.latitude.toFixed(4)}°N, {roverState.longitude.toFixed(4)}°E</strong></span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden md:block" />

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>MPU6050 Az: <strong className={roverState.current_mpu.az > 2.0 ? "text-red-400 font-bold" : "text-purple-300"}>
              {roverState.current_mpu.az.toFixed(2)}G
            </strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateBump}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition flex items-center gap-1 text-[11px] font-sans font-medium"
            title="Simulate hitting a pothole with MPU6050 vibration spike"
          >
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Simulate Pothole Bump</span>
          </button>

          <button
            onClick={onLaunchExpoDemo}
            className="px-3.5 py-1 rounded-md bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-sans font-bold shadow-lg shadow-amber-900/30 transition flex items-center gap-1.5 text-xs animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>🚀 Run Expo 10-Step Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                ResQer InfraSight
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                AI + SENSOR FUSION
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Road Defect Inspection Rover & Infrastructure DNA Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'console'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Live AI Console</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Municipal Map & DNA</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_tuner')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'risk_tuner'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Risk Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'predictive'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Predictive ROI</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'hardware'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Hardware & Code</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
