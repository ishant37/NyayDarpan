import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";

// --- Utility: Random Stats Generator ---
const generateRandomStats = (factor) => ({
    totalPlots: Math.floor(321506 / factor),
    totalIFRFiled: Math.floor(585326 / factor),
    totalIFRGranted: Math.floor(266901 / factor),
    totalCFRFiled: Math.floor(42187 / factor),
    totalCFRGranted: Math.floor(27976 / factor),
    totalPattaHolders: Math.floor(294877 / factor),
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

const BALAGHAT_PLOTS = [
    {
        coords: [
            [21.81, 80.18], [21.81, 80.19],
            [21.80, 80.19], [21.80, 80.18]
        ],
        village_nam: 'Sanguem', tenant_name: 'Yusuf Khan', plot_id: '03b59', kha_no: '5s22c2', Land_Area: '2.8 acre', Land_type: 'Commercial', Rent_Cess: '₹280', Last_Published_Date: '2024-07-03'
    },
    {
        coords: [
            [21.83, 80.21], [21.83, 80.22],
            [21.82, 80.22], [21.82, 80.21]
        ],
        village_nam: 'Deori', tenant_name: 'Pooja Singh', plot_id: '1a2b3', kha_no: '1k99d1', Land_Area: '1.5 acre', Land_type: 'Agriculture', Rent_Cess: '₹150', Last_Published_Date: '2024-06-15'
    },
    {
        coords: [
            [21.76, 80.20], [21.76, 80.21],
            [21.75, 80.21], [21.75, 80.20]
        ],
        village_nam: 'Lalbarra', tenant_name: 'Amit Patel', plot_id: '4c5d6', kha_no: '8t44f3', Land_Area: '5.0 acre', Land_type: 'Residential', Rent_Cess: '₹500', Last_Published_Date: '2024-07-10'
    },
    {
        coords: [
            [21.86, 80.25], [21.86, 80.26],
            [21.85, 80.26], [21.85, 80.25]
        ],
        village_nam: 'Katangi', tenant_name: 'Sunita Devi', plot_id: '7e8f9', kha_no: '3j11a7', Land_Area: '0.9 acre', Land_type: 'Agriculture', Rent_Cess: '₹90', Last_Published_Date: '2024-05-20'
    },
    {
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
    const [selectedPlot, setSelectedPlot] = useState(null); // New state for plot details
    const [stats, setStats] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geojsonLayerRef = useRef(null);
    const geojsonFeaturesRef = useRef([]);
    const plotLayerRef = useRef(null);
    
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
        return properties.D_N || properties.ADM2_EN || properties.name || properties.NAME_2 || "Unknown District";
    }, []);

    // --- Data Loading Effect ---
    useEffect(() => {
        if (selectedDistrict) {
            setStats(generateRandomStats(districts.length || 10)); // Generate district-specific stats
        } else {
            setStats(generateRandomStats(1)); // Generate state-level stats
        }
    }, [selectedState, selectedDistrict, districts.length]);
    
    
    // --- Plot Rendering Effect ---
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clean up previous plot layer
        if (plotLayerRef.current) {
            map.removeLayer(plotLayerRef.current);
            plotLayerRef.current = null;
        }

        // Load plots only for Balaghat in Madhya Pradesh
        if (selectedDistrict && selectedState === "Madhya Pradesh" && selectedDistrict.name === "Balaghat") {
            const plotLayerGroup = L.layerGroup().addTo(map);
            const bounds = L.latLngBounds();

            BALAGHAT_PLOTS.forEach(plot => {
                const polygon = L.polygon(plot.coords, PLOT_POLYGON_STYLE)
                    .on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        setSelectedPlot(plot); // Set plot data for the sidebar
                        setIsSidebarOpen(true); // Open sidebar on plot click
                        map.fitBounds(e.target.getBounds(), { maxZoom: 17, padding: [50, 50] });
                    })
                    .on('mouseover', function () { this.setStyle(PLOT_HOVER_STYLE); this.bringToFront(); })
                    .on('mouseout', function () { this.setStyle(PLOT_POLYGON_STYLE); })
                    .addTo(plotLayerGroup);

                bounds.extend(polygon.getBounds());
                polygon.bindTooltip(`Plot ID: ${plot.plot_id}`, { sticky: true });
            });

            plotLayerRef.current = plotLayerGroup;
            map.fitBounds(bounds.pad(0.1));
        }
    }, [selectedDistrict, selectedState]);


    // --- Event Handlers ---

    const handleStateChange = (event) => {
        setSelectedState(event.target.value);
        setSelectedDistrict(null);
        setSelectedPlot(null);
    };

    const handleDistrictSelect = (event) => {
        const districtName = event.target.value;
        setSelectedPlot(null); // Clear plot details when district changes

        if (geojsonLayerRef.current) {
            geojsonLayerRef.current.eachLayer(l => l.setStyle(STATE_COLOR_STYLE));
        }

        if (districtName === "") {
            setSelectedDistrict(null);
            if(mapInstanceRef.current && geojsonLayerRef.current) {
                mapInstanceRef.current.fitBounds(geojsonLayerRef.current.getBounds());
            }
        } else {
            const featureIndex = geojsonFeaturesRef.current.findIndex(f => {
                const index = geojsonFeaturesRef.current.indexOf(f);
                return getDistrictName(f, selectedState, index) === districtName;
            });

            const feature = geojsonFeaturesRef.current[featureIndex];
            let targetLayer = null;
            if (feature) {
                geojsonLayerRef.current.eachLayer((l) => {
                    if (l.feature === feature) targetLayer = l;
                });
            }

            if (feature && targetLayer) {
                targetLayer.setStyle(HIGHLIGHTED_DISTRICT_STYLE);
                setSelectedDistrict({ name: districtName, feature: feature, layer: targetLayer });
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
            geojsonLayerRef.current.eachLayer(l => l.setStyle(STATE_COLOR_STYLE));
        }

        layer.setStyle(HIGHLIGHTED_DISTRICT_STYLE);
        setSelectedDistrict({ name: districtName, feature, layer });
        setSelectedPlot(null); // Clear any selected plot
        setIsSidebarOpen(true); // Open sidebar on district click

        if (mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(layer.getBounds().pad(0.1));
        }
    };


    // --- Map Initialization and GeoJSON Loading ---
    useEffect(() => {
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([22.0, 79.0], 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);
            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        if (geojsonLayerRef.current) {
            map.removeLayer(geojsonLayerRef.current);
        }
        
        setSelectedDistrict(null);
        setSelectedPlot(null);

        fetch(GEOJSON_URLS[selectedState])
            .then((response) => response.json())
            .then((geojson) => {
                geojsonFeaturesRef.current = geojson.features;
                const uniqueDistrictNames = (selectedState === "Tripura")
                    ? TRIPURA_DISTRICT_NAMES
                    : [...new Set(geojson.features.map((f, i) => getDistrictName(f, selectedState, i)))]
                        .filter(name => name !== "Unknown District")
                        .sort();
                
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
            .catch((err) => console.error("Failed to load GeoJSON:", err));

    }, [selectedState, getDistrictName]);
    
    const getSidebarContent = () => {
        if (selectedPlot) {
            return <PlotDetailView plotData={selectedPlot} />;
        }
        if (stats) {
            const type = selectedDistrict ? 'District' : 'State';
            const name = selectedDistrict ? selectedDistrict.name : selectedState;
            return <StateDistrictView stats={stats} name={name} type={type} />;
        }
        return <SidebarPlaceholder message="Loading cadastrial data..." />;
    };

    return (
        <div className="map-container">
            <div ref={mapRef} id="map" />
            <div id="sidebar" className={isSidebarOpen ? "visible" : ""}>
                <div className="sidebar-header">
                    <div className="sidebar-title-container">
                        <h3>{selectedPlot ? '📋 Plot Details' : (selectedDistrict ? '🏘️ District Analysis' : '🏛️ State Overview')}</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="close-btn">×</button>
                    </div>

                    <div className="filter-group">
                        <label>Select State:</label>
                        <select value={selectedState} onChange={handleStateChange}>
                            {Object.keys(GEOJSON_URLS).map((stateName) => (
                                <option key={stateName} value={stateName}>{stateName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Select District (Optional):</label>
                        <select
                            value={selectedDistrict ? selectedDistrict.name : ""}
                            onChange={handleDistrictSelect}
                            disabled={districts.length === 0}
                        >
                            <option value="">-- View State Summary --</option>
                            {districts.map((districtName) => (
                                <option key={districtName} value={districtName}>{districtName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="sidebar-content">
                    {getSidebarContent()}
                </div>
            </div>

            <style>{`
                /* --- CSS Variables for Easy Theming --- */
                :root {
                    --bg-sidebar: #f8f9fa;
                    --bg-card: #ffffff;
                    --border-color: #dee2e6;
                    --shadow-color: rgba(0, 0, 0, 0.08);
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --primary-color: #007bff;
                    --success-color: #28a745;
                    --warning-color: #ffc107;
                    --info-color: #17a2b8;
                    --font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
            
                /* --- Main Layout --- */
                .map-container {
                    height: 100%;
                    width: 100%;
                    position: relative;
                    font-family: var(--font-family);
                    overflow: hidden; /* Prevent scrollbars */
                }
                #map {
                    height: 100%;
                    width: 100%;
                }
                #sidebar {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 380px; /* Slightly wider for better spacing */
                    height: calc(100% - 20px);
                    background: var(--bg-sidebar);
                    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
                    z-index: 1000;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    transform: translateX(calc(100% + 20px));
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                #sidebar.visible {
                    transform: translateX(0);
                }

                /* --- Sidebar Header & Filters --- */
                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 10;
                }
                .sidebar-title-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .sidebar-title-container h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.3rem;
                    font-weight: 600;
                }
                .close-btn {
                    cursor: pointer;
                    font-size: 28px;
                    font-weight: 400;
                    color: var(--text-secondary);
                    background: none;
                    border: none;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s, transform 0.2s;
                }
                .close-btn:hover {
                    color: #dc3545;
                    transform: rotate(90deg);
                }
                .filter-group {
                    margin-bottom: 16px;
                }
                .filter-group:last-child {
                    margin-bottom: 0;
                }
                .filter-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .filter-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    font-size: 1rem;
                    background-color: var(--bg-card);
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .filter-group select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
                }
                .filter-group select:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                }

                /* --- Sidebar Content Area --- */
                .sidebar-content {
                    padding: 20px;
                    overflow-y: auto;
                    flex-grow: 1; /* Allows content to take up remaining space */
                }
                .sidebar-content::-webkit-scrollbar { width: 6px; }
                .sidebar-content::-webkit-scrollbar-track { background: #f1f1f1; }
                .sidebar-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
                .sidebar-content::-webkit-scrollbar-thumb:hover { background: #aaa; }

                /* --- General Card Styling --- */
                .info-card {
                    background: var(--bg-card);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 2px 8px var(--shadow-color);
                }

                /* --- State/District View Specific Styles --- */
                .analysis-header {
                    margin-bottom: 24px;
                    text-align: center;
                }
                .analysis-header h4 {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                }
                .analysis-header p {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .stat-item {
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    padding: 16px;
                    text-align: center;
                }
                .stat-item .stat-number {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                }
                .stat-item .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
                .claim-card {
                    margin-bottom: 16px;
                }
                .claim-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }
                .claim-type { font-weight: 600; color: var(--text-primary); }
                .claim-stats { display: flex; justify-content: space-around; margin-bottom: 12px; }
                .claim-stat .claim-number { font-size: 1.2rem; font-weight: 600; }
                .claim-stat .claim-label { font-size: 0.8rem; color: var(--text-secondary); }
                .claim-stat.granted .claim-number { color: var(--success-color); }
                .progress-bar { background: #e9ecef; border-radius: 10px; height: 6px; overflow: hidden; }
                .progress-fill { background: var(--success-color); height: 100%; border-radius: 10px; }

                /* --- Plot Detail View Specific Styles --- */
                .plot-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .plot-title { color: var(--text-primary); font-size: 1.3rem; font-weight: 600; margin: 0; }
                .plot-id-badge {
                    background: var(--primary-color);
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .plot-info-grid { display: grid; gap: 12px; }
                .plot-info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #f1f1f1;
                }
                .plot-info-item:last-child { border-bottom: none; }
                .plot-info-item strong { color: var(--text-secondary); font-weight: 500; }
                .plot-info-item span { color: var(--text-primary); font-weight: 500; text-align: right; }

                /* --- Placeholder Style --- */
                .placeholder {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    padding: 40px 20px;
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .placeholder .icon {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }
            `}</style>
        </div>
    );
};


// ================================================================== //
// ======= NEW SIDEBAR COMPONENTS (REPLACING innerHTML) ========== //
// ================================================================== //

const StateDistrictView = ({ stats, name, type }) => {
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current || !stats) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const { totalIFRFiled, totalIFRGranted, totalCFRFiled, totalCFRGranted } = stats;
        const ctx = chartContainerRef.current.getContext("2d");
        chartInstanceRef.current = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["IFR Granted", "IFR Pending", "CFR Granted", "CFR Pending"],
                datasets: [{
                    data: [
                        totalIFRGranted,
                        totalIFRFiled - totalIFRGranted,
                        totalCFRGranted,
                        totalCFRFiled - totalCFRGranted,
                    ],
                    backgroundColor: ["#28a745", "#ffc107", "#17a2b8", "#fd7e14"],
                    borderColor: "#f8f9fa",
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: { position: "bottom", labels: { padding: 15, usePointStyle: true, font: { size: 11 } } },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        };
    }, [stats]);

    if (!stats) return <SidebarPlaceholder message="Loading statistics..." />;
    
    const { totalPlots, totalIFRFiled, totalIFRGranted, totalCFRFiled, totalCFRGranted, totalPattaHolders } = stats;
    const ifrSuccessRate = totalIFRFiled > 0 ? ((totalIFRGranted / totalIFRFiled) * 100).toFixed(1) : 0;
    const cfrSuccessRate = totalCFRFiled > 0 ? ((totalCFRGranted / totalCFRFiled) * 100).toFixed(1) : 0;

    return (
        <div>
            <div className="analysis-header">
                <h4>{name}</h4>
                <p>{type}-level Cadastrial Summary</p>
            </div>

            <div className="stats-grid">
                <div className="stat-item">
                    <div className="stat-number">{totalPlots.toLocaleString()}</div>
                    <div className="stat-label">Land Parcels</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{totalPattaHolders.toLocaleString()}</div>
                    <div className="stat-label">Patta Holders</div>
                </div>
            </div>

            <div className="info-card">
                <h5>📊 FRA Claims Analysis</h5>
                <div className="claim-card">
                    <div className="claim-header">
                        <span role="img" aria-label="tree">🌳</span>
                        <span className="claim-type">Individual Rights (IFR)</span>
                    </div>
                    <div className="claim-stats">
                        <div className="claim-stat">
                            <div className="claim-number">{totalIFRFiled.toLocaleString()}</div>
                            <div className="claim-label">Filed</div>
                        </div>
                        <div className="claim-stat granted">
                            <div className="claim-number">{totalIFRGranted.toLocaleString()}</div>
                            <div className="claim-label">Granted</div>
                        </div>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${ifrSuccessRate}%` }}></div></div>
                    <small>{ifrSuccessRate}% Success Rate</small>
                </div>
                <div className="claim-card">
                    <div className="claim-header">
                        <span role="img" aria-label="people">🏘️</span>
                        <span className="claim-type">Community Rights (CFR)</span>
                    </div>
                    <div className="claim-stats">
                        <div className="claim-stat">
                            <div className="claim-number">{totalCFRFiled.toLocaleString()}</div>
                            <div className="claim-label">Filed</div>
                        </div>
                        <div className="claim-stat granted">
                            <div className="claim-number">{totalCFRGranted.toLocaleString()}</div>
                            <div className="claim-label">Granted</div>
                        </div>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${cfrSuccessRate}%`, background: '#17a2b8' }}></div></div>
                    <small>{cfrSuccessRate}% Success Rate</small>
                </div>
            </div>
            
            <div className="info-card">
                <canvas ref={chartContainerRef}></canvas>
            </div>
        </div>
    );
};

const PlotDetailView = ({ plotData }) => {
    return (
        <div className="info-card">
            <div className="plot-header">
                <h4 className="plot-title">Plot Information</h4>
                <div className="plot-id-badge">{plotData.plot_id}</div>
            </div>
            <div className="plot-info-grid">
                <div className="plot-info-item"><strong>Village:</strong> <span>{plotData.village_nam}</span></div>
                <div className="plot-info-item"><strong>Tenant:</strong> <span>{plotData.tenant_name}</span></div>
                <div className="plot-info-item"><strong>Khasra No:</strong> <span>{plotData.kha_no}</span></div>
                <div className="plot-info-item"><strong>Land Area:</strong> <span>{plotData.Land_Area}</span></div>
                <div className="plot-info-item"><strong>Land Type:</strong> <span>{plotData.Land_type}</span></div>
                <div className="plot-info-item"><strong>Rent/Cess:</strong> <span>{plotData.Rent_Cess}</span></div>
                <div className="plot-info-item"><strong>Last Updated:</strong> <span>{plotData.Last_Published_Date}</span></div>
            </div>
        </div>
    );
};

const SidebarPlaceholder = ({ message }) => {
    return (
        <div className="placeholder">
            <div className="icon">📊</div>
            {message}
        </div>
    );
};

export default CadastrialMap;