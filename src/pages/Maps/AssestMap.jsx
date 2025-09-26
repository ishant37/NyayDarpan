import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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


    // --- District/State Details Renderer (UPDATED) ---

    const renderDataAndChart = useCallback((name, data) => {
        const sidebar = sidebarRef.current;
        const sidebarContent = sidebarContentRef.current;
        if (!sidebar || !sidebarContent) return;

        sidebarContent.innerHTML = "";

        const isDistrictSelected = !!selectedDistrict;
        const primaryName = isDistrictSelected ? selectedDistrict.name : selectedState;
        
        // Use the new asset data if available, otherwise use default random stats
        const {
            totalAgriculturalArea, forestCoverIndex, homesteadsBuiltUpArea,
            waterBodyCount, miningNonForestUse, waterStressIndex,
            schemeEligibilityRatio, connectivityRoadProximity,
            totalIFRFiled, totalIFRGranted, totalCFRFiled, totalCFRGranted
        } = data;
        
        const titleText = isDistrictSelected ? `District Assets: ${primaryName}` : `State Summary: ${primaryName}`;

        sidebarContent.innerHTML = `
            <div class="info-entry"><p><b>--- ${titleText} ---</b></p></div>
            ${isDistrictSelected ? '' : `<div class="info-entry"><p><b>State Level Data Shown</b></p></div>`}
            <div class="info-entry"><p><b>Total Agricultural Area:</b> ${totalAgriculturalArea} sq km</p></div>
            <div class="info-entry"><p><b>Forest Cover Index (FCI):</b> ${forestCoverIndex}</p></div>
            <div class="info-entry"><p><b>Homesteads / Built-Up Area:</b> ${homesteadsBuiltUpArea} sq km</p></div>
            <div class="info-entry"><p><b>Water Body Count (Major):</b> ${waterBodyCount}</p></div>
            <div class="info-entry"><p><b>Mining/Non-Forest Use:</b> ${miningNonForestUse} sq km</p></div>
            <div class="info-entry"><p><b>Water Stress Index (WSI):</b> ${waterStressIndex}</p></div>
            <div class="info-entry"><p><b>Scheme Eligibility Ratio:</b> ${schemeEligibilityRatio}</p></div>
            <div class="info-entry"><p><b>Connectivity/Road Proximity:</b> ${connectivityRoadProximity} km</p></div>
            <canvas id="fraChart"></canvas>
        `;

        sidebar.classList.add("visible");

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Chart remains focused on FRA metrics, using the (hidden) random FRA data
        const ctx = document.getElementById("fraChart").getContext("2d");
        chartRef.current = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["IFR Granted", "IFR Denied", "CFR Granted", "CFR Denied"],
                datasets: [
                    {
                        data: [
                            totalIFRGranted,
                            totalIFRFiled - totalIFRGranted,
                            totalCFRGranted,
                            totalCFRFiled - totalCFRGranted,
                        ],
                        backgroundColor: ["#4caf50", "#f44336", "#2196f3", "#ffeb3b"],
                        borderColor: ["#388e3c", "#d32f2f", "#1976d2", "#fbc02d"],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                let label = tooltipItem.label || "";
                                if (label) label += ": ";
                                label += tooltipItem.raw;
                                return label;
                            },
                        },
                    },
                },
            },
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
                        renderPlotDetails(plot); // Shows plot details on click
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
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            <div ref={mapRef} id="map" style={{ height: "100%", width: "100%" }} />
            <div
                ref={sidebarRef}
                id="sidebar"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "350px",
                    height: "100%",
                    backgroundColor: "white",
                    padding: "20px",
                    boxShadow: "-2px 0 5px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                    overflowY: "auto",
                    transform: "translateX(100%)",
                    transition: "transform 0.3s ease-in-out",
                }}
            >
                <div
                    id="sidebar-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "10px",
                        marginBottom: "10px"
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
                <div style={{ marginBottom: "20px", marginTop: "10px" }}>
                    <label htmlFor="state-select">Select State:</label>
                    <select
                        id="state-select"
                        value={selectedState}
                        onChange={handleStateChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    >
                        {Object.keys(GEOJSON_URLS).map((stateName) => (
                            <option key={stateName} value={stateName}>
                                {stateName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District Filter Dropdown */}
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="district-select">Select District (Optional):</label>
                    <select
                        id="district-select"
                        value={selectedDistrict ? selectedDistrict.name : ""}
                        onChange={handleDistrictSelect}
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
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
            {/* Inline style for .visible class (required for sidebar animation) */}
            <style>{`
                #sidebar.visible {
                    transform: translateX(0%);
                }
            `}</style>
        </div>
    );
};

export default AssestMap;