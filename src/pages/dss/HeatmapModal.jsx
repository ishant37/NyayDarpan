// src/pages/dss/HeatmapModal.jsx
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// MODIFIED: Import the new Khandwa GeoJSON data
import { khandwaGeoJSON } from '../../data/khandwa.geojson.js';

// --- Helper Functions ---

// MODIFIED: Generates points within Khandwa's new boundaries
const generateHeatmapData = () => {
  const points = [];
  const bounds = { minLat: 21.4, maxLat: 22.2, minLng: 76.0, maxLng: 77.0 };
  for (let i = 0; i < 80; i++) {
    const lat = Math.random() * (bounds.maxLat - bounds.minLat) + bounds.minLat;
    const lng = Math.random() * (bounds.maxLng - bounds.minLng) + bounds.minLng;
    const intensity = Math.random();
    points.push({ lat, lng, intensity });
  }
  return points;
};

// Component to automatically fit the map to the GeoJSON bounds
const FitBounds = ({ geoJsonData }) => {
  const map = useMap();
  useEffect(() => {
    if (geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData);
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoJsonData, map]);
  return null;
};

// --- Polished Legend Component (Unchanged) ---
const MapLegend = () => {
    const map = useMap();
    useEffect(() => {
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [
                { color: 'rgba(255, 0, 0, 0.7)', label: 'High Impact' },
                { color: 'rgba(255, 140, 0, 0.7)', label: 'Medium Impact' },
                { color: 'rgba(255, 255, 0, 0.7)', label: 'Moderate Impact' },
                { color: 'rgba(0, 0, 255, 0.7)', label: 'Low Impact' }
            ];
            let legendHtml = '<h4>Impact Level</h4>';
            grades.forEach(grade => {
                legendHtml += `
                    <div class="legend-item">
                        <i style="background:${grade.color}"></i>
                        <span>${grade.label}</span>
                    </div>`;
            });
            div.innerHTML = legendHtml;
            return div;
        };
        legend.addTo(map);
        return () => { legend.remove(); };
    }, [map]);
    return null;
}

// --- Refined Simulated Zone Layer (Unchanged) ---
const SimulatedHeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        const heatLayerGroup = L.layerGroup();
        points.forEach(point => {
            const { lat, lng, intensity } = point;
            let color;
            if (intensity > 0.85) color = '#ff0000';
            else if (intensity > 0.6) color = '#ff8c00';
            else if (intensity > 0.4) color = '#ffff00';
            else color = '#0000ff';

            L.circle([lat, lng], {
                radius: 4000,
                fillColor: color,
                color: 'transparent',
                weight: 0,
                fillOpacity: 0.18,
            }).addTo(heatLayerGroup);
        });
        heatLayerGroup.addTo(map);
        return () => {
            map.removeLayer(heatLayerGroup);
        };
    }, [map, points]);
    return null;
};

const HeatmapModal = ({ scheme, onClose }) => {
  const heatmapData = useMemo(() => generateHeatmapData(), [scheme]);

  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col p-4">
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Impact Hotspot Map</h2>
            <p className="text-sm text-gray-600">Most benefitted areas for: <span className="font-semibold text-blue-600">{scheme.name}</span></p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold p-2 leading-none rounded-full hover:bg-gray-200 transition-colors">&times;</button>
        </div>
        <div className="flex-1 rounded-lg overflow-hidden border">
          {/* MODIFIED: Updated map center to Khandwa's approximate center */}
          <MapContainer center={[21.8, 76.5]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {/* MODIFIED: Use the new khandwaGeoJSON */}
            <GeoJSON data={khandwaGeoJSON} style={{ color: '#047857', weight: 2, fillOpacity: 0.1 }} />
            <SimulatedHeatmapLayer points={heatmapData} />
            <FitBounds geoJsonData={khandwaGeoJSON} />
            <MapLegend />
          </MapContainer>
        </div>
      </div>
      <style jsx global>{`
        .legend {
          padding: 8px 12px;
          font-family: Arial, Helvetica, sans-serif;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
          border-radius: 5px;
        }
        .legend h4 {
          margin: 0 0 8px;
          color: #333;
          font-size: 14px;
          font-weight: bold;
        }
        .legend .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .legend .legend-item:last-child {
          margin-bottom: 0;
        }
        .legend i {
          width: 18px;
          height: 18px;
          margin-right: 8px;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default HeatmapModal;