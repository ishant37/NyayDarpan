import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Plot3DView from './plot3dview';
import Chart from "chart.js/auto";



// --- Utility: Random Stats Generator (Keep this outside the component) ---

// 💡 UPDATED: Generator for District Asset Data
const generateDistrictAssets = (factor) => ({
    totalAgriculturalArea: (Math.random() * 1000 * factor).toFixed(2), // sq km
    forestCoverIndex: (Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 to 1.0
    homesteadsBuiltUpArea: (Math.random() * 50 * factor).toFixed(2), // sq km
    waterBodyCount: Math.floor(Math.random() * 50 * factor) + 5,
    miningNonForestUse: (Math.random() * 10 * factor).toFixed(2), // sq km
    waterStressIndex: (Math.random() * 10).toFixed(2), // 0 to 10
    schemeEligibilityRatio: (Math.random()).toFixed(2), // 0.0 to 1.0
    connectivityRoadProximity: (Math.random() * 100).toFixed(2), // km
    
    // Kept for the chart functionality in the existing code structure
    totalIFRFiled: Math.floor(Math.random() * 50 * factor) + 5,
    totalIFRGranted: Math.floor(Math.random() * 40 * factor) + 2,
    totalCFRFiled: Math.floor(Math.random() * 30 * factor) + 3,
    totalCFRGranted: Math.floor(Math.random() * 20 * factor) + 1,
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


const AssestMap = () => {
   const [selectedPlot, setSelectedPlot] = useState(null);
const [show3D, setShow3D] = useState(false);



    const [selectedState, setSelectedState] = useState("Madhya Pradesh");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    const mapRef = useRef(null);
    const sidebarRef = useRef(null);
    const sidebarContentRef = useRef(null);
    const chartRef = useRef(null);
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

        return properties.D_N ||
            properties.ADM2_EN ||
            properties.name ||
            properties.NAME_2 ||
            "Unknown District";
    }, []);

    // --- Plot Details Renderer ---

    const renderPlotDetails = useCallback((plotData) => {
        const sidebar = sidebarRef.current;
        const sidebarContent = sidebarContentRef.current;
        if (!sidebar || !sidebarContent) return;

        sidebarContent.innerHTML = "";

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        sidebarContent.innerHTML = `
            <div class="info-entry"><p><b>--- Plot Details ---</b></p></div>
            <div class="info-entry"><p><b>Plot ID:</b> ${plotData.plot_id}</p></div>
            <div class="info-entry"><p><b>Village:</b> ${plotData.village_nam}</p></div>
            <div class="info-entry"><p><b>Tenant Name:</b> ${plotData.tenant_name}</p></div>
            <div class="info-entry"><p><b>Khasra No:</b> ${plotData.kha_no}</p></div>
            <div class="info-entry"><p><b>Land Area:</b> ${plotData.Land_Area}</p></div>
            <div class="info-entry"><p><b>Land Type:</b> ${plotData.Land_type}</p></div>
            <div class="info-entry"><p><b>Rent/Cess:</b> ${plotData.Rent_Cess}</p></div>
            <div class="info-entry"><p><b>Last Update:</b> ${plotData.Last_Published_Date}</p></div>
        `;

        sidebar.classList.add("visible");
    }, []);


    // --- District/State Details Renderer (ENHANCED UI) ---
    const renderDataAndChart = useCallback((name, data) => {
        const sidebar = sidebarRef.current;
        const sidebarContent = sidebarContentRef.current;
        if (!sidebar || !sidebarContent) return;

        sidebarContent.innerHTML = "";

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        const isDistrictSelected = !!selectedDistrict;
        const primaryName = isDistrictSelected ? selectedDistrict.name : selectedState;
        
        const {
            totalAgriculturalArea, forestCoverIndex, homesteadsBuiltUpArea,
            waterBodyCount, miningNonForestUse, waterStressIndex,
            schemeEligibilityRatio, connectivityRoadProximity,
            totalIFRFiled, totalIFRGranted, totalCFRFiled, totalCFRGranted
        } = data;

        // Enhanced Header Section
        const headerSection = document.createElement('div');
        headerSection.className = 'asset-header';
        headerSection.innerHTML = `
            <div class="header-content">
                <h3 class="asset-title">🏗️ ${primaryName} Asset Analysis</h3>
                <div class="asset-type-badge">
                    ${isDistrictSelected ? 'District Level' : 'State Level'}
                </div>
            </div>
        `;

        // Enhanced Statistics Grid
        const statsSection = document.createElement('div');
        statsSection.className = 'asset-stats-section';
        statsSection.innerHTML = `
            <h5 class="section-title">📊 Key Asset Metrics</h5>
            <div class="stats-grid">
                <div class="stat-card agricultural">
                    <div class="stat-icon">🌾</div>
                    <div class="stat-content">
                        <div class="stat-number">${totalAgriculturalArea}</div>
                        <div class="stat-label">km² Agricultural Area</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill agricultural-progress" style="width: ${Math.min((totalAgriculturalArea / 1000) * 100, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card forest">
                    <div class="stat-icon">🌲</div>
                    <div class="stat-content">
                        <div class="stat-number">${(forestCoverIndex * 100).toFixed(1)}%</div>
                        <div class="stat-label">Forest Cover Index</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill forest-progress" style="width: ${forestCoverIndex * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card homestead">
                    <div class="stat-icon">🏠</div>
                    <div class="stat-content">
                        <div class="stat-number">${homesteadsBuiltUpArea}</div>
                        <div class="stat-label">km² Built-up Area</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill homestead-progress" style="width: ${Math.min((homesteadsBuiltUpArea / 50) * 100, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card water">
                    <div class="stat-icon">💧</div>
                    <div class="stat-content">
                        <div class="stat-number">${waterBodyCount}</div>
                        <div class="stat-label">Water Bodies</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill water-progress" style="width: ${Math.min((waterBodyCount / 100) * 100, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Environmental Impact Section
        const environmentSection = document.createElement('div');
        environmentSection.className = 'environment-section';
        environmentSection.innerHTML = `
            <h5 class="section-title">🌍 Environmental Impact</h5>
            <div class="environment-cards">
                <div class="environment-card mining">
                    <div class="card-header">
                        <div class="card-icon">⛏️</div>
                        <span class="card-title">Mining Activity</span>
                    </div>
                    <div class="card-content">
                        <div class="impact-value">${miningNonForestUse} km²</div>
                        <div class="impact-label">Non-forest land use</div>
                    </div>
                </div>

                <div class="environment-card water-stress">
                    <div class="card-header">
                        <div class="card-icon">🌡️</div>
                        <span class="card-title">Water Stress</span>
                    </div>
                    <div class="card-content">
                        <div class="impact-value">${waterStressIndex}/10</div>
                        <div class="impact-label">Stress Index</div>
                        <div class="stress-indicator">
                            <div class="stress-bar" style="width: ${waterStressIndex * 10}%; background: ${waterStressIndex > 7 ? '#e74c3c' : waterStressIndex > 4 ? '#f39c12' : '#27ae60'}"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Infrastructure Section
        const infrastructureSection = document.createElement('div');
        infrastructureSection.className = 'infrastructure-section';
        infrastructureSection.innerHTML = `
            <h5 class="section-title">🛣️ Infrastructure Analysis</h5>
            <div class="infrastructure-grid">
                <div class="infrastructure-item">
                    <div class="item-icon">🎯</div>
                    <div class="item-content">
                        <span class="item-label">Scheme Eligibility</span>
                        <div class="eligibility-bar">
                            <div class="eligibility-fill" style="width: ${schemeEligibilityRatio * 100}%"></div>
                        </div>
                        <span class="item-value">${(schemeEligibilityRatio * 100).toFixed(1)}%</span>
                    </div>
                </div>

                <div class="infrastructure-item">
                    <div class="item-icon">🛤️</div>
                    <div class="item-content">
                        <span class="item-label">Road Connectivity</span>
                        <span class="item-value">${connectivityRoadProximity} km proximity</span>
                    </div>
                </div>
            </div>
        `;

        // Rights Analysis Chart Section
        const chartSection = document.createElement('div');
        chartSection.className = 'chart-section';
        chartSection.innerHTML = `
            <h5 class="section-title">📈 Rights Analysis</h5>
            <div class="chart-container">
                <canvas id="fraChart" width="300" height="200"></canvas>
            </div>
        `;

        // Append all sections
        sidebarContent.appendChild(headerSection);
        sidebarContent.appendChild(statsSection);
        sidebarContent.appendChild(environmentSection);
        sidebarContent.appendChild(infrastructureSection);
        sidebarContent.appendChild(chartSection);

        sidebar.classList.add("visible");

        // Create enhanced doughnut chart
        const ctx = document.getElementById('fraChart').getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["IFR Granted", "IFR Denied", "CFR Granted", "CFR Denied"],
                datasets: [{
                    data: [
                        totalIFRGranted,
                        totalIFRFiled - totalIFRGranted,
                        totalCFRGranted,
                        totalCFRFiled - totalCFRGranted,
                    ],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(255, 235, 59, 0.8)'
                    ],
                    borderColor: [
                        'rgba(56, 142, 60, 1)',
                        'rgba(211, 47, 47, 1)',
                        'rgba(25, 118, 210, 1)',
                        'rgba(251, 192, 45, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
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
                                let label = tooltipItem.label || "";
                                if (label) label += ": ";
                                label += tooltipItem.raw;
                                return label;
                            },
                        },
                    }
                },
                cutout: '60%'
            }
        });

    }, [selectedDistrict, selectedState]);


    // --- Effect: Update sidebar with State/District Data (UPDATED) ---
    useEffect(() => {
        // For the State Summary, use a higher factor
        const stateStats = generateDistrictAssets(10);
        // For the District Details, use a smaller factor
        const districtStats = generateDistrictAssets(2);

        if (!selectedDistrict) {
            renderDataAndChart(selectedState, stateStats);
        }
        else {
            renderDataAndChart(selectedDistrict.name, districtStats);
        }
        
        // Ensure sidebar is visible
        if (sidebarRef.current) {
            sidebarRef.current.classList.add("visible");
        }
    }, [selectedState, selectedDistrict, renderDataAndChart]);


    // ## The Plot Rendering Effect ##
