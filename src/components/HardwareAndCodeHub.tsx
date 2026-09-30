import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  CheckCircle2
} from 'lucide-react';
import { 
  PYTHON_DETECT_SCRIPT, 
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
      <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                Hardware, Firmware & Python AI Scripts
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-300">
                READY FOR PHYSICAL ROVER & EXPO DEMO
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Complete source code for Phase 1 (YOLO detection), Phase 2 (FastAPI backend), and Phase 5 (ESP32 Rover firmware).
            </p>
          </div>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#ede4d3] p-1.5 rounded-xl border border-[#dfceb8] text-xs font-mono overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('powershell')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'powershell' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          1. PowerShell Setup Guide
        </button>

        <button
          onClick={() => setActiveTab('detect_py')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'detect_py' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          2. ai/detection/detect.py
        </button>

        <button
          onClick={() => setActiveTab('esp32_ino')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'esp32_ino' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          3. hardware/esp32_rover.ino
        </button>

        <button
          onClick={() => setActiveTab('server_py')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'server_py' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          4. backend/server.py
        </button>

        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            activeTab === 'wiring' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          5. Wiring Pinout & Schematic
        </button>
      </div>

      {/* Tab 1: PowerShell Terminal Guide */}
      {activeTab === 'powershell' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-600" />
                WINDOWS POWERSHELL SETUP COMMANDS
              </span>
              <button
                onClick={() => handleCopy(powerShellCommands, 'ps')}
                className="px-3 py-1.5 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-mono flex items-center gap-1.5 transition font-bold"
              >
                {copiedKey === 'ps' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ps' ? 'Copied to Clipboard!' : 'Copy All Commands'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-amber-200 leading-relaxed overflow-x-auto shadow-inner">
              {powerShellCommands}
            </pre>

            {/* Expected Terminal Output preview */}
            <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#dfceb8] space-y-2">
              <div className="text-[11px] font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>EXPECTED VERIFICATION OUTPUT:</span>
              </div>
              <pre className="text-xs font-mono text-stone-700 p-3 bg-white rounded border border-[#dfceb8]">
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
        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-stone-900 block">
                ai/detection/detect.py
              </span>
              <span className="text-[11px] text-stone-500">
                Phase 1: Real-time YOLOv11 Road Defect Detector with Severity & BBox extraction
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(PYTHON_DETECT_SCRIPT, 'detect')}
                className="px-3 py-1.5 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-mono flex items-center gap-1.5 transition font-bold"
              >
                {copiedKey === 'detect' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'detect' ? 'Copied!' : 'Copy Script'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('detect.py', PYTHON_DETECT_SCRIPT)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-96 shadow-inner">
            {PYTHON_DETECT_SCRIPT}
          </pre>
        </div>
      )}

      {/* Tab 3: ESP32 Arduino Firmware */}
      {activeTab === 'esp32_ino' && (
        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-stone-900 block">
                hardware/esp32_rover_firmware.ino
              </span>
              <span className="text-[11px] text-stone-500">
                Phase 5: ESP32 + MPU6050 (I2C) + Neo-6M GPS (UART) + HC-SR04 + WiFi HTTP Telemetry
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(ESP32_FIRMWARE_CODE, 'esp32')}
                className="px-3 py-1.5 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-mono flex items-center gap-1.5 transition font-bold"
              >
                {copiedKey === 'esp32' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'esp32' ? 'Copied!' : 'Copy Firmware'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('esp32_rover_firmware.ino', ESP32_FIRMWARE_CODE)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ino</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-amber-300 leading-relaxed overflow-x-auto max-h-96 shadow-inner">
            {ESP32_FIRMWARE_CODE}
          </pre>
        </div>
      )}

      {/* Tab 4: Python Backend Server */}
      {activeTab === 'server_py' && (
        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-stone-900 block">
                backend/server.py
              </span>
              <span className="text-[11px] text-stone-500">
                Phase 2: FastAPI High-Speed Telemetry Ingestion & Sensor Fusion Hub
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(PYTHON_BACKEND_SERVER, 'server')}
                className="px-3 py-1.5 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-800 border border-[#dfceb8] text-xs font-mono flex items-center gap-1.5 transition font-bold"
              >
                {copiedKey === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'server' ? 'Copied!' : 'Copy Server'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile('server.py', PYTHON_BACKEND_SERVER)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-96 shadow-inner">
            {PYTHON_BACKEND_SERVER}
          </pre>
        </div>
      )}

      {/* Tab 5: Hardware Wiring Pinout */}
      {activeTab === 'wiring' && (
        <div className="bg-white border border-[#dfceb8] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfceb8]">
            <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
              ESP32 HARDWARE WIRING & PINOUT ARCHITECTURE
            </h3>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              5V / 3.3V POWER RAILS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-stone-500 border-b border-[#dfceb8] bg-[#f5f0e5]">
                <tr>
                  <th className="p-3">SENSOR / MODULE</th>
                  <th className="p-3">ESP32 PINS</th>
                  <th className="p-3">POWER SUPPLY</th>
                  <th className="p-3">ROLE IN SENSOR FUSION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede4d3]">
                {WIRING_PINOUT_GUIDE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#fbf9f5] transition">
                    <td className="p-3 font-bold text-stone-900">{row.module}</td>
                    <td className="p-3 text-red-700 font-bold">{row.esp32Pin}</td>
                    <td className="p-3 text-stone-700">{row.power}</td>
                    <td className="p-3 text-stone-600 font-sans text-[11px]">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
