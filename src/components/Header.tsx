import React from 'react';
import { 
  Menu, 
  MapPin, 
  Activity, 
  Radio, 
  Zap, 
  Compass, 
  Layers
} from 'lucide-react';
import { RoverTelemetryState } from '../types';

interface HeaderProps {
  activeTab: 'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware';
  roverState: RoverTelemetryState;
  onSimulateBump: () => void;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  roverState,
  onSimulateBump,
  onOpenMobileSidebar,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'console':
        return 'LIVE ROVER AI INGESTION & VISION PIPELINE';
      case 'map':
        return 'MUNICIPAL GIS INFRASTRUCTURE RADAR & DNA';
      case 'risk_tuner':
        return 'MULTI-FACTOR DYNAMIC RISK ENGINE';
      case 'predictive':
        return 'PREDICTIVE DECAY & MUNICIPAL BUDGET ROI';
      case 'hardware':
        return 'HARDWARE SCHEMATICS & PYTHON AI SUITE';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#dfceb8] sticky top-0 z-20 shadow-xs">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Main Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#ede4d3] lg:hidden transition"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-900 tracking-wide uppercase font-mono hidden sm:inline-block">
                INFRASIGHT
              </span>
              <span className="text-stone-300 hidden sm:inline-block">/</span>
              <h2 className="text-xs sm:text-sm font-bold text-stone-800 tracking-tight font-mono truncate">
                {getTabTitle()}
              </h2>
              <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded tracking-wider uppercase font-mono shadow-2xs">
                LIVE VIEW
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono hidden md:block">
              Sector: Guindy Industrial Link, Chennai Metropolitan Area
            </div>
          </div>
        </div>

        {/* Right: Telemetry Quick Readouts & Bump Action */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-[#f5f0e5] border border-[#dfceb8] px-2.5 py-1 rounded-md text-stone-700 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-red-600" />
            <span>SPEED: <strong className="text-stone-900">{roverState.rover_speed_kmh.toFixed(1)} km/h</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-[#f5f0e5] border border-[#dfceb8] px-2.5 py-1 rounded-md text-stone-700 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>MPU: <strong className={roverState.current_mpu.az > 2.0 ? "text-red-700 font-bold" : "text-stone-900"}>
              {roverState.current_mpu.az.toFixed(2)}G
            </strong></span>
          </div>

          <button
            onClick={onSimulateBump}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] shadow-2xs transition flex items-center gap-1.5 text-xs font-sans font-medium"
            title="Simulate hitting a pothole with MPU6050 vibration spike"
          >
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Simulate Road Bump</span>
            <span className="sm:hidden">Bump</span>
          </button>
        </div>
      </div>
    </header>
  );
};
