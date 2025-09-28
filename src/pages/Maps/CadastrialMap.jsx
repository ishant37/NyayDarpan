import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";

// --- Utility: Random Stats Generator (Keep this outside the component) ---
const generateRandomStats = (factor) => ({
    totalPlots: Math.floor(Math.random() * 100 * factor) + 10,
    totalIFRFiled: Math.floor(Math.random() * 50 * factor) + 5,
    totalIFRGranted: Math.floor(Math.random() * 40 * factor) + 2,
    totalCFRFiled: Math.floor(Math.random() * 30 * factor) + 3,
    totalCFRGranted: Math.floor(Math.random() * 20 * factor) + 1,
    totalPattaHolders: Math.floor(Math.random() * 60 * factor) + 5,
});

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

// --- GeoJSON Property Mapping for District Names ---
const DISTRICT_NAME_PROPERTIES = {
    "Madhya Pradesh": "district",
    "Odisha": "district",
    "Telangana": "DISTRICT",
    "Tripura": "ADM2_EN",
};

// --- Hardcoded Data for Tripura and Balaghat Plots ---
const TRIPURA_DISTRICT_NAMES = [
    "Dhalai", "Gomati", "Khowai", "North Tripura",
    "Sepahijala", "South Tripura", "Unakoti", "West Tripura",
];

// 💡 CRITICAL FIX: Coordinates are made very small and tightly clustered around Balaghat's center (approx 21.8, 80.2)
const BALAGHAT_PLOTS = [
    {
       // Plot 1: Sanguem (Near 21.80, 80.18)
       coords: [
         [21.81, 80.18], [21.81, 80.19], 
         [21.80, 80.19], [21.80, 80.18]
       ],
       village_nam: 'Sanguem', tenant_name: 'Yusuf Khan', plot_id: '03b59', kha_no: '5s22c2', Land_Area: '2.8 acre', Land_type: 'Commercial', Rent_Cess: '₹280', Last_Published_Date: '2024-07-03'
},
{
       // Plot 2: Deori (Near 21.82, 80.21)
       coords: [
         [21.83, 80.21], [21.83, 80.22],
         [21.82, 80.22], [21.82, 80.21]
       ],
       village_nam: 'Deori', tenant_name: 'Pooja Singh', plot_id: '1a2b3', kha_no: '1k99d1', Land_Area: '1.5 acre', Land_type: 'Agriculture', Rent_Cess: '₹150', Last_Published_Date: '2024-06-15'
},
{
       // Plot 3: Lalbarra (Near 21.75, 80.20)
       coords: [
         [21.76, 80.20], [21.76, 80.21],
         [21.75, 80.21], [21.75, 80.20]
       ],
       village_nam: 'Lalbarra', tenant_name: 'Amit Patel', plot_id: '4c5d6', kha_no: '8t44f3', Land_Area: '5.0 acre', Land_type: 'Residential', Rent_Cess: '₹500', Last_Published_Date: '2024-07-10'
    },
{
       // Plot 4: Katangi (Near 21.85, 80.25)
       coords: [
         [21.86, 80.25], [21.86, 80.26],
         [21.85, 80.26], [21.85, 80.25]
       ],
       village_nam: 'Katangi', tenant_name: 'Sunita Devi', plot_id: '7e8f9', kha_no: '3j11a7', Land_Area: '0.9 acre', Land_type: 'Agriculture', Rent_Cess: '₹90', Last_Published_Date: '2024-05-20'
    },
    {
       // Plot 5: Tirodi (Near 21.70, 80.15)
       coords: [
        [21.71, 80.15], [21.71, 80.16],
         [21.70, 80.16], [21.70, 80.15]
       ],
       village_nam: 'Tirodi', tenant_name: 'Rajesh Verma', plot_id: '9g0h1', kha_no: '6m33b4', Land_Area: '3.2 acre', Land_type: 'Industrial', Rent_Cess: '₹320', Last_Published_Date: '2024-07-01'
    },
];

// --- Leaflet Styling ---
const STATE_COLOR_STYLE = {
    color: "#00782a",
    weight: 1,
    opacity: 0.8,
    fillColor: "#a3c7a7",
    fillOpacity: 0.3,
};

