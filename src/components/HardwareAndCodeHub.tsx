import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  FolderTree,
  AlertCircle
} from 'lucide-react';
import { 
  PYTHON_DETECT_SCRIPT, 
  PYTHON_TRAIN_SCRIPT, 
  ESP32_FIRMWARE_CODE, 
  PYTHON_BACKEND_SERVER, 
  WIRING_PINOUT_GUIDE 
} from '../data/hardwareAndScripts';

export const HardwareAndCodeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'powershell' | 'detect_py' | 'esp32_ino' | 'server_py' | 'wiring'>('powershell');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const powerShellCommands = `# 1. Open Windows PowerShell and navigate to projects directory:
D:
cd D:\\projects
mkdir ResQer-InfraSight
cd ResQer-InfraSight

# 2. Create the exact ResQer-InfraSight project scaffold:
mkdir ai\\models, ai\\datasets, ai\\detection, ai\\test_images
mkdir backend, frontend, hardware, data, docs

# 3. Create and activate Python 3.10 / 3.11 virtual environment:
python -m venv venv
venv\\Scripts\\activate

# 4. Install Ultralytics YOLOv11 & Computer Vision dependencies:
pip install ultralytics opencv-python numpy pillow fastapi uvicorn requests

# 5. Verify YOLO installation:
yolo checks
python -c "from ultralytics import YOLO; print('YOLO OK')"

# 6. Run the first detection test:
# Place any road test image into ai/test_images/road.jpg
python ai\\detection\\detect.py`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Hardware, Firmware & Python AI Scripts
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40">
                READY FOR PHYSICAL ROVER & EXPO DEMO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete source code for Phase 1 (YOLO detection), Phase 2 (FastAPI backend), and Phase 5 (ESP32 Rover firmware).
            </p>
          </div>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('powershell')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'powershell' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. PowerShell Setup Guide
        </button>

        <button
          onClick={() => setActiveTab('detect_py')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'detect_py' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. ai/detection/detect.py
        </button>

        <button
          onClick={() => setActiveTab('esp32_ino')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'esp32_ino' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. hardware/esp32_rover.ino
        </button>

        <button
          onClick={() => setActiveTab('server_py')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'server_py' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. backend/server.py
        </button>

        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'wiring' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          5. Wiring Pinout & Schematic
        </button>
      </div>

      {/* Tab 1: PowerShell Terminal Guide */}
      {activeTab === 'powershell' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                WINDOWS POWERSHELL SETUP COMMANDS
              </span>
              <button
                onClick={() => handleCopy(powerShellCommands, 'ps')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {copiedKey === 'ps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ps' ? 'Copied to Clipboard!' : 'Copy All Commands'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto">
              {powerShellCommands}
            </pre>

            {/* Expected Terminal Output preview */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>EXPECTED VERIFICATION OUTPUT:</span>
              </div>
              <pre className="text-xs font-mono text-slate-400 p-2 bg-slate-900 rounded border border-slate-800">
{`Ultralytics YOLO 8.3+ Python-3.11.4 torch-2.1.0+cu121 CUDA:0 (NVIDIA RTX)
Setup complete ✅ (8 CPUs, 16.0 GB RAM, 512 GB disk)
YOLO OK
[ResQer AI] Loading weights from: yolo11n.pt ...
[ResQer AI] Model loaded successfully.
Detection completed. Outputs saved to runs/detect/resqer_inspection`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: detect.py */}
      {activeTab === 'detect_py' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                ai/detection/detect.py
              </span>
              <span className="text-[11px] text-slate-400">
                Phase 1: Real-time YOLOv11 Road Defect Detector with Severity & BBox extraction
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(PYTHON_DETECT_SCRIPT, 'detect')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {copiedKey === 'detect' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'detect' ? 'Copied!' : 'Copy Script'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('detect.py', PYTHON_DETECT_SCRIPT)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-96">
            {PYTHON_DETECT_SCRIPT}
          </pre>
        </div>
      )}

      {/* Tab 3: ESP32 Arduino Firmware */}
      {activeTab === 'esp32_ino' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                hardware/esp32_rover_firmware.ino
              </span>
              <span className="text-[11px] text-slate-400">
                Phase 5: ESP32 + MPU6050 (I2C) + Neo-6M GPS (UART) + HC-SR04 + WiFi HTTP Telemetry
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(ESP32_FIRMWARE_CODE, 'esp32')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {copiedKey === 'esp32' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'esp32' ? 'Copied!' : 'Copy Firmware'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('esp32_rover_firmware.ino', ESP32_FIRMWARE_CODE)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ino</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 leading-relaxed overflow-x-auto max-h-96">
            {ESP32_FIRMWARE_CODE}
          </pre>
        </div>
      )}

      {/* Tab 4: Python Backend Server */}
      {activeTab === 'server_py' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                backend/server.py
              </span>
              <span className="text-[11px] text-slate-400">
                Phase 2: FastAPI High-Speed Telemetry Ingestion & Sensor Fusion Hub
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(PYTHON_BACKEND_SERVER, 'server')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {copiedKey === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'server' ? 'Copied!' : 'Copy Server'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('server.py', PYTHON_BACKEND_SERVER)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-96">
            {PYTHON_BACKEND_SERVER}
          </pre>
        </div>
      )}

      {/* Tab 5: Hardware Wiring Pinout */}
      {activeTab === 'wiring' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              ESP32 HARDWARE WIRING & PINOUT ARCHITECTURE
            </h3>
            <span className="text-xs font-mono text-emerald-400">5V / 3.3V POWER RAILS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="p-3">SENSOR / MODULE</th>
                  <th className="p-3">ESP32 PINS</th>
                  <th className="p-3">POWER SUPPLY</th>
                  <th className="p-3">ROLE IN SENSOR FUSION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {WIRING_PINOUT_GUIDE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-bold text-amber-400">{row.module}</td>
                    <td className="p-3 text-cyan-300">{row.esp32Pin}</td>
                    <td className="p-3 text-slate-300">{row.power}</td>
                    <td className="p-3 text-slate-300 font-sans text-[11px]">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-purple-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HARDWARE DEMO TIP FOR TOMORROW'S EXPO</span>
            </div>
            <p className="font-sans leading-relaxed">
              If showing the physical rover to judges, tap or shake the MPU6050 board gently with your finger. The live oscilloscope on this screen will instantly trigger the <strong>+3.4G Shock Spike</strong> indicator, demonstrating real-time hardware-in-the-loop sensor fusion!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
