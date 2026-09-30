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
  Layers,
  ShieldAlert,
  Zap
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
    <header className="bg-white/95 backdrop-blur-md border-b border-beige-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Rover Telemetry Strip in ResQer Theme */}
      <div className="px-4 lg:px-6 py-2 bg-[#f5f0e5] border-b border-[#dfceb8] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-[#dfceb8] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-stone-900 font-bold">ROVER-01: ONLINE</span>
          </div>

          <div className="h-3 w-px bg-[#dfceb8] hidden sm:block" />

          <div className="flex items-center gap-1.5 text-stone-600">
            <Radio className="w-3.5 h-3.5 text-red-600" />
            <span>SPEED: <strong className="text-stone-900">{roverState.rover_speed_kmh.toFixed(1)} km/h</strong></span>
          </div>

          <div className="h-3 w-px bg-[#dfceb8] hidden sm:block" />

          <div className="flex items-center gap-1.5 text-stone-600">
            <MapPin className="w-3.5 h-3.5 text-stone-700" />
            <span>GPS: <strong className="text-stone-900">{roverState.latitude.toFixed(4)}°N, {roverState.longitude.toFixed(4)}°E</strong></span>
          </div>

          <div className="h-3 w-px bg-[#dfceb8] hidden md:block" />

          <div className="hidden md:flex items-center gap-1.5 text-stone-600">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>MPU6050 Az: <strong className={roverState.current_mpu.az > 2.0 ? "text-red-700 font-bold" : "text-stone-900"}>
              {roverState.current_mpu.az.toFixed(2)}G
            </strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateBump}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] shadow-2xs transition flex items-center gap-1 text-[11px] font-sans font-medium"
            title="Simulate hitting a pothole with MPU6050 vibration spike"
          >
            <Zap className="w-3 h-3 text-red-600" />
            <span>Simulate Road Bump</span>
          </button>

          <button
            onClick={onLaunchExpoDemo}
            className="px-3.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-sans font-bold shadow-xs transition flex items-center gap-1.5 text-xs animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>🚀 Run Expo 10-Step Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 p-0.5 shadow-sm flex items-center justify-center text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-stone-900 font-mono">
                RESQER
              </h1>
              <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded tracking-wider uppercase font-mono shadow-2xs">
                INFRASIGHT
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-stone-500 bg-[#ede4d3] border border-[#dfceb8] px-2 py-0.5 rounded font-semibold">
                AI + SENSOR FUSION
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Autonomous Road Defect Inspection Rover & Infrastructure DNA Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <nav className="flex items-center gap-1 bg-[#ede4d3] p-1 rounded-xl border border-[#dfceb8] text-xs font-medium">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'console'
                ? 'bg-white text-stone-900 font-bold shadow-xs border border-[#dfceb8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-red-600" />
            <span>Live AI Console</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'map'
                ? 'bg-white text-stone-900 font-bold shadow-xs border border-[#dfceb8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Municipal Map & DNA</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_tuner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'risk_tuner'
                ? 'bg-white text-stone-900 font-bold shadow-xs border border-[#dfceb8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-stone-700" />
            <span>Risk Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'predictive'
                ? 'bg-white text-stone-900 font-bold shadow-xs border border-[#dfceb8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-stone-700" />
            <span>Predictive ROI</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'hardware'
                ? 'bg-white text-stone-900 font-bold shadow-xs border border-[#dfceb8]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-stone-700" />
            <span>Hardware & Code</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
