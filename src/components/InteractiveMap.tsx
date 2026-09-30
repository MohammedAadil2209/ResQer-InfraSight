import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Dna, 
  CheckCircle2, 
  Clock,
  Navigation,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { InfrastructureDNA } from '../types';
import { getSeverityColor } from '../utils/riskEngine';

interface InteractiveMapProps {
  defects: InfrastructureDNA[];
  onSelectDefect: (defect: InfrastructureDNA) => void;
  selectedDefect: InfrastructureDNA | null;
  roverLocation: { lat: number; lng: number };
}

type MapTileStyle = 'streets' | 'dark' | 'satellite';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  defects,
  onSelectDefect,
  selectedDefect,
  roverLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const pathPolylineRef = useRef<L.Polyline | null>(null);
  const roverMarkerRef = useRef<L.Marker | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('streets');
  const [showHeatmapCircles, setShowHeatmapCircles] = useState<boolean>(true);
  const [roverTrail, setRoverTrail] = useState<[number, number][]>([
    [12.9230, 80.0980],
    [12.9238, 80.0989],
    [12.9244, 80.0995],
    [12.9249, 80.1000]
  ]);

  // Track rover movement for the polyline trail
  useEffect(() => {
    setRoverTrail((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last[0] - roverLocation.lat) < 0.000005 && Math.abs(last[1] - roverLocation.lng) < 0.000005) {
        return prev;
      }
      return [...prev.slice(-40), [roverLocation.lat, roverLocation.lng]];
    });
  }, [roverLocation]);

  // Filter defects
  const filteredDefects = defects.filter((d) => {
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
    if (severityFilter !== 'ALL') {
      if (severityFilter === 'RESOLVED' && d.status !== 'RESOLVED') return false;
      if (severityFilter !== 'RESOLVED' && d.severity !== severityFilter) return false;
    }
    return true;
  });

  const totalCount = 1247;
  const criticalCount = 184;
  const highCount = 327;
  const resolvedCount = 218;

  // Tile layer config helper (100% free, NO API KEY required)
  const getTileConfig = (style: MapTileStyle) => {
    switch (style) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          className: '',
          attribution: '&copy; Esri World Imagery | ResQer InfraSight',
        };
      case 'dark':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          className: 'dark-map-tiles',
          attribution: '&copy; OpenStreetMap | ResQer InfraSight',
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          className: '',
          attribution: '&copy; OpenStreetMap contributors | ResQer',
        };
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Chennai Guindy Industrial / OMR area
    const map = L.map(mapContainerRef.current, {
      center: [12.9750, 80.2000],
      zoom: 12,
      zoomControl: true,
    });

    const config = getTileConfig('streets');
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      className: config.className,
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer groups for markers, heatmaps, and trails
    const heatLayer = L.layerGroup().addTo(map);
    heatmapLayerRef.current = heatLayer;

    const trail = L.polyline([], {
      color: '#dc2626',
      weight: 3,
      opacity: 0.85,
      dashArray: '4, 8',
    }).addTo(map);
    pathPolylineRef.current = trail;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Force tile recalculation after layout stabilizes
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    const config = getTileConfig(tileStyle);
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      className: config.className,
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map);
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Update Polyline Path
  useEffect(() => {
    if (pathPolylineRef.current && roverTrail.length > 0) {
      pathPolylineRef.current.setLatLngs(roverTrail);
    }
  }, [roverTrail]);

  // Update Markers & Heatmap Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const heatGroup = heatmapLayerRef.current;
    if (!map || !markersGroup || !heatGroup) return;

    markersGroup.clearLayers();
    heatGroup.clearLayers();

    // 1. Draw Rover Marker with Leaflet divIcon
    const roverIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-red-600/30 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-white border-2 border-red-600 flex items-center justify-center shadow-md text-xs">
          🚗
        </div>
      </div>
    `;
    const roverIcon = L.divIcon({
      html: roverIconHtml,
      className: 'custom-rover-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const rMarker = L.marker([roverLocation.lat, roverLocation.lng], { icon: roverIcon })
      .bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #1c1917;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 2px;">🚗 RESQER ROVER-01 (ACTIVE)</div>
          <div>Lat: ${roverLocation.lat.toFixed(6)}° N</div>
          <div>Lng: ${roverLocation.lng.toFixed(6)}° E</div>
          <div>Speed: 18.5 km/h | Mode: Autonomous Patrol</div>
          <div style="margin-top: 4px; color: #78716c; font-size: 10px;">Sector: Guindy Industrial Link, Chennai</div>
        </div>
      `)
      .addTo(markersGroup);
    roverMarkerRef.current = rMarker;

    // 2. Draw Defect Markers & Heatmap Influence Radii
    filteredDefects.forEach((defect) => {
      const color = getSeverityColor(defect.severity);
      const isSelected = selectedDefect?.defect_id === defect.defect_id;
      const isResolved = defect.status === 'RESOLVED';
      const pinColor = isResolved ? '#16a34a' : color.hex;

      // Draw Heatmap Zone circle
      if (showHeatmapCircles && !isResolved) {
        const radiusMeters = defect.severity === 'CRITICAL' ? 380 : defect.severity === 'HIGH' ? 240 : 140;
        L.circle([defect.latitude, defect.longitude], {
          radius: radiusMeters,
          color: pinColor,
          fillColor: pinColor,
          fillOpacity: defect.severity === 'CRITICAL' ? 0.22 : 0.12,
          weight: 1.5,
        }).addTo(heatGroup);
      }

      // Pin Marker
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          ${defect.severity === 'CRITICAL' && !isResolved ? `<div class="absolute w-8 h-8 rounded-full bg-red-600/40 animate-ping"></div>` : ''}
          <div style="background-color: ${pinColor}; box-shadow: 0 2px 8px ${pinColor}66;" class="w-6 h-6 rounded-full border-2 ${isSelected ? 'border-stone-900 ring-3 ring-red-500 scale-125' : 'border-white'} flex items-center justify-center text-[10px] font-black text-white font-mono shadow-sm">
            ${defect.type === 'pothole' ? 'P' : defect.type === 'open_manhole' ? 'M' : defect.type === 'road_crack' ? 'C' : '•'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-defect-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([defect.latitude, defect.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 200px; font-family: monospace; font-size: 11px; color: #1c1917;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfceb8; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #1c1917; font-size: 12px;">${defect.defect_id}</strong>
            <span style="background: ${pinColor}18; color: ${pinColor}; border: 1px solid ${pinColor}55; padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
              ${defect.severity}
            </span>
          </div>
          <div><strong>Type:</strong> ${defect.type.replace('_', ' ').toUpperCase()}</div>
          <div><strong>Risk Score:</strong> <span style="font-weight: bold; color: ${pinColor}; font-size: 13px;">${defect.risk_score} / 100</span></div>
          <div><strong>Cavity Depth:</strong> ${defect.dimensions.depth_cm} cm</div>
          <div><strong>AI Confidence:</strong> ${(defect.confidence * 100).toFixed(1)}%</div>
          <div style="font-size: 10px; color: #78716c; margin-top: 5px; border-top: 1px solid #ede4d3; padding-top: 3px;">${defect.location_name}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectDefect(defect);
      });

      marker.addTo(markersGroup);
    });
  }, [filteredDefects, selectedDefect, roverLocation, showHeatmapCircles, onSelectDefect]);

  // Pan to selected defect when it changes
  useEffect(() => {
    if (selectedDefect && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedDefect.latitude, selectedDefect.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedDefect]);

  // Center Map on Rover
  const handleCenterOnRover = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([roverLocation.lat, roverLocation.lng], 14, {
        animate: true,
      });
    }
  };

  // Fit all defects
  const handleFitAllDefects = () => {
    if (mapInstanceRef.current && filteredDefects.length > 0) {
      const bounds = L.latLngBounds(filteredDefects.map((d) => [d.latitude, d.longitude]));
      bounds.extend([roverLocation.lat, roverLocation.lng]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-white border border-[#dfceb8] rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 font-medium">TOTAL DEFECTS</div>
            <div className="text-2xl font-black text-stone-900 mt-0.5">{totalCount.toLocaleString()}</div>
            <div className="text-[10px] text-stone-400 mt-1">Autonomous rover coverage</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#f5f0e5] text-stone-700">
            <Layers className="w-5 h-5 text-stone-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-red-700 font-bold">CRITICAL RISK</div>
            <div className="text-2xl font-black text-red-700 mt-0.5">{criticalCount}</div>
            <div className="text-[10px] text-red-600 mt-1">&gt; 80 Risk Index • 4h SLA</div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-100 text-red-700">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-800 font-bold">HIGH PRIORITY</div>
            <div className="text-2xl font-black text-amber-800 mt-0.5">{highCount}</div>
            <div className="text-[10px] text-amber-700 mt-1">61–80 Risk • 48h SLA</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-800 font-bold">RESOLVED</div>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">{resolvedCount}</div>
            <div className="text-[10px] text-emerald-700 mt-1">Patched & Verified</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Filter and Leaflet Map Toolbar */}
      <div className="bg-white border border-[#dfceb8] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-500 font-mono text-[11px]">DEFECT CLASS:</span>
          {['ALL', 'pothole', 'open_manhole', 'road_crack', 'waterlogging'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                typeFilter === t
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-[#f5f0e5] text-stone-700 border border-[#dfceb8] hover:bg-[#ede4d3]'
              }`}
            >
              {t === 'ALL' ? 'ALL CLASSES' : t.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-500 font-mono text-[11px]">MAP TILES:</span>
          <div className="flex items-center bg-[#f5f0e5] p-0.5 rounded-lg border border-[#dfceb8] font-mono text-[11px]">
            <button
              onClick={() => setTileStyle('streets')}
              className={`px-2 py-0.5 rounded transition ${
                tileStyle === 'streets' ? 'bg-white text-stone-900 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              OSM Streets
            </button>
            <button
              onClick={() => setTileStyle('satellite')}
              className={`px-2 py-0.5 rounded transition ${
                tileStyle === 'satellite' ? 'bg-white text-red-600 font-bold shadow-2xs border border-[#dfceb8]' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileStyle('dark')}
              className={`px-2 py-0.5 rounded transition ${
                tileStyle === 'dark' ? 'bg-stone-900 text-white font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Dark Mode
            </button>
          </div>

          <button
            onClick={() => setShowHeatmapCircles(!showHeatmapCircles)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition ${
              showHeatmapCircles
                ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                : 'bg-[#f5f0e5] text-stone-600 border-[#dfceb8]'
            }`}
          >
            Hazard Radii {showHeatmapCircles ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaflet Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#dfceb8] rounded-2xl overflow-hidden shadow-sm relative">
          {/* Map Header Overlay */}
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#dfceb8] text-xs font-mono flex items-center gap-3 text-stone-800 shadow-md">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <strong className="text-stone-900 font-mono">LEAFLET RADAR</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-600 font-bold">Chennai Metropolitan Network</span>
            <span className="text-stone-300">|</span>
            <span className="text-red-600 font-bold">{filteredDefects.length} Pins</span>
          </div>

          {/* Quick Map Action Controls (Center on Rover, Fit Bounds) */}
          <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#dfceb8] shadow-md font-mono text-[11px]">
            <button
              onClick={handleCenterOnRover}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition flex items-center gap-1 font-bold"
              title="Center map on live Rover position"
            >
              <Navigation className="w-3.5 h-3.5 text-red-600" />
              <span>Center Rover</span>
            </button>
            <button
              onClick={handleFitAllDefects}
              className="px-2.5 py-1 rounded-lg bg-[#f5f0e5] hover:bg-[#ede4d3] text-stone-700 transition flex items-center gap-1 border border-[#dfceb8]"
              title="Fit all markers in view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit All</span>
            </button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#dfceb8] text-[10px] font-mono flex items-center gap-3 text-stone-700 shadow-md flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="font-bold text-red-700">Critical (81–100)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span className="font-bold text-amber-800">High (61–80)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>Medium (31–60)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Resolved</span>
            </div>
            <div className="flex items-center gap-1 border-l border-[#dfceb8] pl-2">
              <span className="w-3 h-0.5 bg-red-600"></span>
              <span>Rover Trail</span>
            </div>
          </div>

          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full h-[540px] bg-[#f5f0e5]" />
        </div>

        {/* Selected Defect DNA Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col h-[540px]">
          <div className="bg-white border border-[#dfceb8] rounded-2xl p-4 flex-1 flex flex-col overflow-hidden shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#dfceb8] text-xs font-mono">
              <span className="text-stone-900 font-bold flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-red-600" />
                INFRASTRUCTURE DNA FEED
              </span>
              <span className="text-stone-500">{filteredDefects.length} ACTIVE</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 my-2 pr-1 flex-1">
              {filteredDefects.map((defect) => {
                const color = getSeverityColor(defect.severity);
                const isSelected = selectedDefect?.defect_id === defect.defect_id;
                return (
                  <button
                    key={defect.defect_id}
                    onClick={() => onSelectDefect(defect)}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/40 shadow-xs'
                        : 'bg-[#fbf9f5] border-[#dfceb8] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {defect.defect_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${color.badge}`}>
                        {defect.severity}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-stone-800 capitalize">
                      {defect.type.replace('_', ' ')}
                    </div>

                    <div className="text-[11px] text-stone-600 line-clamp-1">
                      {defect.location_name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-[#ede4d3]">
                      <span>Conf: {(defect.confidence * 100).toFixed(1)}%</span>
                      <span className="font-bold text-red-600">Risk: {defect.risk_score}/100</span>
                      <span>{defect.dimensions.depth_cm}cm depth</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
