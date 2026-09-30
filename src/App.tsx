import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveRoverConsole } from './components/LiveRoverConsole';
import { InteractiveMap } from './components/InteractiveMap';
import { InfrastructureDNAViewer } from './components/InfrastructureDNAViewer';
import { RiskEngineTuner } from './components/RiskEngineTuner';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { HardwareAndCodeHub } from './components/HardwareAndCodeHub';
import { ExpoDemoModal } from './components/ExpoDemoModal';
import { WorkOrderModal } from './components/WorkOrderModal';
import { InfrastructureDNA, RoverTelemetryState, RiskWeights } from './types';
import { INITIAL_DEFECTS } from './data/mockDefects';
import { DEFAULT_WEIGHTS, calculateRiskScore, getSeverityTier, getRecommendedAction } from './utils/riskEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'console' | 'map' | 'risk_tuner' | 'predictive' | 'hardware'>('console');
  const [defects, setDefects] = useState<InfrastructureDNA[]>(INITIAL_DEFECTS);
  const [selectedDefect, setSelectedDefect] = useState<InfrastructureDNA>(INITIAL_DEFECTS[0]);
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [isExpoDemoOpen, setIsExpoDemoOpen] = useState<boolean>(false);
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
        // Natural road vibration jitter around 1.0G
        const jitterZ = 0.98 + (Math.random() * 0.08 - 0.04);
        const jitterX = (Math.random() * 0.06 - 0.03);
        const jitterY = (Math.random() * 0.06 - 0.03);

        // Keep lat/lng drifting along Guindy corridor
        const latDrift = prev.latitude + (Math.random() * 0.00004 - 0.00002);
        const lngDrift = prev.longitude + (Math.random() * 0.00004 - 0.00002);

        return {
          ...prev,
          latitude: latDrift,
          longitude: lngDrift,
          current_mpu: {
            ax: parseFloat(jitterX.toFixed(2)),
            ay: parseFloat(jitterY.toFixed(2)),
            az: parseFloat(jitterZ.toFixed(2)),
            gx: parseFloat((Math.random() * 1.5 - 0.75).toFixed(1)),
            gy: parseFloat((Math.random() * 1.5 - 0.75).toFixed(1)),
            gz: parseFloat((Math.random() * 0.8 - 0.4).toFixed(1)),
          },
        };
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Trigger high impact bump on MPU6050
  const handleSimulateBump = () => {
    setRoverState((prev) => ({
      ...prev,
      current_mpu: {
        ...prev.current_mpu,
        az: 3.42,
        gx: 14.8,
        gy: 8.4,
      },
    }));

    // Reset back to normal after shock dissipates
    setTimeout(() => {
      setRoverState((prev) => ({
        ...prev,
        current_mpu: {
          ...prev.current_mpu,
          az: 1.02,
        },
      }));
    }, 1200);
  };

  // Add new minted DNA
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header & Telemetry Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roverState={roverState}
        onLaunchExpoDemo={() => setIsExpoDemoOpen(true)}
        onSimulateBump={handleSimulateBump}
      />

      {/* Main Content Area */}
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

        {/* Tab 2: Municipal Map & Infrastructure DNA Directory */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <InteractiveMap
              defects={defects}
              onSelectDefect={(defect) => setSelectedDefect(defect)}
              selectedDefect={selectedDefect}
              roverLocation={{ lat: roverState.latitude, lng: roverState.longitude }}
            />

            {/* Detailed DNA View for Selected Defect */}
            <InfrastructureDNAViewer
              defect={selectedDefect}
              onUpdateStatus={handleUpdateStatus}
              onOpenWorkOrder={(defect) => setWorkOrderDefect(defect)}
            />
          </div>
        )}

        {/* Tab 3: Dynamic Risk Engine Calibrator */}
        {activeTab === 'risk_tuner' && (
          <RiskEngineTuner
            weights={riskWeights}
            onUpdateWeights={setRiskWeights}
            onApplyToAll={handleApplyWeightsToAll}
          />
        )}

        {/* Tab 4: Predictive Deterioration & Municipal ROI */}
        {activeTab === 'predictive' && <PredictiveAnalytics />}

        {/* Tab 5: Hardware & Python AI Scripts Hub */}
        {activeTab === 'hardware' && <HardwareAndCodeHub />}
      </main>

      {/* Expo Demo 10-Step Interactive Presentation Modal */}
      <ExpoDemoModal
        isOpen={isExpoDemoOpen}
        onClose={() => setIsExpoDemoOpen(false)}
        onCompleteDemo={(dna) => {
          handleNewDefectMinted(dna);
          setActiveTab('console');
        }}
      />

      {/* Municipal Work Order Printable Modal */}
      <WorkOrderModal
        defect={workOrderDefect}
        onClose={() => setWorkOrderDefect(null)}
        onDispatch={(defectId) => {
          handleUpdateStatus(defectId, 'DISPATCHED');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          <span>ResQer InfraSight • Project Expo 2026</span>
          <span>Sensor Fusion: Camera (YOLOv11) + MPU6050 + GPS Neo-6M + HC-SR04</span>
          <span className="text-amber-400 font-bold">Autonomous Municipal Infrastructure Digital Twin</span>
        </div>
      </footer>
    </div>
  );
}
