import React from 'react';
import { 
  Cpu, 
  MapPin, 
  Sliders, 
  TrendingUp, 
  Terminal, 
  Radio, 
  Zap, 
  ShieldAlert, 
  Compass, 
  Activity,
  Layers,
  X
} from 'lucide-react';
import { RoverTelemetryState } from '../types';

interface SidebarProps {
  activeTab: 'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware';
  setActiveTab: (tab: 'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware') => void;
  roverState: RoverTelemetryState;
  onSimulateBump: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  roverState,
  onSimulateBump,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'console' as const,
      label: 'Live AI Console',
      icon: Cpu,
      badge: 'YOLOv11',
      badgeColor: 'bg-red-50 text-red-700 border-red-300',
    },
    {
      id: 'map' as const,
      label: 'Municipal Map & DNA',
      icon: MapPin,
      badge: '7 Defect Pins',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    {
      id: 'risk_tuner' as const,
      label: 'Risk Engine Tuner',
      icon: Sliders,
      badge: 'Score: 87',
      badgeColor: 'bg-red-50 text-red-700 border-red-300',
    },
    {
      id: 'predictive' as const,
      label: 'Predictive ROI & Decay',
      icon: TrendingUp,
      badge: '₹1.84 Cr',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    {
      id: 'hardware' as const,
      label: 'Hardware & Code Hub',
      icon: Terminal,
      badge: 'ESP32',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-64 bg-white border-r border-[#dfceb8] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-40 shadow-xs transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:sticky`}
      >
        <div>
          {/* Brand Header — "INFRASIGHT" VISIBLE AS MAIN PROMINENT NAME */}
          <div className="p-4 border-b border-[#dfceb8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-stone-900 font-mono">
                    INFRASIGHT
                  </h1>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-red-600 px-1.5 py-0.5 rounded font-mono shadow-2xs">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block font-mono">
                  RESQER ROVER PLATFORM
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rover Telemetry Widget */}
          <div className="mx-3 mt-3 p-3 rounded-xl bg-[#f5f0e5] border border-[#dfceb8] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-bold text-stone-900 font-mono text-[11px]">ROVER-01 ONLINE</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1 text-stone-600 border-t border-[#ede4d3]">
              <div>
                SPEED: <strong className="text-stone-900">{roverState.rover_speed_kmh.toFixed(1)} km/h</strong>
              </div>
              <div>
                BATTERY: <strong className="text-emerald-700">{roverState.battery_pct}%</strong>
              </div>
              <div className="col-span-2 truncate">
                SECTOR: <strong className="text-stone-900">Guindy Ind. 03</strong>
              </div>
            </div>

            <button
              onClick={onSimulateBump}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Zap className="w-3 h-3 text-red-600" />
              <span>Simulate Road Bump</span>
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
              Operations View
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-[#f5f0e5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white stroke-[2.5]' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-white text-red-700'
                          : 'bg-[#f5f0e5] text-stone-700 border border-[#dfceb8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with GPS and Operator Badge */}
        <div className="p-3 border-t border-[#dfceb8] space-y-2">
          {/* Real-time GPS coordinates info */}
          <div className="px-3 py-2 bg-[#fbf9f5] rounded-xl border border-[#dfceb8] text-[10px] font-mono text-stone-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-red-600" />
              <span>{roverState.latitude.toFixed(4)}°N, {roverState.longitude.toFixed(4)}°E</span>
            </div>
            <span className="text-emerald-700 font-bold">DGPS FIX</span>
          </div>

          {/* User/Operator Profile Tile */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#fbf9f5] rounded-xl border border-[#dfceb8] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] font-mono">
                IS
              </div>
              <div>
                <div className="font-bold text-stone-900 leading-tight text-[11px]">
                  Highways Division
                </div>
                <div className="text-[10px] text-stone-500 leading-tight">
                  Zone 03 Operator
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-600" title="System Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
