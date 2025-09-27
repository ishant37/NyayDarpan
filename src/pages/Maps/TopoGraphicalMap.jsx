import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Constants ---
const VILLAGE_GEOJSON_URL =
  "https://raw.githubusercontent.com/PriyanshPorwal999/Van_Raj/refs/heads/main/frontend/balaghat.geojson";

const GEOJSON_URLS = {
  "Madhya Pradesh":
    "https://raw.githubusercontent.com/udit-001/india-maps-data/refs/heads/main/geojson/states/madhya-pradesh.geojson",
  Odisha:
    "https://raw.githubusercontent.com/udit-001/india-maps-data/refs/heads/main/geojson/states/odisha.geojson",
  Telangana:
    "https://raw.githubusercontent.com/gggodhwani/telangana_boundaries/refs/heads/master/districts.json",
  Tripura:
    "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/TRIPURA/TRIPURA_DISTRICTS.geojson",
};

// Default styles
const stateStyle = {
  color: "#000000",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: "#cccccc",
};

// --- TopoGraphicalMap Component ---
const TopoGraphicalMap = () => {
  const mapRef = useRef(null);
  const sidebarRef = useRef(null);
   const mapInstanceRef = useRef(null); // ✅ this was missing
    const layerGroupRef = useRef(null); // ✅ FIX: declare this
  const sidebarContentRef = useRef(null);

  // State for sidebar and filters
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Balaghat"); // Default to Balaghat
  
  // State for calculated Balaghat statistics (simulated areas)
  const [balaghatStats, setBalaghatStats] = useState({
      totalVillages: 0,
      forestArea: 0, 
      potFraArea: 0, 
      nonPotFraArea: 0, 
      reservoirArea: 0, 
  });

  // Storage for all GeoJSON data and Leaflet layers
  const geojsonDataRef = useRef({});
//   const layerControlsRef = useRef({});

  // Helper to safely extract coordinates (for boundary simulation)
  const extractCoords = (geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    
    const allRings = [];
    const process = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return;
        
        if (Array.isArray(arr[0]) && typeof arr[0][0] === 'number' && typeof arr[0][1] === 'number') {
            allRings.push(arr);
        } else if (Array.isArray(arr[0])) {
            arr.forEach(process);
        }
    };
    
    process(geometry.coordinates);
    return allRings;
  };


  // Legend control (Stable via useCallback)
  const createLegend = useCallback((map) => {
    if (map._legendControl) {
      map.removeControl(map._legendControl);
    }
    const legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <b>Legend</b><br/>
        <span style="border:2px dotted red;padding:0 18px 0 2px;margin-right:6px;"></span> District Boundary<br/>
        <span style="border:1px solid #4f4f4f;padding:0 18px 0 2px;margin-right:6px;opacity:0.5;"></span> Default Village Boundary<br/>
        <span style="background:darkgreen;display:inline-block;width:20px;height:10px;margin-right:6px;"></span> Forest Area<br/>
        <span style="background:yellow;display:inline-block;width:20px;height:10px;margin-right:6px;"></span> Non-Potential FRA Area<br/>
        <span style="background:#90ee90;display:inline-block;width:20px;height:10px;margin-right:6px;"></span> Potential FRA Area<br/>
        <span style="background:#bde0ff;display:inline-block;width:20px;height:10px;margin-right:6px;"></span> Reservoir Area<br/>
      `;
      return div;
    };
    legend.addTo(map);
    map._legendControl = legend;
  }, []); 

  // Village styling function (Corrected Default Style for visibility)
  const villageStyle = useCallback((feature) => {
    if (feature.properties.FOREST) {
      return { color: "darkgreen", weight: 1, opacity: 1, fillOpacity: 0.7, fillColor: "darkgreen" };
    }
    if (feature.properties.POTENTIAL_FRA) {
      return { color: "#317b3b", weight: 1.5, fillOpacity: 0.8, fillColor: "#90ee90" };
    }
    if (feature.properties.NON_POTENTIAL_FRA) {
      return { color: "#aca906", weight: 1.5, fillOpacity: 0.8, fillColor: "yellow" };
    }
    if (feature.properties.RESERVOIR) {
      return { color: "#3689d4", weight: 1.5, fillOpacity: 0.6, fillColor: "#bde0ff" };
    }
    // Default style: Make boundary visible
    return { 
        color: "#4f4f4f", 
        weight: 1,         
        opacity: 0.5,      
        fillOpacity: 0.05, 
        fillColor: "white" 
    };
  }, []); 

  // Function to load all GeoJSON data (runs once)
  useEffect(() => {
    async function loadGeoJSON() {
      const data = {};
      
      for (const [state, url] of Object.entries(GEOJSON_URLS)) {
        try {
          const res = await fetch(url);
          data[state] = await res.json();
        } catch (error) {
          console.error(`Failed to load GeoJSON for ${state}:`, error);
        }
      }

      try {
        const res = await fetch(VILLAGE_GEOJSON_URL);
        const villageGeojson = await res.json();
        
        // --- PERCENTAGE-BASED RANDOM FLAGGING AND AREA CALCULATION ---
        const totalFeatures = villageGeojson.features.length;
        const countForest = Math.floor(totalFeatures * 0.30);
        const countPotFRA = Math.floor(totalFeatures * 0.15);
        const countNonPotFRA = Math.floor(totalFeatures * 0.15);
        const countReservoir = Math.floor(totalFeatures * 0.05);

        let totalForestArea = 0;
        let totalPotFraArea = 0;
        let totalNonPotFraArea = 0;
        let totalReservoirArea = 0;

        const indices = Array.from({ length: totalFeatures }, (_, i) => i).sort(() => Math.random() - 0.5);

        for (let i = 0; i < totalFeatures; i++) {
            const feature = villageGeojson.features[indices[i]];
            
            // Assign a random size (e.g., between 5 and 50 sq km per classified village)
            const simulatedArea = Math.round(Math.random() * 45 + 5); 

            if (i < countForest) {
                feature.properties.FOREST = true;
                totalForestArea += simulatedArea;
            } else if (i < countForest + countPotFRA) {
                feature.properties.POTENTIAL_FRA = true;
                totalPotFraArea += simulatedArea;
            } else if (i < countForest + countPotFRA + countNonPotFRA) {
                feature.properties.NON_POTENTIAL_FRA = true;
                totalNonPotFraArea += simulatedArea;
            } else if (i < countForest + countPotFRA + countNonPotFRA + countReservoir) {
                feature.properties.RESERVOIR = true;
                totalReservoirArea += simulatedArea;
            }
        }

        // Store the calculated area stats in state
        setBalaghatStats({
            totalVillages: totalFeatures,
            forestArea: totalForestArea,
            potFraArea: totalPotFraArea,
            nonPotFraArea: totalNonPotFraArea,
            reservoirArea: totalReservoirArea,
        });
        
        data["BalaghatVillages"] = villageGeojson;

      } catch (error) {
        console.error("Failed to load Balaghat village GeoJSON:", error);
      }

      geojsonDataRef.current = data;
      setSelectedState("Madhya Pradesh");
    }

    loadGeoJSON();
  }, []); 

  // Function to render the Balaghat Legend details in the sidebar (Enhanced UI)
  const renderBalaghatSummary = () => {
    // Calculate approximate village counts
    const avgAreaPerClassifiedVillage = 27.5;
    const classifiedVillagesCount = 
        Math.round(balaghatStats.forestArea / avgAreaPerClassifiedVillage) + 
        Math.round(balaghatStats.potFraArea / avgAreaPerClassifiedVillage) + 
        Math.round(balaghatStats.nonPotFraArea / avgAreaPerClassifiedVillage) + 
        Math.round(balaghatStats.reservoirArea / avgAreaPerClassifiedVillage);

    const otherVillages = Math.max(0, balaghatStats.totalVillages - classifiedVillagesCount);

    return (
        <div className="balaghat-summary">
            {/* Header Section */}
            <div className="summary-header">
                <h4 className="summary-title">🏞️ Balaghat District Overview</h4>
                <div className="total-villages-badge">
                    <span className="badge-number">{balaghatStats.totalVillages}</span>
                    <span className="badge-label">Total Villages</span>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card forest">
                    <div className="stat-icon">🌲</div>
                    <div className="stat-content">
                        <div className="stat-number">{balaghatStats.forestArea.toLocaleString()}</div>
                        <div className="stat-label">km² Forest Area</div>
                        <div className="stat-indicator forest-indicator"></div>
                    </div>
                </div>

                <div className="stat-card potential-fra">
                    <div className="stat-icon">🟢</div>
                    <div className="stat-content">
                        <div className="stat-number">{balaghatStats.potFraArea.toLocaleString()}</div>
                        <div className="stat-label">km² Potential FRA</div>
                        <div className="stat-indicator potential-indicator"></div>
                    </div>
                </div>

                <div className="stat-card non-potential-fra">
                    <div className="stat-icon">🟡</div>
                    <div className="stat-content">
                        <div className="stat-number">{balaghatStats.nonPotFraArea.toLocaleString()}</div>
                        <div className="stat-label">km² Non-Potential FRA</div>
                        <div className="stat-indicator non-potential-indicator"></div>
                    </div>
                </div>

                <div className="stat-card reservoir">
                    <div className="stat-icon">💧</div>
                    <div className="stat-content">
                        <div className="stat-number">{balaghatStats.reservoirArea.toLocaleString()}</div>
                        <div className="stat-label">km² Reservoir Area</div>
                        <div className="stat-indicator reservoir-indicator"></div>
                    </div>
                </div>
            </div>

            {/* Village Classification Summary */}
            <div className="classification-summary">
                <h5 className="classification-title">📊 Village Classification</h5>
                <div className="classification-item">
                    <div className="classification-icon">🏘️</div>
                    <span className="classification-label">Unclassified Villages</span>
                    <span className="classification-count">{otherVillages}</span>
                </div>
                <div className="classification-item">
                    <div className="classification-icon">🔲</div>
                    <span className="classification-label">District Boundary</span>
                    <div className="boundary-indicator"></div>
                </div>
            </div>

            {/* Interactive Guide */}
            <div className="interaction-guide">
                <div className="guide-icon">💡</div>
                <p className="guide-text">Click on any village polygon to see detailed property information and explore terrain features.</p>
            </div>
        </div>
    );
  };

  // --- Map and Layer Management (Runs on state/district change) ---
// --- Map Initialization + GeoJSON Rendering ---
// Assume these refs are defined at the top of your component:
// const mapRef = useRef(null);
// const mapInstanceRef = useRef(null); 
// const layerGroupRef = useRef(null); 
// const sidebarRef = useRef(null); 

// Assume these states are defined:
// const [selectedState, setSelectedState] = useState(null);
// const [selectedDistrict, setSelectedDistrict] = useState(null);
// const [availableDistricts, setAvailableDistricts] = useState([]);
// const [selectedVillage, setSelectedVillage] = useState(null);

// =======================================================
// 1. Map Initialization (Runs only ONCE)
// =======================================================
useEffect(() => {
    // Only run if the map container exists and the map instance hasn't been created
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([23.4, 78.2], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Store references
    mapInstanceRef.current = map;
    window._TopoGraphicalMapInstance = map; // For legacy/external use if needed

    // Initialize empty LayerGroup for all dynamic GeoJSON layers
    layerGroupRef.current = L.layerGroup().addTo(map);
    
    // NOTE: createLegend is NOT called here. It is called in the dynamic effect below.

    return () => {
        // Cleanup on unmount
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            delete window._TopoGraphicalMapInstance;
        }
    };
}, []); 

// =======================================================
// 2. Dynamic Map/Data Updates (Runs on state/district change)
// =======================================================
useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Exit if map or layer group hasn't been initialized by the first useEffect
    if (!map || !layerGroup) return; 

    // 💡 FIX 1: Re-create the legend on every render to ensure it reflects the current layer (e.g., state vs. village).
    createLegend(map); 

    // Clear all existing GeoJSON layers
    layerGroup.clearLayers();

    // 1. Add all State GeoJSON layers
    Object.keys(GEOJSON_URLS).forEach(stateName => {
        const geojson = geojsonDataRef.current[stateName];
        if (geojson) {
            const stateLayer = L.geoJSON(geojson, { 
                style: stateStyle,
                stateName: stateName
            });
            layerGroup.addLayer(stateLayer);
        }
    });

    // 2. Logic to populate districts dropdown
    const stateData = geojsonDataRef.current[selectedState];
    let districtNames = [];

    if (stateData) {
        districtNames = stateData.features
            .map(f => f.properties.NAME || f.properties.DISTRICT || f.properties.DIST_NAME)
            .filter(Boolean);
        
        if (selectedState === "Madhya Pradesh" && !districtNames.includes('Balaghat')) {
            districtNames.unshift('Balaghat');
        }
        
        const sortedDistricts = [...new Set(districtNames)].sort();
        if (JSON.stringify(availableDistricts) !== JSON.stringify(sortedDistricts)) {
            setAvailableDistricts(sortedDistricts);
        }

        if (selectedState === "Madhya Pradesh" && !selectedDistrict && sortedDistricts.includes('Balaghat')) {
            setSelectedDistrict("Balaghat");
        }
    } else {
        setAvailableDistricts([]);
    }

    // 3. Add Balaghat Village Layer
    const villageGeojson = geojsonDataRef.current["BalaghatVillages"];
    let villageLayer = null;

    if (villageGeojson && selectedDistrict === "Balaghat") {
        
        // --- Village Layer ---
        villageLayer = L.geoJSON(villageGeojson, {
            style: villageStyle,
            onEachFeature: (feature, layer) => {
                layer.on("click", () => {
                    setSelectedVillage(feature.properties);
                    if (sidebarRef.current) sidebarRef.current.classList.add("visible");
                });
                layer.bindTooltip(feature.properties.NAME || "Village");
            },
        });
        layerGroup.addLayer(villageLayer);
        
        // --- District Boundary Simulation (Red Dotted) ---
        let districtBounds = [];

        villageGeojson.features.forEach((f, i) => {
            if (!f.geometry) return;
            // Assuming extractCoords is defined and correctly handles GeoJSON geometry
            const allRings = extractCoords(f.geometry); 

            allRings.forEach(coordsRing => {
                const latlngs = coordsRing.map(([lng, lat]) => [lat, lng]);
                
                if (i % 150 === 0) districtBounds.push(latlngs); 
            });
        });

        // Add district (red dotted) boundary layer
        if (districtBounds.length > 0) {
            const distLayer = L.polyline(districtBounds, { 
                color: "red", 
                weight: 3, 
                dashArray: "6 4", 
                fill: false 
            });
            layerGroup.addLayer(distLayer);
        }
    }


    // 4. Fit Bounds Logic
    if (selectedDistrict === 'Balaghat' && villageLayer) {
        map.fitBounds(villageLayer.getBounds(), { maxZoom: 9 });
    } else if (selectedState) {
        // Find the layer added in step 1 that matches the selected state
        const stateLayer = layerGroup.getLayers().find(layer => layer.options?.stateName === selectedState);
        if (stateLayer) {
            map.fitBounds(stateLayer.getBounds(), { maxZoom: 7 });
        }
    } else {
        map.setView([23.4, 78.2], 5);
    }

// Dependencies include all variables/functions used inside the effect that come from props or state
}, [selectedState, selectedDistrict, availableDistricts, villageStyle, createLegend, geojsonDataRef]);

// --- Load GeoJSON when state changes ---
// --- Load GeoJSON on state change ---
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map || !selectedState || !layerGroupRef.current) return;

  // Clear old layers
  layerGroupRef.current.clearLayers();

  const stateData = geojsonDataRef.current[selectedState];
  if (!stateData) return;

  // --- Case 1: Normal State GeoJSON ---
  const geoLayer = L.geoJSON(stateData, {
    style: stateStyle,
    onEachFeature: (feature, layer) => {
      const districtName =
        feature.properties.NAME ||
        feature.properties.DISTRICT ||
        feature.properties.DIST_NAME ||
        "Unknown";

      layer.bindPopup(`<strong>${districtName}</strong>`);

      // ✅ When a district is clicked inside Madhya Pradesh
      layer.on("click", () => {
        setSelectedDistrict(districtName);

        if (selectedState === "Madhya Pradesh") {
          // 🔥 Load villages GeoJSON instead of just highlighting the district
          const villagesData = geojsonDataRef.current["MadhyaPradeshVillages"]; 
          if (villagesData) {
            layerGroupRef.current.clearLayers();

            const villageLayer = L.geoJSON(villagesData, {
              style: { color: "#228B22", weight: 1, fillOpacity: 0.3 },
              onEachFeature: (vFeature, vLayer) => {
                const vName =
                  vFeature.properties.VILLNAME ||
                  vFeature.properties.NAME ||
                  "Unknown Village";
                vLayer.bindPopup(`<strong>${vName}</strong>`);
              },
            });

            layerGroupRef.current.addLayer(villageLayer);

            try {
              map.fitBounds(villageLayer.getBounds(), { padding: [30, 30], maxZoom: 12 });
            } catch (err) {
              console.warn("Could not fit bounds for villages:", err);
            }
          }
        }
      });
    },
  });

  layerGroupRef.current.addLayer(geoLayer);

  try {
    map.fitBounds(geoLayer.getBounds(), { padding: [30, 30], maxZoom: 7 });
  } catch (err) {
    console.warn("Could not fit bounds:", err);
  }

  // ✅ Update legend when state changes
  createLegend(map);

}, [selectedState]);

  // Handler for state change
  const handleStateChange = (event) => {
      const newState = event.target.value;
      setSelectedState(newState);
      setSelectedDistrict(null); 
      setSelectedVillage(null); 
      // Show sidebar when a state is selected
      if (sidebarRef.current) sidebarRef.current.classList.add("visible");
  };

  // Handler for district change
  const handleDistrictChange = (event) => {
      const newDistrict = event.target.value;
      setSelectedDistrict(newDistrict);
      setSelectedVillage(null); 
      // Show sidebar when a district is selected
      if (sidebarRef.current) sidebarRef.current.classList.add("visible");

      const map = window._TopoGraphicalMapInstance;
      if (map && newDistrict !== "") {
          const stateData = geojsonDataRef.current[selectedState];
          if (stateData) {
              const featureToZoom = stateData.features.find(f => 
                  (f.properties.NAME || f.properties.DISTRICT || f.properties.DIST_NAME) === newDistrict
              );
              if (featureToZoom) {
                  const tempLayer = L.geoJSON(featureToZoom);
                  map.fitBounds(tempLayer.getBounds(), { maxZoom: 9, padding: [50, 50] });
              }
          }
      }
  };


  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      
      {/* Sidebar UI (Now includes filters) */}
      <div
        ref={sidebarRef}
        id="sidebar"
        // Use class 'visible' to keep sidebar always visible
        className="visible"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: "340px",
          height: "calc(100% - 20px)",
          backgroundColor: "white",
          padding: "20px",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          zIndex: 1000,
          overflowY: "auto",
          transition: "transform 0.3s ease-in-out",
          borderRadius: "12px 0 0 12px",
          // Sidebar always visible now
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #ccc",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>Map Controls & Details</h3>
          <span
            style={{ cursor: "pointer", fontSize: "24px", fontWeight: "bold" }}
            onClick={() => {
                // Clear selection states to fully hide sidebar
                setSelectedDistrict(null); 
                setSelectedVillage(null);
                setSelectedState(null); 
                sidebarRef.current.classList.remove("visible"); // Explicitly hide
            }}
          >
            &times;
          </span>
        </div>

        {/* --- FILTERS MOVED TO SIDEBAR --- */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <h4>Filter Location</h4>
            <label style={{ display: 'block', marginBottom: '10px' }}>
                State:
                <select 
                    value={selectedState || ""} 
                    onChange={handleStateChange}
                    style={{ marginLeft: '5px', width: '90%' }}
                >
                    <option value="">Select State</option>
                    {Object.keys(GEOJSON_URLS).map(state => (
                    <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </label>
            {availableDistricts.length > 0 && (
            <label style={{ display: 'block' }}>
                District/Block:
                <select 
                    value={selectedDistrict || ""} 
                    onChange={handleDistrictChange}
                    style={{ marginLeft: '5px', width: '90%' }}
                >
                <option value="">Select District/Block</option>
                {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                ))}
                </select>
            </label>
            )}
        </div>
        {/* --- END FILTERS --- */}


        <div ref={sidebarContentRef}>
            {/* Conditional Rendering for Enhanced Balaghat Summary / Village Details */}
            {selectedDistrict === "Balaghat" && !selectedVillage ? (
                renderBalaghatSummary()
            ) : selectedVillage ? (
            <div className="village-details">
                <div className="village-header">
                    <h3 className="village-title">🏘️ {selectedVillage.NAME || "Unknown Village"}</h3>
                    <div className="village-id-badge">
                        ID: {selectedVillage.ID || 'N/A'}
                    </div>
                </div>

                {/* Classification Cards */}
                <div className="classification-cards">
                    {selectedVillage.FOREST && (
                        <div className="classification-card forest-card">
                            <div className="card-icon">🌲</div>
                            <div className="card-content">
                                <h4>Forest Area</h4>
                                <p>This village contains designated forest land</p>
                            </div>
                        </div>
                    )}
                    
                    {selectedVillage.POTENTIAL_FRA && (
                        <div className="classification-card potential-card">
                            <div className="card-icon">🟢</div>
                            <div className="card-content">
                                <h4>Potential FRA</h4>
                                <p>Area eligible for Forest Rights Act claims</p>
                            </div>
                        </div>
                    )}
                    
                    {selectedVillage.NON_POTENTIAL_FRA && (
                        <div className="classification-card non-potential-card">
                            <div className="card-icon">🟡</div>
                            <div className="card-content">
                                <h4>Non-Potential FRA</h4>
                                <p>Area not eligible for FRA claims</p>
                            </div>
                        </div>
                    )}
                    
                    {selectedVillage.RESERVOIR && (
                        <div className="classification-card reservoir-card">
                            <div className="card-icon">💧</div>
                            <div className="card-content">
                                <h4>Reservoir Area</h4>
                                <p>Water body or irrigation reservoir</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Properties */}
                <div className="additional-properties">
                    <h5 className="properties-title">📋 Additional Information</h5>
                    <div className="properties-grid">
                        {Object.keys(selectedVillage)
                            .filter(k => !['NAME', 'ID', 'POTENTIAL_FRA', 'NON_POTENTIAL_FRA', 'FOREST', 'RESERVOIR'].includes(k))
                            .map(key => (
                                <div key={key} className="property-item">
                                    <span className="property-key">{key}:</span>
                                    <span className="property-value">{String(selectedVillage[key])}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            ) : (
            <div className="no-selection">
                {selectedDistrict && selectedDistrict !== "Balaghat" ? 
                    <div className="info-message">
                        <div className="info-icon">ℹ️</div>
                        <p><strong>No village data available for {selectedDistrict}</strong></p>
                        <p>Select a village on the map or use the filters above to explore terrain features.</p>
                    </div>
                :
                    <div className="welcome-message">
                        <div className="welcome-icon">🗺️</div>
                        <h4>Welcome to Topographical Map</h4>
                        <p>Select a state and district to view detailed terrain and village information.</p>
                        <ul className="feature-list">
                            <li>🌲 Forest area mapping</li>
                            <li>💧 Water body identification</li>
                            <li>🏘️ Village boundary analysis</li>
                            <li>📊 Land classification data</li>
                        </ul>
                    </div>
                }
            </div>
          )}
        </div>
      </div>
      {/* Enhanced CSS styles for Topographical Map UI */}
      <style>{`
        #sidebar {
            transform: translateX(100%);
        }
        #sidebar.visible {
          transform: translateX(10%);
        }
        
        /* Leaflet legend control */
        .info.legend {
            background: white;
            padding: 6px;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        /* Balaghat Summary Styles */
        .balaghat-summary {
            padding: 16px 0;
        }

        .summary-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            color: white;
            text-align: center;
        }

        .summary-title {
            margin: 0 0 12px 0;
            font-size: 1.3rem;
            font-weight: 700;
        }

        .total-villages-badge {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }

        .badge-number {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1;
        }

        .badge-label {
            font-size: 0.8rem;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stat-icon {
            font-size: 1.8rem;
            flex-shrink: 0;
        }

        .stat-content {
            flex: 1;
        }

        .stat-number {
            color: #2c3e50;
            font-size: 1.4rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 4px;
        }

        .stat-label {
            color: #6c757d;
            font-size: 0.8rem;
            line-height: 1.2;
        }

        .stat-indicator {
            height: 4px;
            border-radius: 2px;
            margin-top: 8px;
        }

        .forest-indicator {
            background: linear-gradient(90deg, #2d5a27, #4a7c59);
        }

        .potential-indicator {
            background: linear-gradient(90deg, #28a745, #20c997);
        }

        .non-potential-indicator {
            background: linear-gradient(90deg, #ffc107, #fd7e14);
        }

        .reservoir-indicator {
            background: linear-gradient(90deg, #17a2b8, #007bff);
        }

        .classification-summary {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .classification-title {
            color: #2c3e50;
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 12px 0;
        }

        .classification-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }

        .classification-item:last-child {
            border-bottom: none;
        }

        .classification-icon {
            font-size: 1.2rem;
        }

        .classification-label {
            flex: 1;
            color: #495057;
            font-weight: 500;
        }

        .classification-count {
            color: #2c3e50;
            font-weight: 700;
            background: #e9ecef;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.9rem;
        }

        .boundary-indicator {
            width: 30px;
            height: 6px;
            border: 2px dotted #dc3545;
            border-radius: 2px;
        }

        .interaction-guide {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .guide-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .guide-text {
            color: #1565c0;
            font-size: 0.9rem;
            line-height: 1.4;
            margin: 0;
        }

        /* Village Details Styles */
        .village-details {
            padding: 16px 0;
        }

        .village-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .village-title {
            color: #2c3e50;
            font-size: 1.2rem;
            font-weight: 700;
            margin: 0;
        }

        .village-id-badge {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .classification-cards {
            display: grid;
            gap: 12px;
            margin-bottom: 24px;
        }

        .classification-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-left: 4px solid;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .classification-card:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .forest-card {
            border-left-color: #2d5a27;
        }

        .potential-card {
            border-left-color: #28a745;
        }

        .non-potential-card {
            border-left-color: #ffc107;
        }

        .reservoir-card {
            border-left-color: #17a2b8;
        }

        .card-icon {
            font-size: 2rem;
            flex-shrink: 0;
        }

        .card-content h4 {
            color: #2c3e50;
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 4px 0;
        }

        .card-content p {
            color: #6c757d;
            font-size: 0.85rem;
            margin: 0;
            line-height: 1.3;
        }

        .additional-properties {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 16px;
        }

        .properties-title {
            color: #2c3e50;
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 16px 0;
        }

        .properties-grid {
            display: grid;
            gap: 8px;
        }

        .property-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }

        .property-item:last-child {
            border-bottom: none;
        }

        .property-key {
            color: #495057;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .property-value {
            color: #2c3e50;
            font-weight: 600;
            font-size: 0.9rem;
            text-align: right;
        }

        /* No Selection States */
        .no-selection {
            padding: 20px 0;
        }

        .info-message, .welcome-message {
            background: white;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .info-icon, .welcome-icon {
            font-size: 3rem;
            margin-bottom: 16px;
        }

        .welcome-message h4 {
            color: #2c3e50;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 12px 0;
        }

        .welcome-message p {
            color: #6c757d;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        }

        .feature-list li {
            color: #495057;
            font-size: 0.9rem;
            padding: 6px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default TopoGraphicalMap;