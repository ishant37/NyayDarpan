import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  List, 
  ListItem, 
  ListItemText,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  Visibility,
  Download,
  MyLocation,
  ZoomIn,
  ZoomOut,
  FullscreenOutlined
} from '@mui/icons-material';
import { sampleFraData } from '../data/fraData';

// Madhya Pradesh Districts with accurate coordinates
const mpDistrictsCoordinates = {
  'Agar Malwa': { lat: 23.7106, lng: 76.0173 },
  'Alirajpur': { lat: 22.3134, lng: 74.3656 },
  'Anuppur': { lat: 23.1040, lng: 81.6914 },
  'Ashoknagar': { lat: 24.5730, lng: 77.7320 },
  'Balaghat': { lat: 21.8088, lng: 80.1801 },
  'Barwani': { lat: 22.0323, lng: 74.9006 },
  'Betul': { lat: 21.9018, lng: 77.9026 },
  'Bhind': { lat: 26.5644, lng: 78.7785 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Burhanpur': { lat: 21.3009, lng: 76.2291 },
  'Chhatarpur': { lat: 24.9177, lng: 79.5941 },
  'Chhindwara': { lat: 22.0572, lng: 78.9385 },
  'Damoh': { lat: 23.8371, lng: 79.4419 },
  'Datia': { lat: 25.6672, lng: 78.4611 },
  'Dewas': { lat: 22.9659, lng: 76.0534 },
  'Dhar': { lat: 22.5973, lng: 75.2979 },
  'Dindori': { lat: 22.9419, lng: 81.0814 },
  'Guna': { lat: 24.6475, lng: 77.3116 },
  'Gwalior': { lat: 26.2183, lng: 78.1828 },
  'Harda': { lat: 22.3442, lng: 77.0959 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Jabalpur': { lat: 23.1815, lng: 79.9864 },
  'Jhabua': { lat: 22.7676, lng: 74.5976 },
  'Katni': { lat: 23.8346, lng: 80.3956 },
  'Khandwa': { lat: 21.8343, lng: 76.3534 },
  'Khargone': { lat: 21.8235, lng: 75.6136 },
  'Mandla': { lat: 22.5985, lng: 80.3713 },
  'Mandsaur': { lat: 24.0768, lng: 75.0689 },
  'Morena': { lat: 26.5009, lng: 78.0022 },
  'Narmadapuram': { lat: 22.7696, lng: 77.4381 },
  'Narsinghpur': { lat: 22.9673, lng: 79.1943 },
  'Neemuch': { lat: 24.4709, lng: 74.8694 },
  'Niwari': { lat: 25.0587, lng: 79.0108 },
  'Panna': { lat: 24.7215, lng: 80.1947 },
  'Raisen': { lat: 23.3315, lng: 77.7849 },
  'Rajgarh': { lat: 24.0073, lng: 76.7275 },
  'Ratlam': { lat: 23.3315, lng: 75.0367 },
  'Rewa': { lat: 24.5355, lng: 81.2961 },
  'Sagar': { lat: 23.8388, lng: 78.7378 },
  'Satna': { lat: 24.5708, lng: 80.8322 },
  'Sehore': { lat: 23.2017, lng: 77.0854 },
  'Seoni': { lat: 22.0859, lng: 79.5431 },
  'Shahdol': { lat: 23.2901, lng: 81.3609 },
  'Shajapur': { lat: 23.4267, lng: 76.2734 },
  'Sheopur': { lat: 25.6692, lng: 76.6959 },
  'Shivpuri': { lat: 25.4238, lng: 77.6581 },
  'Sidhi': { lat: 24.4086, lng: 81.8936 },
  'Singrauli': { lat: 24.1997, lng: 82.6739 },
  'Tikamgarh': { lat: 24.7413, lng: 78.8329 },
  'Ujjain': { lat: 23.1765, lng: 75.7885 },
  'Umaria': { lat: 23.5219, lng: 80.8367 },
  'Vidisha': { lat: 23.5251, lng: 77.8081 }
};

// Map districts from Hindi to English for coordinate lookup
const districtMapping = {
  'सीहोर': 'Sehore',
  'गुना': 'Guna', 
  'रायसेन': 'Raisen',
  'इंदौर': 'Indore',
  'भोपाल': 'Bhopal',
  'जबलपुर': 'Jabalpur',
  'ग्वालियर': 'Gwalior',
  'उज्जैन': 'Ujjain'
};

// Function to generate colors based on area
function getPattalandColor(index, area) {
  if (area < 2000) return '#4CAF50'; // Green for small areas
  if (area < 5000) return '#2196F3'; // Blue for medium areas  
  if (area < 10000) return '#FF9800'; // Orange for large areas
  return '#9C27B0'; // Purple for very large areas
}

// Enhanced FRA data with proper coordinates
const enhancedFraData = sampleFraData.map((item, index) => {
  const englishDistrict = districtMapping[item.DISTRICT] || 'Bhopal';
  const baseCoord = mpDistrictsCoordinates[englishDistrict] || mpDistrictsCoordinates['Bhopal'];
  
  // Add some variation to avoid overlapping
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;
  
  return {
    ...item,
    lat: baseCoord.lat + latOffset,
    lng: baseCoord.lng + lngOffset,
    englishDistrict,
    area_hectares: (parseInt(item.TOTAL_AREA_SQFT) * 0.092903 / 10000).toFixed(2),
    color: getPattalandColor(index, parseInt(item.TOTAL_AREA_SQFT))
  };
});

const PattaAtlasView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showPattaLabels, setShowPattaLabels] = useState(true);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(7);

  const uniqueDistricts = useMemo(() => 
    [...new Set(enhancedFraData.map(item => item.DISTRICT))], []
  );
  
  const filteredData = useMemo(() => {
    return enhancedFraData.filter(item => {
      const matchesSearch = 
        item.HOLDER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.FATHER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict = !selectedDistrict || item.DISTRICT === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }, [searchTerm, selectedDistrict]);

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    if (filteredData.length === 0) return { minLat: 21, maxLat: 27, minLng: 74, maxLng: 83 };
    
    const lats = filteredData.map(item => item.lat);
    const lngs = filteredData.map(item => item.lng);
    
    return {
      minLat: Math.min(...lats) - 0.1,
      maxLat: Math.max(...lats) + 0.1,
      minLng: Math.min(...lngs) - 0.1,
      maxLng: Math.max(...lngs) + 0.1
    };
  }, [filteredData]);

  // Generate land squares based on area
  const generateLandSquare = (patta, mapWidth, mapHeight) => {
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    
    // Convert lat/lng to pixel coordinates
    const x = ((patta.lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = ((maxLat - patta.lat) / (maxLat - minLat)) * mapHeight;
    
    // Calculate square size based on area (minimum 8px, maximum 40px)
    const area = parseInt(patta.TOTAL_AREA_SQFT);
    const size = Math.max(8, Math.min(40, Math.sqrt(area) / 50));
    
    return {
      x: x - size/2,
      y: y - size/2,
      size,
      patta
    };
  };

  const handlePattaClick = (patta) => {
    setSelectedPatta(patta);
  };

  const MapControls = () => (
    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
      <Paper elevation={3} sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton 
            size="small" 
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 12))}
          >
            <ZoomIn />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton 
            size="small" 
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 5))}
          >
            <ZoomOut />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center Map">
          <IconButton size="small">
            <MyLocation />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton size="small">
            <FullscreenOutlined />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' }}>
      
      {/* Filter Panel */}
      <Paper 
        elevation={3} 
        sx={{ 
          width: '350px', 
          p: 2, 
          zIndex: 1000, 
          overflowY: 'auto',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
          🗺️ Madhya Pradesh FRA Map
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Typography variant="caption" sx={{ color: 'white' }}>
            Interactive map showing {filteredData.length} patta lands as colored squares
          </Typography>
        </Alert>

        {/* Search and Filters */}
        <TextField
          label="Search by Holder Name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            }
          }}
          InputProps={{ 
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
          }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: 'white' }}>District</InputLabel>
          <Select
            value={selectedDistrict}
            label="District"
            onChange={(e) => setSelectedDistrict(e.target.value)}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              '& .MuiSelect-select': { color: 'black' }
            }}
          >
            <MenuItem value=""><em>All Districts</em></MenuItem>
            {uniqueDistricts.map(district => (
              <MenuItem key={district} value={district}>{district}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Map View Controls */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
          Map Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={showPattaLabels}
              onChange={(e) => setShowPattaLabels(e.target.checked)}
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'white',
                },
              }}
            />
          }
          label="Show Patta Labels"
          sx={{ color: 'white', mb: 2 }}
        />

        {/* Statistics */}
        <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
              📊 Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="h4" sx={{ color: '#4CAF50', textAlign: 'center' }}>
                  {filteredData.length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', display: 'block' }}>
                  Total Pattas
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" sx={{ color: '#FF9800', textAlign: 'center' }}>
                  {uniqueDistricts.length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', display: 'block' }}>
                  Districts
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Patta List */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
          Patta Lands ({filteredData.length})
        </Typography>
        
        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          <List dense>
            {filteredData.slice(0, 50).map(patta => (
              <ListItem 
                key={patta.id} 
                divider
                sx={{ 
                  backgroundColor: selectedPatta?.id === patta.id 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => handlePattaClick(patta)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: patta.color,
                      borderRadius: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <ListItemText
                    primary={patta.HOLDER_NAME}
                    secondary={`${patta.DISTRICT} • ${patta.area_hectares} ha`}
                    primaryTypographyProps={{ 
                      fontWeight: 600,
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                    secondaryTypographyProps={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.8rem'
                    }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
          
          {filteredData.length > 50 && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', p: 2 }}>
              Showing first 50 of {filteredData.length} pattas
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Map Container */}
      <Box sx={{ flexGrow: 1, position: 'relative', backgroundColor: '#f5f5f5' }}>
        <MapControls />
        
        {/* SVG Map */}
        <svg
          width="100%"
          height="100%"
          style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            cursor: 'grab'
          }}
          viewBox="0 0 800 600"
        >
          {/* Map Background */}
          <defs>
            <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          
          {/* MP State Boundary (Simplified) */}
          <rect 
            x="50" 
            y="50" 
            width="700" 
            height="500" 
            fill="none" 
            stroke="#2196F3" 
            strokeWidth="3"
            strokeDasharray="10,5"
            rx="20"
          />
          
          {/* State Label */}
          <text 
            x="400" 
            y="80" 
            textAnchor="middle" 
            fill="#1976D2" 
            fontSize="24"
            fontWeight="bold"
          >
            मध्य प्रदेश (Madhya Pradesh)
          </text>
          
          {/* Major Cities */}
          {['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'].map((city, index) => {
            const positions = [
              { x: 400, y: 300 }, // Bhopal (center)
              { x: 250, y: 350 }, // Indore
              { x: 550, y: 250 }, // Jabalpur
              { x: 600, y: 150 }  // Gwalior
            ];
            return (
              <g key={city}>
                <circle 
                  cx={positions[index].x} 
                  cy={positions[index].y} 
                  r="8" 
                  fill="#FF5722"
                  stroke="white"
                  strokeWidth="2"
                />
                <text 
                  x={positions[index].x} 
                  y={positions[index].y - 15} 
                  textAnchor="middle" 
                  fill="#333"
                  fontSize="12"
                  fontWeight="600"
                >
                  {city}
                </text>
              </g>
            );
          })}
          
          {/* Patta Land Squares */}
          {filteredData.map(patta => {
            const square = generateLandSquare(patta, 800, 600);
            return (
              <g key={patta.id}>
                <rect
                  x={square.x}
                  y={square.y}
                  width={square.size}
                  height={square.size}
                  fill={patta.color}
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.8"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePattaClick(patta)}
                  onMouseEnter={(e) => {
                    e.target.setAttribute('opacity', '1');
                    e.target.setAttribute('stroke-width', '2');
                  }}
                  onMouseLeave={(e) => {
                    e.target.setAttribute('opacity', '0.8');
                    e.target.setAttribute('stroke-width', '1');
                  }}
                />
                
                {showPattaLabels && square.size > 15 && (
                  <text
                    x={square.x + square.size/2}
                    y={square.y + square.size/2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {patta.id.slice(-3)}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(50, 450)">
            <rect x="0" y="0" width="200" height="120" fill="rgba(255,255,255,0.9)" stroke="#ccc" rx="5"/>
            <text x="10" y="20" fill="#333" fontSize="14" fontWeight="bold">Legend</text>
            
            {[
              { color: '#4CAF50', label: '< 2000 sq.ft', size: 12 },
              { color: '#2196F3', label: '2000-5000 sq.ft', size: 14 },
              { color: '#FF9800', label: '5000-10000 sq.ft', size: 16 },
              { color: '#9C27B0', label: '> 10000 sq.ft', size: 18 }
            ].map((item, index) => (
              <g key={index} transform={`translate(10, ${35 + index * 20})`}>
                <rect width={item.size} height={item.size} fill={item.color} stroke="white"/>
                <text x="25" y="12" fill="#333" fontSize="11">{item.label}</text>
              </g>
            ))}
          </g>
        </svg>
        
        {/* Selected Patta Details */}
        {selectedPatta && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              p: 2,
              minWidth: 300,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h6" sx={{ color: selectedPatta.color, mb: 1 }}>
              📋 {selectedPatta.HOLDER_NAME}
            </Typography>
            <Grid container spacing={1} sx={{ fontSize: '0.9rem' }}>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>ID:</strong> {selectedPatta.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>District:</strong> {selectedPatta.DISTRICT}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Area:</strong> {selectedPatta.TOTAL_AREA_SQFT} sq.ft</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Hectares:</strong> {selectedPatta.area_hectares} ha</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Father:</strong> {selectedPatta.FATHER_NAME}</Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<Visibility />}>
                View Details
              </Button>
              <Button size="small" variant="contained" startIcon={<Download />}>
                Download PDF
              </Button>
              <Button size="small" onClick={() => setSelectedPatta(null)}>
                Close
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default PattaAtlasView;