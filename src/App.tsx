import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LiveRoverConsole } from './components/LiveRoverConsole';
import { InteractiveMap } from './components/InteractiveMap';
import { InfrastructureDNAViewer } from './components/InfrastructureDNAViewer';
import { RiskEngineTuner } from './components/RiskEngineTuner';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { HardwareAndCodeHub } from './components/HardwareAndCodeHub';
import { WorkOrderModal } from './components/WorkOrderModal';
import { InfrastructureDNA, RoverTelemetryState, RiskWeights } from './types';
import { INITIAL_DEFECTS } from './data/mockDefects';
import { DEFAULT_WEIGHTS, calculateRiskScore, getSeverityTier, getRecommendedAction } from './utils/riskEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware'>('console');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [defects, setDefects] = useState<InfrastructureDNA[]>(INITIAL_DEFECTS);
  const [selectedDefect, setSelectedDefect] = useState<InfrastructureDNA>(INITIAL_DEFECTS[0]);
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [workOrderDefect, setWorkOrderDefect] = useState<InfrastructureDNA | null>(null);

  // Live Rover Telemetry State
  const [roverState, setRoverState] = useState<RoverTelemetryState>({
    is_connected: true,
    is_patrolling: true,
    battery_pct: 88,
    rover_speed_kmh: 18.5,
    latitude: 12.9249,
    longitude: 80.1000,
    heading_deg: 42,
    current_mpu: {
      ax: 0.05,
      ay: -0.08,
      az: 1.02,
      gx: 0.8,
      gy: -0.4,
      gz: 0.2,
    },
    ultrasonic_cm: 9.4,
    gps_satellites: 11,
    wifi_rssi_dbm: -58,
    mode: 'AUTONOMOUS',
  });

  // Simulated road vibration & slight rover drift
  useEffect(() => {
    const interval = setInterval(() => {
      setRoverState((prev) => {
        const jitter = (Math.random() - 0.5) * 0.08;
        const driftLat = (Math.random() - 0.48) * 0.00008;
        const driftLng = (Math.random() - 0.48) * 0.00008;

        return {
          ...prev,
          latitude: +(prev.latitude + driftLat).toFixed(6),
          longitude: +(prev.longitude + driftLng).toFixed(6),
          current_mpu: {
            ...prev.current_mpu,
            ax: +(prev.current_mpu.ax + (Math.random() - 0.5) * 0.04).toFixed(2),
            ay: +(prev.current_mpu.ay + (Math.random() - 0.5) * 0.04).toFixed(2),
            az: +(1.0 + jitter).toFixed(2),
          },
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Handler for simulating physical bump shock (+3.42 G spike)
  const handleSimulateBump = () => {
    setRoverState((prev) => ({
      ...prev,
      current_mpu: {
        ...prev.current_mpu,
        az: 3.42,
        ax: 0.45,
        ay: -0.62,
        gx: 14.8,
        gy: -6.2,
      },
    }));

    // Reset back to baseline after shock wave
    setTimeout(() => {
      setRoverState((prev) => ({
        ...prev,
        current_mpu: {
          ...prev.current_mpu,
          az: 1.02,
          ax: 0.05,
          ay: -0.08,
          gx: 0.8,
          gy: -0.4,
        },
      }));
    }, 1400);
  };

  // Add new synthesized defect to state
  const handleNewDefectMinted = (newDNA: InfrastructureDNA) => {
    setDefects((prev) => [newDNA, ...prev]);
    setSelectedDefect(newDNA);
  };

  // Update status (e.g. mark resolved)
  const handleUpdateStatus = (defectId: string, newStatus: InfrastructureDNA['status']) => {
    setDefects((prev) =>
      prev.map((d) => (d.defect_id === defectId ? { ...d, status: newStatus } : d))
    );
    if (selectedDefect.defect_id === defectId) {
      setSelectedDefect((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Recalculate all defects using tuned risk weights
  const handleApplyWeightsToAll = () => {
    setDefects((prev) =>
      prev.map((d) => {
        const newScore = calculateRiskScore(d.risk_breakdown, riskWeights);
        const newSeverity = getSeverityTier(newScore);
        const newAction = getRecommendedAction(newScore, d.type);
        return {
          ...d,
          risk_score: newScore,
          severity: newSeverity,
          recommended_action: newAction,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-stone-900 flex font-sans selection:bg-red-600 selection:text-white">
      {/* Left-Side Dashboard Sidebar — matching res-qer.vercel.app with InfraSight prominent */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roverState={roverState}
        onSimulateBump={handleSimulateBump}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header & Telemetry Bar */}
        <Header
          activeTab={activeTab}
          roverState={roverState}
          onSimulateBump={handleSimulateBump}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Tab 1: Live Rover Console & YOLO Defect Ingest */}
          {activeTab === 'console' && (
            <div className="space-y-6">
              <LiveRoverConsole
                roverState={roverState}
                onSimulateBump={handleSimulateBump}
                onNewDefectMinted={handleNewDefectMinted}
              />

              {/* Currently Active Defect DNA Inspection */}
              <div className="pt-2">
                <InfrastructureDNAViewer
                  defect={selectedDefect}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenWorkOrder={(defect) => setWorkOrderDefect(defect)}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Leaflet Municipal Map & Infrastructure DNA Registry */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <InteractiveMap
                defects={defects}
                onSelectDefect={(d) => setSelectedDefect(d)}
                selectedDefect={selectedDefect}
                roverLocation={{ lat: roverState.latitude, lng: roverState.longitude }}
              />

              {/* Defect DNA Details Section */}
              <div className="pt-2">
                <InfrastructureDNAViewer
                  defect={selectedDefect}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenWorkOrder={(defect) => setWorkOrderDefect(defect)}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Dynamic Risk Engine Calibrator */}
          {activeTab === 'risk_tuner' && (
            <RiskEngineTuner
              weights={riskWeights}
              onUpdateWeights={(w) => setRiskWeights(w)}
              onApplyToAll={handleApplyWeightsToAll}
            />
          )}

          {/* Tab 4: Predictive Analytics & Lifecycle Decay */}
          {activeTab === 'predictive' && <PredictiveAnalytics />}

          {/* Tab 5: Hardware & Python Code Hub */}
          {activeTab === 'hardware' && <HardwareAndCodeHub />}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#dfceb8] bg-[#f5f0e5] py-4 px-6 text-center text-xs font-mono text-stone-600">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
            <span className="font-bold text-stone-900 tracking-wide">
              INFRASIGHT • AUTONOMOUS ROAD DEFECT AI
            </span>
            <span>Sensor Fusion: Camera (YOLOv11) + MPU6050 + GPS Neo-6M + HC-SR04</span>
            <span className="text-red-700 font-bold">Powered by RESQER Platform</span>
          </div>
        </footer>
      </div>

      {/* Municipal Work Order Printable Modal */}
      <WorkOrderModal
        defect={workOrderDefect}
        onClose={() => setWorkOrderDefect(null)}
        onDispatch={(defectId) => {
          handleUpdateStatus(defectId, 'DISPATCHED');
        }}
      />
    </div>
  );
}