// --- The Plot Rendering Effect Effect ---
// (Only this useEffect block is shown for the fix)
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
                    renderPlotDetails(plot); // Shows plot details on click
                    // Zoom to the clicked plot
                    map.fitBounds(e.target.getBounds(), { maxZoom: 16 });
                    // ✅ CRITICAL LINE 1: Set Plot and Show 3D for Balaghat
                    setSelectedPlot(plot); 
                    setShow3D(true);
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
    // 👇 FIX APPLIED HERE: For Seoni district
    if (map && selectedDistrict && selectedState === "Madhya Pradesh" && selectedDistrict.name === "Seoni") {
        const plotLayerGroup = L.layerGroup().addTo(map);
        const bounds = L.latLngBounds();

        BALAGHAT_PLOTS.forEach(plot => {
            // L.polygon uses the 'coords' array (which is a 4-point box) and PLOT_POLYGON_STYLE
            const polygon = L.polygon(plot.coords, PLOT_POLYGON_STYLE)
                .on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    renderPlotDetails(plot); // Shows plot details on click
                    // Zoom to the clicked plot
                    map.fitBounds(e.target.getBounds(), { maxZoom: 16 });
                    // ✅ CRITICAL LINE 2: Set Plot and Show 3D for Seoni (Missing in original code)
                    setSelectedPlot(plot); 
                    setShow3D(true);
                })
                .on('mouseover', function () {
                    this.setStyle(PLOT_HOVER_STYLE);
                    this.bringToFront();
                })
                .on('mouseout', function () {
                    this.setStyle(PLOT_POLYGON_STYLE);
                })
                .addTo(plotLayerGroup);
            
            // setSelectedPlot(plot); // This line was outside the click handler and needed to be removed/moved
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
        if (sidebarRef.current) {
            sidebarRef.current.classList.remove("visible");
        }
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
            
            // 🌎 UPDATED BASE MAP TO ESRI WORLD IMAGERY (SATELLITE)
            L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution:
                        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                    maxZoom: 18,
                }
            ).addTo(map);

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
           {show3D && <Plot3DView
        plotData={selectedPlot}
        visible={show3D}
        onClose={() => setShow3D(false)}
      />}

            <div ref={mapRef} id="map" style={{ height: "100%", width: "100%" }} />
            <div
                ref={sidebarRef}
                id="sidebar"
                className="visible"
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: "480px",
                    height: "calc(100% - 20px)",
                    backgroundColor: "white",
                    padding: "24px",
                    boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                    overflowY: "auto",
                    transform: "translateX(0%)",
                    transition: "transform 0.3s ease-in-out",
                    borderRadius: "12px 0 0 12px",
                }}
            >
                <div
                    id="sidebar-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #e9ecef",
                        paddingBottom: "16px",
                        marginBottom: "16px"
                    }}
                >
                    <h3>
                        {selectedDistrict
                            ? `District Details`
                            : `State Summary`}
                    </h3>
                    <span
                        id="sidebar-close"
                        style={{ cursor: "pointer", fontSize: "24px", fontWeight: "bold" }}
                        onClick={() => sidebarRef.current.classList.remove("visible")}
                    >
                        &times;
                    </span>
                </div>

                {/* State Filter Dropdown */}
                <div style={{ marginBottom: "16px", marginTop: "8px" }}>
                    <label htmlFor="state-select" style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Select State:</label>
                    <select
                        id="state-select"
                        value={selectedState}
                        onChange={handleStateChange}
                        style={{ 
                            width: "100%", 
                            padding: "10px 12px", 
                            marginTop: "6px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px"
                        }}
                    >
                        {Object.keys(GEOJSON_URLS).map((stateName) => (
                            <option key={stateName} value={stateName}>
                                {stateName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District Filter Dropdown */}
                <div style={{ marginBottom: "16px" }}>
                    <label htmlFor="district-select" style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Select District (Optional):</label>
                    <select
                        id="district-select"
                        value={selectedDistrict ? selectedDistrict.name : ""}
                        onChange={handleDistrictSelect}
                        style={{ 
                            width: "100%", 
                            padding: "10px 12px", 
                            marginTop: "6px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px"
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

                <div ref={sidebarContentRef} id="sidebar-content">
                    <p>Loading data...</p>
                </div>
            </div>
            {/* Enhanced CSS styles for modern Asset Map UI */}
            <style>{`
                #sidebar.visible {
                    transform: translateX(0%);
                }

                /* Asset Analysis Header Styles */
                .asset-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    color: white;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .asset-title {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .asset-type-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                }

                /* Asset Statistics Section */
                .asset-stats-section {
                    margin-bottom: 20px;
                }

                .section-title {
                    color: #2c3e50;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
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
                    margin-bottom: 8px;
                }

                .stat-progress {
                    margin-top: 8px;
                }

                .progress-bar {
                    background: #e9ecef;
                    border-radius: 6px;
                    height: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 6px;
                    transition: width 0.5s ease;
                }

                .agricultural-progress {
                    background: linear-gradient(90deg, #28a745, #20c997);
                }

                .forest-progress {
                    background: linear-gradient(90deg, #2d5a27, #4a7c59);
                }

                .homestead-progress {
                    background: linear-gradient(90deg, #6f42c1, #e83e8c);
                }

                .water-progress {
                    background: linear-gradient(90deg, #17a2b8, #007bff);
                }

                /* Environment Section */
                .environment-section {
                    margin-bottom: 20px;
                }

                .environment-cards {
                    display: grid;
                    gap: 12px;
                }

                .environment-card {
                    background: white;
                    border-radius: 12px;
                    padding: 18px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border-left: 4px solid;
                    transition: transform 0.2s ease;
                }

                .environment-card:hover {
                    transform: translateX(4px);
                }

                .environment-card.mining {
                    border-left-color: #fd7e14;
                }

                .environment-card.water-stress {
                    border-left-color: #dc3545;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .card-icon {
                    font-size: 1.4rem;
                }

                .card-title {
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .card-content {
                    padding-left: 32px;
                }

                .impact-value {
                    color: #2c3e50;
                    font-size: 1.3rem;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 4px;
                }

                .impact-label {
                    color: #6c757d;
                    font-size: 0.8rem;
                }

                .stress-indicator {
                    margin-top: 8px;
                    background: #e9ecef;
                    height: 4px;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .stress-bar {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.5s ease;
                }

                /* Infrastructure Section */
                .infrastructure-section {
                    margin-bottom: 20px;
                }

                .infrastructure-grid {
                    display: grid;
                    gap: 16px;
                }

                .infrastructure-item {
                    background: white;
                    border-radius: 12px;
                    padding: 18px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                }

                .item-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .item-content {
                    flex: 1;
                }

                .item-label {
                    display: block;
                    color: #495057;
                    font-weight: 500;
                    font-size: 0.9rem;
                    margin-bottom: 8px;
                }

                .item-value {
                    color: #2c3e50;
                    font-weight: 700;
                    font-size: 0.95rem;
                }

                .eligibility-bar {
                    background: #e9ecef;
                    height: 6px;
                    border-radius: 3px;
                    margin: 8px 0;
                    overflow: hidden;
                }

                .eligibility-fill {
                    background: linear-gradient(90deg, #28a745, #20c997);
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                /* Chart Section */
                .chart-section {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e9ecef;
                }

                .chart-container {
                    margin-top: 16px;
                }
            `}</style>
        </div>
    );
};

export default AssestMap;