import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DecisionSupportPanel } from './DecisionSupportPanel';

// --- Mock Data Generation Utility ---
const holderNames = ["Ramesh Kumar", "Sita Devi", "Arjun Singh", "Priya Sharma", "Vikram Rathore"];
const claimTypes = ["Individual", "Community", "Habitat"];
const statuses = ["Approved", "Pending", "Rejected"];

const generateRandomPolygonData = (id, districtName) => ({
  id: `${districtName.slice(0, 3).toUpperCase()}-${id}`,
  holderName: holderNames[Math.floor(Math.random() * holderNames.length)],
  area: (Math.random() * 10 + 1).toFixed(2),
  type: claimTypes[Math.floor(Math.random() * claimTypes.length)],
  status: statuses[Math.floor(Math.random() * statuses.length)],
});
// --- End of Utility ---

const Map = () => {
  const mapRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  // This function is triggered when a district on the map is clicked
  const handleFeatureClick = (feature) => {
    const districtName = feature.properties.D_N || "Unknown";
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const randomData = generateRandomPolygonData(randomId, districtName);
    setSelectedPolygon(randomData);
  };

  // This function is passed to the panel to allow it to close itself
  const handleClosePanel = () => {
    setSelectedPolygon(null);
  };

  // useEffect hook to initialize the map and layers
  useEffect(() => {
    // Prevent map from being initialized multiple times
    if (mapRef.current && !mapRef.current._leaflet_id) {
      const map = L.map(mapRef.current).setView([17.0, 78.5], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Fetch district boundaries GeoJSON
      fetch("https://raw.githubusercontent.com/gggodhwani/telangana_boundaries/refs/heads/master/districts.json")
        .then(response => response.json())
        .then(geojson => {
          const geoJsonLayer = L.geoJSON(geojson, {
            style: {
              color: "#3388ff",
              weight: 2,
              opacity: 0.8,
              fillColor: "#3388ff",
              fillOpacity: 0.2,
            },
            onEachFeature: (feature, layer) => {
              // Add a click event listener to each district layer
              layer.on('click', () => {
                handleFeatureClick(feature);
              });
            }
          }).addTo(map);

          map.fitBounds(geoJsonLayer.getBounds());
        })
        .catch(err => console.error("Failed to load GeoJSON:", err));

      // Cleanup function to remove the map instance when the component unmounts
      return () => {
        map.remove();
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="relative h-[calc(100vh-64px)] w-full">
      {/* The div where the Leaflet map will be rendered */}
      <div ref={mapRef} className="w-full h-full" />

      {/* The Decision Support Panel */}
      <div className={`absolute top-0 right-0 h-full w-[400px] shadow-lg z-[1000] transition-transform duration-300 ease-in-out ${
        selectedPolygon ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <DecisionSupportPanel
          polygonData={selectedPolygon}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
};

export default Map;