import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  People,
  CheckCircle,
  AccessTime,
  LocationOn,
  Forest,
  Download,
  Map as MapIcon,
  ViewList
} from '@mui/icons-material';
import { allStatesData } from "../data/allStatesData";
import { DonutChart } from "../components/charts/DonutChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// A safe initial state to prevent render errors
const getInitialStateData = (stateKey) => {
    return allStatesData[stateKey] || {
        totalPattas: 0,
        recentPattas: 0,
        pendingVerification: 0,
        cfrAreaHa: 0, // **FIX: Ensure cfrAreaHa always has a default value**
        districts: [], 
        monthlyData: []
    };
};

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("madhya-pradesh");
  
  const [dashboardData, setDashboardData] = useState(() => getInitialStateData(selectedState));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        setDashboardData(getInitialStateData(selectedState));
        setLoading(false);
    }, 300);
  }, [selectedState]);

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Data for the Stats Cards. Using optional chaining (`?.`) and default values (`|| 0`) for extra safety.
  const statsData = [
    { title: "Total Pattas", value: dashboardData.totalPattas || 0, icon: <People />, color: theme.palette.primary.main },
    { title: "Recent Pattas", value: dashboardData.recentPattas || 0, icon: <CheckCircle />, color: theme.palette.success.main },
    { title: "Pending Verification", value: dashboardData.pendingVerification || 0, icon: <AccessTime />, color: theme.palette.warning.main },
    { title: "Districts Covered", value: dashboardData.districts?.length || 0, icon: <LocationOn />, color: theme.palette.info.main },
    { title: "CFR Area", value: `${(dashboardData.cfrAreaHa || 0).toLocaleString()} ha`, icon: <Forest />, color: '#2e7d32' },
  ];

  // Data for the Donut Chart
  const claimsData = [
    { name: "Approved", value: (dashboardData.totalPattas || 0) - (dashboardData.pendingVerification || 0), color: theme.palette.success.main },
    { name: "Pending", value: dashboardData.pendingVerification || 0, color: theme.palette.warning.main },
    { name: "Rejected", value: Math.floor((dashboardData.totalPattas || 0) * 0.15), color: theme.palette.error.main },
  ];
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            FRA Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Displaying data for: <span style={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{selectedState.replace('-', ' ').toUpperCase()}</span>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <FormControl size="small" fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>State</InputLabel>
            <Select value={selectedState} label="State" onChange={handleStateChange}>
              <MenuItem value="madhya-pradesh">Madhya Pradesh</MenuItem>
              <MenuItem value="telangana">Telangana</MenuItem>
              <MenuItem value="rajasthan">Rajasthan</MenuItem>
              <MenuItem value="odisha">Odisha</MenuItem>
              <MenuItem value="tripura">Tripura</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Download />} sx={{ textTransform: 'none' }}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 48, height: 48 }}>{stat.icon}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: '400px', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>Claims Distribution</Typography>
            <Box sx={{ height: '320px' }}>
              <DonutChart data={claimsData} centerLabel="Total" centerValue={(dashboardData.totalPattas || 0).toString()} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: '400px', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>Monthly Processing Trend</Typography>
            <Box sx={{ height: '320px', mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} style={{ fontSize: "12px" }} />
                  <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="approved" stroke={theme.palette.success.main} strokeWidth={2} name="Approved" dot={false} />
                  <Line type="monotone" dataKey="pending" stroke={theme.palette.warning.main} strokeWidth={2} name="Pending" dot={false} />
                  <Line type="monotone" dataKey="rejected" stroke={theme.palette.error.main} strokeWidth={2} name="Rejected" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* District Summary */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          District-wise Summary
        </Typography>
        <Grid container spacing={3}>
          {dashboardData.districts.map((district) => (
            <Grid item xs={12} sm={6} md={4} key={district.name}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    {district.name}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ my: 1 }}>
                    {district.pattas.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pattas Issued
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <Button size="small" startIcon={<ViewList />} onClick={() => navigate('/pattas')}>View Pattas</Button>
                  <Button size="small" variant="contained" startIcon={<MapIcon />} onClick={() => navigate('/atlas')}>View Map</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}