// src/pages/dss/EnhancedHeatmapModal.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import the Khandwa GeoJSON data
import { khandwaGeoJSON } from '../../data/khandwa.geojson.js';

// --- Helper Functions ---

// Generate enhanced heatmap data with detailed information for tooltips
const generateEnhancedHeatmapData = (scannedData = null) => {
  const points = [];
  const bounds = { minLat: 21.4, maxLat: 22.2, minLng: 76.0, maxLng: 77.0 };
  
  // If we have scanned data, create only one point for the user's property
  if (scannedData) {
    // Generate a specific location based on the village/district
    // You can adjust these coordinates based on actual village locations
    const villageCoordinates = {
      'भोजपुर': { lat: 21.75, lng: 76.4 },
      'कल्याणपुर': { lat: 21.8, lng: 76.5 },
      'सिंहपुर': { lat: 21.9, lng: 76.6 },
      'रामगढ़': { lat: 21.7, lng: 76.3 },
      'शिवपुर': { lat: 21.85, lng: 76.45 },
      'गंगापुर': { lat: 21.6, lng: 76.7 },
      'सुखपुर': { lat: 21.95, lng: 76.35 },
      'नंदनगाँव': { lat: 21.65, lng: 76.55 }
    };

    // Get coordinates for the specific village or use default
    const coords = villageCoordinates[scannedData.VILLAGE] || { lat: 21.8, lng: 76.5 };
    
    // Add small random offset to simulate exact plot location within village
    const lat = coords.lat + (Math.random() - 0.5) * 0.02;
    const lng = coords.lng + (Math.random() - 0.5) * 0.02;
    
    // Convert area from square feet to hectares (1 sq ft = 0.0000929 hectares)
    const areaInHectares = scannedData.TOTAL_AREA_SQFT ? 
      (parseInt(scannedData.TOTAL_AREA_SQFT) * 0.0000929).toFixed(3) : 
      "0.232";
    
    points.push({
      id: `scanned_property_${scannedData.id}`,
      lat,
      lng,
      intensity: 0.95, // High intensity for user's property
      village: scannedData.VILLAGE,
      scheme: scannedData.documentType,
      beneficiaryType: scannedData.CATEGORY?.trim(),
      totalArea: areaInHectares,
      impactLevel: 'उच्च प्रभाव', // High impact for user's property
      
      // Scanned document specific data
      holderName: scannedData.HOLDER_NAME,
      fatherName: scannedData.FATHER_NAME,
      caste: scannedData.CASTE,
      age: scannedData.AGE,
      khasraNo: scannedData.KHASRA_NO,
      district: scannedData.DISTRICT,
      gramPanchayat: scannedData.GRAM_PANCHAYAT,
      boundaryEast: scannedData.BOUNDARY_EAST,
      boundaryWest: scannedData.BOUNDARY_WEST,
      boundaryNorth: scannedData.BOUNDARY_NORTH,
      boundarySouth: scannedData.BOUNDARY_SOUTH,
      pattaId: scannedData.id,
      confidenceScore: scannedData.confidenceScore,
      verificationStatus: scannedData.verificationStatus,
      isScannedData: true,
      isUserProperty: true
    });
  } else {
    // If no scanned data, generate sample points (for DSS use case)
    const villages = ['भोजपुर', 'कल्याणपुर', 'सिंहपुर', 'रामगढ़', 'शिवपुर', 'गंगापुर', 'सुखपुर', 'नंदनगाँव'];
    const schemes = ['वन अधिकार प्रमाण पत्र', 'भूमि अधिकार पट्टा', 'सामुदायिक वन अधिकार', 'व्यक्तिगत वन अधिकार'];
    const beneficiaryTypes = ['अनुसूचित जनजाति', 'अनुसूचित जाति', 'अन्य पारंपरिक वन निवासी'];
    
    for (let i = 0; i < 20; i++) {
      const lat = Math.random() * (bounds.maxLat - bounds.minLat) + bounds.minLat;
      const lng = Math.random() * (bounds.maxLng - bounds.minLng) + bounds.minLng;
      const intensity = Math.random();
      
      const beneficiaries = Math.floor(Math.random() * 150) + 10;
      const area = (Math.random() * 5 + 0.5).toFixed(2);
      const completionRate = Math.floor(Math.random() * 100);
      
      points.push({
        id: `point_${i + 1}`,
        lat,
        lng,
        intensity,
        village: villages[Math.floor(Math.random() * villages.length)],
        scheme: schemes[Math.floor(Math.random() * schemes.length)],
        beneficiaryType: beneficiaryTypes[Math.floor(Math.random() * beneficiaryTypes.length)],
        beneficiaries,
        totalArea: area,
        completionRate,
        impactLevel: intensity > 0.85 ? 'उच्च प्रभाव' : 
                     intensity > 0.6 ? 'मध्यम प्रभाव' : 
                     intensity > 0.4 ? 'सामान्य प्रभाव' : 'कम प्रभाव',
        isScannedData: false,
        isUserProperty: false
      });
    }
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

// Enhanced Legend Component
const MapLegend = () => {
    const map = useMap();
    useEffect(() => {
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [
                { color: 'rgba(255, 0, 0, 0.7)', label: 'उच्च प्रभाव (High Impact)' },
                { color: 'rgba(255, 140, 0, 0.7)', label: 'मध्यम प्रभाव (Medium Impact)' },
                { color: 'rgba(255, 255, 0, 0.7)', label: 'सामान्य प्रभाव (Moderate Impact)' },
                { color: 'rgba(0, 0, 255, 0.7)', label: 'कम प्रभाव (Low Impact)' }
            ];
            let legendHtml = '<h4>प्रभाव स्तर (Impact Level)</h4>';
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

// Enhanced Heatmap Layer with Hover Tooltips
const EnhancedHeatmapLayer = ({ points, onPointHover, onPointLeave }) => {
    const map = useMap();
    
    useEffect(() => {
        const heatLayerGroup = L.layerGroup();
        const circles = [];
        
        points.forEach(point => {
            const { lat, lng, intensity } = point;
            let color;
            if (intensity > 0.85) color = '#ff0000';
            else if (intensity > 0.6) color = '#ff8c00';
            else if (intensity > 0.4) color = '#ffff00';
            else color = '#0000ff';

            // Make user's property very prominent and distinctive
            let radius, fillOpacity, finalColor;
            if (point.isUserProperty) {
              radius = 8000; // Much larger for user property
              fillOpacity = 0.4;
              finalColor = '#10b981'; // Green color for user property
            } else {
              radius = 4000;
              fillOpacity = 0.18;
              finalColor = color;
            }
            
            const circle = L.circle([lat, lng], {
                radius: radius,
                fillColor: finalColor,
                color: point.isUserProperty ? '#059669' : 'transparent',
                weight: point.isUserProperty ? 3 : 0,
                fillOpacity: fillOpacity,
            });

            // Add hover events
            circle.on('mouseover', (e) => {
                onPointHover(point, e);
                circle.setStyle({
                    fillOpacity: point.isUserProperty ? 0.6 : 0.4,
                    weight: point.isUserProperty ? 4 : 2,
                    color: point.isUserProperty ? '#059669' : finalColor
                });
            });

            circle.on('mouseout', (e) => {
                onPointLeave();
                circle.setStyle({
                    fillOpacity: point.isUserProperty ? 0.4 : 0.18,
                    weight: point.isUserProperty ? 3 : 0,
                    color: point.isUserProperty ? '#059669' : 'transparent'
                });
            });

            circle.addTo(heatLayerGroup);
            circles.push(circle);
        });
        
        heatLayerGroup.addTo(map);
        
        return () => {
            map.removeLayer(heatLayerGroup);
        };
    }, [map, points, onPointHover, onPointLeave]);
    
    return null;
};

// Custom Tooltip Component
const CustomTooltip = ({ point, position, visible }) => {
  if (!visible || !point || !position) return null;

  const tooltipStyle = {
    position: 'fixed',
    left: position.x + 15,
    top: position.y - 10,
    zIndex: 1000,
    pointerEvents: 'none',
    transform: 'translateY(-50%)'
  };

  return (
    <div 
      style={tooltipStyle}
      className="bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm animate-in fade-in duration-200"
    >
      <div className="space-y-2">
        <div className="border-b pb-2">
          <h4 className="font-semibold text-gray-800 text-sm">{point.village}</h4>
          <p className="text-xs text-gray-600">{point.scheme}</p>
          {point.isUserProperty && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🏡 आपकी संपत्ति (Your Property)
              </span>
            </div>
          )}
        </div>
        
        {/* Show complete scanned document data if it's user's property */}
        {point.isUserProperty ? (
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="bg-blue-50 p-2 rounded mb-2">
              <div className="flex justify-between">
                <span className="text-gray-600">पट्टा ID:</span>
                <span className="font-medium text-blue-600">{point.pattaId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">सत्यापन:</span>
                <span className="font-medium text-green-600">{point.verificationStatus} ({point.confidenceScore}%)</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">धारक का नाम:</span>
              <span className="font-medium text-blue-700">{point.holderName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">पिता का नाम:</span>
              <span className="font-medium text-gray-700">{point.fatherName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">जाति:</span>
              <span className="font-medium text-purple-600">{point.caste}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">आयु:</span>
              <span className="font-medium text-green-600">{point.age}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">खसरा नं.:</span>
              <span className="font-medium text-orange-600">{point.khasraNo}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">जिला:</span>
              <span className="font-medium text-gray-700">{point.district}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">ग्राम पंचायत:</span>
              <span className="font-medium text-gray-700">{point.gramPanchayat}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">कुल क्षेत्रफल:</span>
              <span className="font-medium text-green-600">{point.totalArea} हेक्टेयर</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">श्रेणी:</span>
              <span className="font-medium text-indigo-600 text-xs">{point.beneficiaryType}</span>
            </div>
            
            {/* Boundary Information */}
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">सीमा विवरण (Boundaries):</p>
              <div className="grid grid-cols-1 gap-0.5 text-xs">
                <div><span className="text-gray-500">पूर्व:</span> <span className="text-gray-700">{point.boundaryEast}</span></div>
                <div><span className="text-gray-500">पश्चिम:</span> <span className="text-gray-700">{point.boundaryWest}</span></div>
                <div><span className="text-gray-500">उत्तर:</span> <span className="text-gray-700">{point.boundaryNorth}</span></div>
                <div><span className="text-gray-500">दक्षिण:</span> <span className="text-gray-700">{point.boundarySouth}</span></div>
              </div>
            </div>
          </div>
        ) : (
          // Show default data for other points (when used in DSS context)
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">प्रभाव स्तर:</span>
              <span className="font-medium text-gray-800">{point.impactLevel}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">लाभार्थी:</span>
              <span className="font-medium text-blue-600">{point.beneficiaries}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">कुल क्षेत्र:</span>
              <span className="font-medium text-green-600">{point.totalArea} हेक्टेयर</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">पूर्णता दर:</span>
              <span className="font-medium text-purple-600">{point.completionRate}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">श्रेणी:</span>
              <span className="font-medium text-gray-700 text-xs">{point.beneficiaryType}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Tooltip arrow */}
      <div 
        className="absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid white'
        }}
      />
    </div>
  );
};

const EnhancedHeatmapModal = ({ scheme, onClose, isOpen = false, scannedData = null }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const heatmapData = useMemo(() => generateEnhancedHeatmapData(scannedData), [scheme, scannedData]);

  // Handle mouse position tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (tooltipVisible) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [tooltipVisible]);

  const handlePointHover = (point, e) => {
    setHoveredPoint(point);
    setTooltipVisible(true);
  };

  const handlePointLeave = () => {
    setTooltipVisible(false);
    setHoveredPoint(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col p-6">
          <div className="flex items-center justify-between pb-4 border-b mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {scannedData ? 'Your Property Location Map' : 'Interactive Impact Heatmap'}
                </h2>
                <p className="text-sm text-gray-600">
                  {scannedData ? 
                    `Property: ${scannedData.HOLDER_NAME} | ${scannedData.VILLAGE}, ${scannedData.DISTRICT} | Khasra: ${scannedData.KHASRA_NO}` :
                    `Scheme: ${scheme.name} | Hover over points for detailed information`
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-2xl font-bold p-2 leading-none rounded-full hover:bg-gray-200 transition-colors w-10 h-10 flex items-center justify-center"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 rounded-lg overflow-hidden border-2 border-gray-200 relative">
            <MapContainer 
              center={[21.8, 76.5]} 
              zoom={9} 
              style={{ height: '100%', width: '100%' }}
              whenCreated={(mapInstance) => {
                // Disable default tooltip
                mapInstance.getContainer().style.cursor = 'default';
              }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <GeoJSON 
                data={khandwaGeoJSON} 
                style={{ 
                  color: '#047857', 
                  weight: 3, 
                  fillOpacity: 0.1,
                  dashArray: '5, 5'
                }} 
              />
              <EnhancedHeatmapLayer 
                points={heatmapData} 
                onPointHover={handlePointHover}
                onPointLeave={handlePointLeave}
              />
              <FitBounds geoJsonData={khandwaGeoJSON} />
              <MapLegend />
            </MapContainer>
            
            {/* Statistics overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Property Information</h3>
              <div className="space-y-1 text-xs">
                {scannedData ? (
                  <>
                    <div className="flex justify-between gap-4 mb-2 pb-2 border-b">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium text-green-600">🏡 User Property</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Holder:</span>
                      <span className="font-medium text-blue-600">{scannedData.HOLDER_NAME}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Village:</span>
                      <span className="font-medium text-gray-700">{scannedData.VILLAGE}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">District:</span>
                      <span className="font-medium text-gray-700">{scannedData.DISTRICT}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Khasra No:</span>
                      <span className="font-medium text-orange-600">{scannedData.KHASRA_NO}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-medium">{heatmapData.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">High Impact:</span>
                      <span className="font-medium text-red-600">
                        {heatmapData.filter(p => p.intensity > 0.85).length}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Medium Impact:</span>
                      <span className="font-medium text-orange-600">
                        {heatmapData.filter(p => p.intensity > 0.6 && p.intensity <= 0.85).length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tooltip */}
      <CustomTooltip 
        point={hoveredPoint} 
        position={mousePosition} 
        visible={tooltipVisible} 
      />

      <style jsx global>{`
        .legend {
          padding: 10px 12px;
          font-family: Arial, Helvetica, sans-serif;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
          border-radius: 8px;
          backdrop-filter: blur(4px);
        }
        .legend h4 {
          margin: 0 0 10px;
          color: #333;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 5px;
        }
        .legend .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-in {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </>
  );
};

export default EnhancedHeatmapModal;