const HIGHLIGHTED_DISTRICT_STYLE = {
    color: "red",
    weight: 3,
    opacity: 1,
    fillColor: "#ff7800",
    fillOpacity: 0.5,
};

const PLOT_POLYGON_STYLE = {
    color: '#0000FF', // Blue outline
    weight: 2,
    opacity: 1,
    fillColor: '#87CEEB', // Light Sky Blue fill
    fillOpacity: 0.6
};

const PLOT_HOVER_STYLE = {
    color: '#FF0000',
    weight: 3,
    fillOpacity: 0.8
};


const CadastrialMap = () => {
    const [selectedState, setSelectedState] = useState("Madhya Pradesh");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    // State for sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const mapRef = useRef(null);
    const sidebarRef = useRef(null);
    const sidebarContentRef = useRef(null);
    const chartRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geojsonLayerRef = useRef(null);
    const geojsonFeaturesRef = useRef([]);
    const plotLayerRef = useRef(null);

    // --- Utility: Sidebar Functions ---
    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const openSidebar = useCallback(() => {
        setIsSidebarOpen(true);
    }, []);

    // --- Utility: Get District Name ---
    const getDistrictName = useCallback((feature, stateName, index = -1) => {
        if (stateName === "Tripura") {
            return TRIPURA_DISTRICT_NAMES[index] || "Unknown District (Tripura)";
        }

        const properties = feature.properties;
        const specificKey = DISTRICT_NAME_PROPERTIES[stateName];

        if (properties && properties[specificKey]) {
            return properties[specificKey];
        }

        return properties.D_N ||
            properties.ADM2_EN ||
            properties.name ||
            properties.NAME_2 ||
            "Unknown District";
    }, []);

    // --- Plot Details Renderer ---

    const renderPlotDetails = useCallback((plotData) => {
        const sidebarContent = sidebarContentRef.current;
        if (!sidebarContent) return;

        sidebarContent.innerHTML = "";

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        sidebarContent.innerHTML = `
            <div class="plot-header">
                <h3 class="plot-title">📋 Plot Details</h3>
                <div class="plot-id-badge">${plotData.plot_id}</div>
            </div>
            
            <div class="plot-info-grid">
                <div class="plot-info-card">
                    <div class="plot-info-icon">🏘️</div>
                    <div class="plot-info-content">
                        <h4>Location</h4>
                        <p><strong>Village:</strong> ${plotData.village_nam}</p>
                        <p><strong>Khasra No:</strong> ${plotData.kha_no}</p>
                    </div>
                </div>
                
                <div class="plot-info-card">
                    <div class="plot-info-icon">👤</div>
                    <div class="plot-info-content">
                        <h4>Ownership</h4>
                        <p><strong>Tenant:</strong> ${plotData.tenant_name}</p>
                        <p><strong>Type:</strong> ${plotData.Land_type}</p>
                    </div>
                </div>
                
                <div class="plot-info-card">
                    <div class="plot-info-icon">📏</div>
                    <div class="plot-info-content">
                        <h4>Land Details</h4>
                        <p><strong>Area:</strong> ${plotData.Land_Area}</p>
                        <p><strong>Rent/Cess:</strong> ${plotData.Rent_Cess}</p>
                    </div>
                </div>
                
                <div class="plot-info-card">
                    <div class="plot-info-icon">📅</div>
                    <div class="plot-info-content">
                        <h4>Last Updated</h4>
                        <p>${plotData.Last_Published_Date}</p>
                    </div>
                </div>
            </div>
        `;

        openSidebar(); 
    }, [openSidebar]);


    // --- District/State Details Renderer ---

    const renderDataAndChart = useCallback((name, data) => {
        const sidebarContent = sidebarContentRef.current;
        if (!sidebarContent) return;

        sidebarContent.innerHTML = "";

        const isDistrictSelected = !!selectedDistrict;
        const primaryName = isDistrictSelected ? selectedDistrict.name : selectedState;
        
        const {
            totalPlots, totalIFRFiled, totalIFRGranted,
            totalCFRFiled, totalCFRGranted, totalPattaHolders
        } = data;
        
        const titleText = isDistrictSelected ? `District Analysis: ${primaryName}` : `State Overview: ${primaryName}`;

        sidebarContent.innerHTML = `
            <div class="data-header">
                <h3 class="data-title">${titleText}</h3>
                ${!isDistrictSelected ? '<p class="data-subtitle">State-level cadastrial summary</p>' : ''}
            </div>
            
            <div class="stats-grid">
                <div class="stat-card plots">
                    <div class="stat-icon">🗺️</div>
                    <div class="stat-content">
                        <h5>Land Parcels</h5>
                        <div class="stat-number">${totalPlots}</div>
                        <p class="stat-label">Total Plots</p>
                    </div>
                </div>
                
                <div class="stat-card holders">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <h5>Patta Holders</h5>
                        <div class="stat-number">${totalPattaHolders}</div>
                        <p class="stat-label">Active Holders</p>
                    </div>
                </div>
            </div>
            
            <div class="claims-section">
                <h4 class="section-title">📊 FRA Claims Analysis</h4>
                <div class="claims-grid">
                    <div class="claim-card ifr">
                        <div class="claim-header">
                            <span class="claim-icon">🌳</span>
                            <span class="claim-type">Individual Rights</span>
                        </div>
                        <div class="claim-stats">
                            <div class="claim-stat">
                                <span class="claim-number">${totalIFRFiled}</span>
                                <span class="claim-label">Filed</span>
                            </div>
                            <div class="claim-stat granted">
                                <span class="claim-number">${totalIFRGranted}</span>
                                <span class="claim-label">Granted</span>
                            </div>
                        </div>
                        <div class="claim-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(totalIFRGranted/totalIFRFiled*100).toFixed(1)}%"></div>
                            </div>
                            <span class="progress-text">${(totalIFRGranted/totalIFRFiled*100).toFixed(1)}% Success Rate</span>
                        </div>
                    </div>
                    
                    <div class="claim-card cfr">
                        <div class="claim-header">
                            <span class="claim-icon">🏘️</span>
                            <span class="claim-type">Community Rights</span>
                        </div>
                        <div class="claim-stats">
                            <div class="claim-stat">
                                <span class="claim-number">${totalCFRFiled}</span>
                                <span class="claim-label">Filed</span>
                            </div>
                            <div class="claim-stat granted">
                                <span class="claim-number">${totalCFRGranted}</span>
                                <span class="claim-label">Granted</span>
                            </div>
                        </div>
                        <div class="claim-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(totalCFRGranted/totalCFRFiled*100).toFixed(1)}%"></div>
                            </div>
                            <span class="progress-text">${(totalCFRGranted/totalCFRFiled*100).toFixed(1)}% Success Rate</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="chart-container">
                <h4 class="chart-title">Claims Distribution</h4>
                <canvas id="fraChart"></canvas>
            </div>
        `;

        openSidebar();

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = document.getElementById("fraChart").getContext("2d");
        chartRef.current = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["IFR Granted", "IFR Pending", "CFR Granted", "CFR Pending"],
                datasets: [
                    {
                        data: [
                            totalIFRGranted,
                            totalIFRFiled - totalIFRGranted,
                            totalCFRGranted,
                            totalCFRFiled - totalCFRGranted,
                        ],
                        backgroundColor: ["#28a745", "#ffc107", "#17a2b8", "#fd7e14"],
                        borderColor: ["#1e7e34", "#e0a800", "#138496", "#dc6502"],
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { 
                        position: "bottom",
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                return `${tooltipItem.label}: ${tooltipItem.raw}`;
                            },
                        },
                    },
                },
                cutout: '60%',
            },
        });
    }, [selectedDistrict, selectedState, openSidebar]); 


    // --- Effect: Update sidebar with State/District Data ---
    useEffect(() => {
        if (!selectedDistrict) {
            const stateStats = generateRandomStats(10);
            renderDataAndChart(selectedState, stateStats);
        }
        else {
            const districtStats = generateRandomStats(2);
            renderDataAndChart(selectedDistrict.name, districtStats);
        }
        
    }, [selectedState, selectedDistrict, renderDataAndChart]); 


    // ## The Plot Rendering Effect ##
    useEffect(() => {
        const map = mapInstanceRef.current;

        // 1. Clean up previous plot layer
        if (plotLayerRef.current) {
            map.removeLayer(plotLayerRef.current);
            plotLayerRef.current = null;
        }

        // 2. Load plots only for Balaghat in Madhya Pradesh
        if (map && selectedDistrict && selectedState === "Madhya Pradesh" && selectedDistrict.name === "Balaghat") {
            const plotLayerGroup = L.layerGroup().addTo(map);
            const bounds = L.latLngBounds();

            BALAGHAT_PLOTS.forEach(plot => {
                // L.polygon uses the 'coords' array (which is a 4-point box) and PLOT_POLYGON_STYLE
                const polygon = L.polygon(plot.coords, PLOT_POLYGON_STYLE)
                    .on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        renderPlotDetails(plot); // Shows plot details on click and opens sidebar
                        // Zoom to the clicked plot
                        map.fitBounds(e.target.getBounds(), { maxZoom: 16 });
                    })
                    .on('mouseover', function () {
                        this.setStyle(PLOT_HOVER_STYLE);
                        this.bringToFront();
                    })
                    .on('mouseout', function () {
                        this.setStyle(PLOT_POLYGON_STYLE);
                    })
                    .addTo(plotLayerGroup);

                bounds.extend(polygon.getBounds());
                polygon.bindTooltip(`Plot ID: ${plot.plot_id}`, { sticky: true });
            });

            plotLayerRef.current = plotLayerGroup;
            // 3. Zoom the map to fit all the plots (the 'boxes')
            map.fitBounds(bounds.pad(0.1));
        }

        // 4. Cleanup function
        return () => {
            if (plotLayerRef.current) {
                map.removeLayer(plotLayerRef.current);
                plotLayerRef.current = null;
            }
        };
    }, [selectedDistrict, selectedState, renderPlotDetails]);


    // --- Event Handlers ---

    const handleStateChange = (event) => {
        setSelectedState(event.target.value);
        setSelectedDistrict(null);
    };

    const handleDistrictSelect = (event) => {
        const districtName = event.target.value;

        if (geojsonLayerRef.current) {
            geojsonLayerRef.current.eachLayer(l => {
                l.setStyle(STATE_COLOR_STYLE);
            });
        }

        if (districtName === "") {
            setSelectedDistrict(null);
        } else {
            let targetLayer = null;

            const featureIndex = geojsonFeaturesRef.current.findIndex(f => {
                const index = geojsonFeaturesRef.current.indexOf(f);
                const name = getDistrictName(f, selectedState, index);
                return name === districtName;
            });

            const feature = geojsonFeaturesRef.current[featureIndex];

            if (feature) {
                geojsonLayerRef.current.eachLayer((l) => {
                    if (l.feature === feature) {
                        targetLayer = l;
                    }
                });
            }

            if (feature && targetLayer) {
                targetLayer.setStyle(HIGHLIGHTED_DISTRICT_STYLE);

                setSelectedDistrict({
                    name: districtName,
                    feature: feature,
                    layer: targetLayer
                });
                
                // Center map on the selected district
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.fitBounds(targetLayer.getBounds().pad(0.1));
                }
            }
        }
    };

    const handleMapClick = (feature, layer) => {
        const index = geojsonFeaturesRef.current.indexOf(feature);
        const districtName = getDistrictName(feature, selectedState, index);

        if (geojsonLayerRef.current) {
            geojsonLayerRef.current.eachLayer(l => {
                l.setStyle(STATE_COLOR_STYLE);
            });
        }

        layer.setStyle(HIGHLIGHTED_DISTRICT_STYLE);

        setSelectedDistrict({
            name: districtName,
            feature: feature,
            layer: layer
        });

        // Center map on the clicked district
        if (mapInstanceRef.current) {
             mapInstanceRef.current.fitBounds(layer.getBounds().pad(0.1));
        }
    };


    // --- Map Initialization and GeoJSON Loading ---

    useEffect(() => {
        const mapContainer = mapRef.current;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainer).setView([22.0, 79.0], 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);
            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        if (geojsonLayerRef.current) {
            map.removeLayer(geojsonLayerRef.current);
            geojsonLayerRef.current = null;
            geojsonFeaturesRef.current = [];
            setDistricts([]);
        }

        setSelectedDistrict(null);

        const geojsonUrl = GEOJSON_URLS[selectedState];

        fetch(geojsonUrl)
            .then((response) => response.json())
            .then((geojson) => {

                geojsonFeaturesRef.current = geojson.features;

                let uniqueDistrictNames;

                if (selectedState === "Tripura") {
                    uniqueDistrictNames = TRIPURA_DISTRICT_NAMES;
                } else {
                    const newDistricts = geojson.features.map(f => ({
                        name: getDistrictName(f, selectedState),
                        feature: f
                    }));

                    uniqueDistrictNames = [...new Set(newDistricts.map(d => d.name))]
                        .filter(name => name !== "Unknown District")
                        .sort();
                }

                setDistricts(uniqueDistrictNames);

                const gLayer = L.geoJSON(geojson, {
                    style: STATE_COLOR_STYLE,
                    onEachFeature: (feature, layer) => {
                        layer.on("click", (e) => {
                            L.DomEvent.stopPropagation(e);
                            handleMapClick(feature, layer);
                        });
                    },
                }).addTo(map);

                geojsonLayerRef.current = gLayer;
                map.fitBounds(gLayer.getBounds());
            })
            .catch((err) => {
                console.error("Failed to load GeoJSON for " + selectedState + ":", err);
                setDistricts([]);
            });

        return () => {
            if (mapInstanceRef.current && !mapContainer.isConnected) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [selectedState, getDistrictName]);


    // --- Cleanup for Chart ---
    useEffect(() => {
        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, []);


    // --- Rendered Component Structure ---
    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <div ref={mapRef} id="map" style={{ height: "100%", width: "100%" }} />
            <div
                ref={sidebarRef}
                id="sidebar"
                // Assign class based on state
                className={isSidebarOpen ? "visible" : ""} 
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: "340px",
                    height: "calc(100% - 20px)",
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                    overflowY: "auto",
                    // 🔥 CRITICAL FIX: Removed the inline transform to let the CSS class control the position
                    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderLeft: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "12px 0 0 12px",
                }}
            >
                {/* Sticky Header */}
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        padding: "24px",
                        borderBottom: "2px solid #e9ecef",
                        zIndex: 10
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ 
                            margin: 0, 
                            color: "#2c3e50", 
                            fontSize: "1.4rem", 
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            🗺️ {selectedDistrict ? `District Analysis` : `State Overview`}
                        </h3>
                        <span
                            style={{ 
                                cursor: "pointer", 
                                fontSize: "28px", 
                                fontWeight: "bold",
                                color: "#6c757d",
                                transition: "all 0.2s",
                                padding: "5px",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            // The handler now uses the state function
                            onClick={closeSidebar} 
                            onMouseOver={(e) => {
                                e.target.style.color = "#dc3545";
                                e.target.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.color = "#6c757d";
                                e.target.style.backgroundColor = "transparent";
                            }}
                        >
                            ×
                        </span>
                    </div>

                    {/* Enhanced State Filter */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: 600, 
                            color: "#495057",
                            fontSize: "0.95rem"
                        }}>
                            🏛️ Select State:
                        </label>
                        <select
                            value={selectedState}
                            onChange={handleStateChange}
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                borderRadius: "10px",
                                border: "2px solid #dee2e6",
                                fontSize: "14px",
                                backgroundColor: "white",
                                transition: "all 0.2s",
                                fontWeight: 500
                            }}
                        >
                            {Object.keys(GEOJSON_URLS).map((stateName) => (
                                <option key={stateName} value={stateName}>
                                    {stateName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Enhanced District Filter */}
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: 600, 
                            color: "#495057",
                            fontSize: "0.95rem"
                        }}>
                            🏘️ Select District (Optional):
                        </label>
                        <select
                            value={selectedDistrict ? selectedDistrict.name : ""}
                            onChange={handleDistrictSelect}
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                borderRadius: "10px",
                                border: "2px solid #dee2e6",
                                fontSize: "14px",
                                backgroundColor: districts.length === 0 ? "#f8f9fa" : "white",
                                transition: "all 0.2s",
                                fontWeight: 500,
                                cursor: districts.length === 0 ? "not-allowed" : "pointer"
                            }}
                            disabled={districts.length === 0}
                        >
                            <option value="">-- View State Summary --</option>
                            {districts.map((districtName) => (
                                <option key={districtName} value={districtName}>
                                    {districtName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content Area */}
                <div 
                    ref={sidebarContentRef} 
                    style={{ padding: "0 24px 24px 24px" }}
                >
                    <div style={{ 
                        textAlign: "center", 
                        color: "#6c757d", 
                        fontSize: "14px",
                        padding: "40px 20px",
                        background: "white",
                        borderRadius: "12px",
                        border: "2px dashed #dee2e6"
                    }}>
                        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📊</div>
                        Loading cadastrial data...
                    </div>
                </div>
            </div>
            {/* Enhanced CSS styles for modern UI */}
            <style>{`
                /* Ensure non-visible state is handled by CSS only */
                #sidebar {
                    transform: translateX(100%);
                }
                
                #sidebar.visible {
                    transform: translateX(0%);
                }
                
                /* Plot Details Styles */
                .plot-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                
                .plot-title {
                    color: #2c3e50;
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin: 0;
                }
                
                .plot-id-badge {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                
                .plot-info-grid {
                    display: grid;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .plot-info-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .plot-info-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                
                .plot-info-icon {
                    font-size: 1.8rem;
                    flex-shrink: 0;
                }
                
                .plot-info-content h4 {
                    color: #2c3e50;
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                }
                
                .plot-info-content p {
                    color: #495057;
                    font-size: 0.85rem;
                    margin: 0 0 4px 0;
                    line-height: 1.4;
                }
                
                /* Data Analysis Styles */
                .data-header {
                    margin-bottom: 24px;
                }
                
                .data-title {
                    color: #2c3e50;
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }
                
                .data-subtitle {
                    color: #6c757d;
                    font-size: 0.9rem;
                    margin: 0;
                    font-style: italic;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                }
                
                .stat-icon {
                    font-size: 2.5rem;
                    opacity: 0.8;
                }
                
                .stat-content h4 {
                    color: #495057;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .stat-number {
                    color: #2c3e50;
                    font-size: 1.8rem;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                
                .stat-label {
                    color: #6c757d;
                    font-size: 0.8rem;
                    margin: 0;
                    text-transform: uppercase;
                }
                
                .claims-section {
                    margin-bottom: 24px;
                }
                
                .section-title {
                    color: #2c3e50;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                }
                
                .claims-grid {
                    display: grid;
                    gap: 16px;
                }
                
                .claim-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                }
                
                .claim-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                
                .claim-icon {
                    font-size: 1.4rem;
                }
                
                .claim-type {
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                
                .claim-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                
                .claim-stat {
                    text-align: center;
                }
                
                .claim-number {
                    display: block;
                    color: #2c3e50;
                    font-size: 1.5rem;
                    font-weight: 700;
                    line-height: 1;
                }
                
                .claim-label {
                    color: #6c757d;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .claim-stat.granted .claim-number {
                    color: #28a745;
                }
                
                .claim-progress {
                    margin-top: 12px;
                }
                
                .progress-bar {
                    background: #e9ecef;
                    border-radius: 10px;
                    height: 8px;
                    overflow: hidden;
                    margin-bottom: 6px;
                }
                
                .progress-fill {
                    background: linear-gradient(90deg, #28a745, #20c997);
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.5s ease;
                }
                
                .progress-text {
                    color: #495057;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .chart-container {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                }
                
                .chart-title {
                    color: #2c3e50;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default CadastrialMap;
