import React, { useState, useEffect, useRef } from 'react';
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
import { fetchLiveTelemetry, fetchDefects, syncLiveLocation } from './utils/api';

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

  // 1. Live Device GPS (Where the user actually is)
  const [hasDeviceGps, setHasDeviceGps] = useState(false);
  const [hardwareLive, setHardwareLive] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const geoId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = +pos.coords.latitude.toFixed(6);
          const lng = +pos.coords.longitude.toFixed(6);
          setHasDeviceGps(true);
          setRoverState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
          syncLiveLocation(lat, lng);
        },
        (err) => {
          console.warn('Browser GPS permission or signal pending:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(geoId);
    }
  }, []);

  // 2. Simulated road vibration & slight drift ONLY when offline / disconnected
  useEffect(() => {
    if (hardwareLive || hasDeviceGps) return; // Do not overwrite live hardware/device GPS!

    const interval = setInterval(() => {
      setRoverState((prev) => {
        const jitter = (Math.random() - 0.5) * 0.08;
        return {
          ...prev,
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
  }, [hardwareLive, hasDeviceGps]);

  // 3. Poll live hardware telemetry from backend (ESP32 -> Backend -> Frontend)
  useEffect(() => {
    const pollTelemetry = async () => {
      try {
        const data = await fetchLiveTelemetry();
        if (data && data.is_connected) {
          setHardwareLive(true);
          const t = data.telemetry;
          setRoverState((prev) => ({
            ...prev,
            is_connected: true,
            // Only overwrite GPS from ESP32 if ESP32 sends a real locked coordinate (> 0)
            latitude: (t.latitude && t.latitude !== 0 && !hasDeviceGps) ? t.latitude : prev.latitude,
            longitude: (t.longitude && t.longitude !== 0 && !hasDeviceGps) ? t.longitude : prev.longitude,
            current_mpu: {
              ...prev.current_mpu,
              ax: t.ax,
              ay: t.ay,
              az: t.az,
            },
            ultrasonic_cm: t.depth_cm,
            battery_pct: t.battery_pct,
            heading_deg: t.heading_deg,
            gps_satellites: t.gps_satellites,
          }));
        } else {
          setHardwareLive(false);
        }
      } catch {
        setHardwareLive(false);
      }
    };

    const interval = setInterval(pollTelemetry, 1500);
    pollTelemetry();
    return () => clearInterval(interval);
  }, [hasDeviceGps]);

  // 4. Poll backend defects database so real camera captures appear immediately in the feed!
  const lastTopDefectIdRef = useRef<string>('');
  useEffect(() => {
    const pollDefects = async () => {
      try {
        const backendDefects = await fetchDefects();
        if (backendDefects && backendDefects.length > 0) {
          const mapped: InfrastructureDNA[] = backendDefects.map((d: any) => {
            const rawBreakdown = {
              severity: d.severity === 'CRITICAL' ? 90 : 70,
              traffic_exposure: 85,
              population_exposure: 80,
              safety_risk: d.severity === 'CRITICAL' ? 95 : 72,
              deterioration: 75,
            };
            const riskScore = d.risk_score || calculateRiskScore(rawBreakdown);

            // Format real date and time
            const dateObj = d.timestamp ? new Date(d.timestamp) : new Date();
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedDate = d.detected_at || `${dateStr} • ${timeStr}`;

            return {
              defect_id: d.defect_id,
              type: d.type as any,
              confidence: d.confidence > 1 ? +(d.confidence / 100).toFixed(3) : +d.confidence.toFixed(3),
              severity: d.severity as any,
              latitude: d.latitude,
              longitude: d.longitude,
              location_name: d.location_name || 'Guindy Industrial Sector',
              road_name: d.road_name || 'GST Corridor Patrol Lane',
              traffic_exposure: d.traffic_exposure || 'HIGH',
              deterioration: d.deterioration || 'RISING',
              risk_score: riskScore,
              dimensions: d.dimensions || { length_cm: 65, width_cm: 50, depth_cm: 9.2 },
              sensor_telemetry: {
                accel_x_g: d.sensor_telemetry?.accel_x_g ?? 0.05,
                accel_y_g: d.sensor_telemetry?.accel_y_g ?? -0.08,
                accel_z_spike_g: d.sensor_telemetry?.accel_z_spike_g ?? 1.02,
                gyro_pitch_rate: 12.4,
                gyro_roll_rate: -4.2,
                ultrasonic_depth_cm: d.sensor_telemetry?.ultrasonic_depth_cm ?? 9.2,
                rover_speed_kmh: 18.5,
                heading_deg: 42,
                timestamp: d.timestamp || new Date().toISOString(),
              },
              risk_breakdown: rawBreakdown,
              recommended_action: d.recommended_action || d.action || getRecommendedAction(riskScore, d.type),
              status: (d.status as any) || 'REPORTED',
              detected_at: formattedDate,
              image_url: d.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
              bounding_box: d.bounding_box || { x: 25, y: 30, width: 50, height: 40 },
              work_order_id: d.work_order_id || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              estimated_repair_cost_inr: d.estimated_repair_cost_inr || (riskScore > 80 ? 5500 : 3200),
            };
          });

          // If a new defect was minted/captured, automatically select it and make it prominent!
          if (mapped.length > 0 && mapped[0].defect_id !== lastTopDefectIdRef.current) {
            lastTopDefectIdRef.current = mapped[0].defect_id;
            setSelectedDefect(mapped[0]);
          }
          setDefects(mapped);
        }
      } catch (err) {
        // Fallback silently
      }
    };

    pollDefects();
    const interval = setInterval(pollDefects, 2000);
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
