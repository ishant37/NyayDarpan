import React, { useEffect, useRef } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Grid, Card, CardContent, List, ListItem, ListItemText, Divider } from "@mui/material";
import Chart from "chart.js/auto";

// Chart Component (for state/district summary)
const FraDoughnutChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["IFR Granted", "IFR Denied", "CFR Granted", "CFR Denied"],
                datasets: [{
                    data: [ data.totalIFRGranted, data.totalIFRFiled - data.totalIFRGranted, data.totalCFRGranted, data.totalCFRFiled - data.totalCFRGranted ],
                    backgroundColor: [ 'rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)', 'rgba(33, 150, 243, 0.8)', 'rgba(255, 235, 59, 0.8)' ],
                    borderColor: [ '#fff' ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, font: { size: 11 } } },
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        };
    }, [data]);

    return <canvas ref={chartRef} style={{ maxHeight: '200px' }}></canvas>;
};

// State/District Summary Component
const StateSummary = ({ name, data }) => (
    <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{name}</Typography>
        <Grid container spacing={2}>
            <Grid item xs={6}><SummaryCard icon="🌾" value={`${data.totalAgriculturalArea} km²`} label="Agricultural Area" /></Grid>
            <Grid item xs={6}><SummaryCard icon="🌲" value={`${(data.forestCoverIndex * 100).toFixed(1)}%`} label="Forest Cover" /></Grid>
            <Grid item xs={6}><SummaryCard icon="💧" value={data.waterBodyCount} label="Water Bodies" /></Grid>
            <Grid item xs={6}><SummaryCard icon="🏠" value={`${data.homesteadsBuiltUpArea} km²`} label="Built-up Area" /></Grid>
        </Grid>
        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
             <Typography variant="subtitle1" fontWeight="600" align="center" gutterBottom>Rights Analysis</Typography>
             <Box sx={{ height: 220 }}>
                <FraDoughnutChart data={data} />
             </Box>
        </Paper>
    </Box>
);

// Plot Details Component
const PlotDetails = ({ plot }) => (
    <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{plot.village_nam}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>Plot ID: {plot.plot_id}</Typography>
        <List dense>
            <DetailItem primary="Tenant Name" secondary={plot.tenant_name} />
            <Divider component="li" />
            <DetailItem primary="Khasra No" secondary={plot.kha_no} />
            <Divider component="li" />
            <DetailItem primary="Land Area" secondary={plot.Land_Area} />
            <Divider component="li" />
            <DetailItem primary="Land Type" secondary={plot.Land_type} />
            <Divider component="li" />
            <DetailItem primary="Rent/Cess" secondary={plot.Rent_Cess} />
            <Divider component="li" />
            <DetailItem primary="Last Updated" secondary={plot.Last_Published_Date} />
        </List>
    </Box>
);

// Helper components for UI
const SummaryCard = ({ icon, value, label }) => (
    <Card variant="outlined">
        <CardContent sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2rem' }}>{icon}</Typography>
            <Typography variant="h6" fontWeight="bold">{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </CardContent>
    </Card>
);

const DetailItem = ({ primary, secondary }) => (
    <ListItem sx={{ py: 1.5 }}>
        <ListItemText
            primary={primary}
            secondary={secondary}
            primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
            secondaryTypographyProps={{ color: 'text.primary', fontWeight: '500', variant: 'body1' }}
        />
    </ListItem>
);


const AssetSidebar = ({ selectedState, onStateChange, districts, selectedDistrictName, onDistrictChange, content }) => {
    return (
        <Paper
            elevation={4}
            sx={{
                width: 380,
                height: '100%',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                boxSizing: 'border-box'
            }}
        >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Asset & Rights Explorer</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>State</InputLabel>
                <Select
                    value={selectedState}
                    label="State"
                    onChange={(e) => onStateChange(e.target.value)}
                >
                    <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
                    <MenuItem value="Odisha">Odisha</MenuItem>
                    <MenuItem value="Telangana">Telangana</MenuItem>
                    <MenuItem value="Tripura">Tripura</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth disabled={districts.length === 0}>
                <InputLabel>District</InputLabel>
                <Select
                    value={selectedDistrictName || ""}
                    label="District"
                    onChange={(e) => onDistrictChange(e.target.value)}
                >
                    <MenuItem value=""><em>-- State Summary --</em></MenuItem>
                    {districts.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />

            {/* Content Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '0.4em' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,.1)', borderRadius: 2 } }}>
                {content?.type === 'state' && <StateSummary name={content.name} data={content.data} />}
                {content?.type === 'district' && <StateSummary name={content.name} data={content.data} />}
                {content?.type === 'plot' && <PlotDetails plot={content.data} />}
            </Box>
        </Paper>
    );
};

export default AssetSidebar;
