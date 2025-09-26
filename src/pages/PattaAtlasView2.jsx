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
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  Visibility,
  Download,
  Map as MapIcon,
  MyLocation
} from '@mui/icons-material';
import { sampleFraData } from '../data/fraData';

// Enhanced mock data with coordinates
const enrichedFraData = sampleFraData.map(item => {
  const mockCoordinates = {
    'सीहोर': { lat: 23.20, lng: 77.08, region: 'Central MP' },
    'गुना': { lat: 24.64, lng: 77.31, region: 'Northern MP' },
    'रायसेन': { lat: 23.33, lng: 77.78, region: 'Central MP' }
  };
  
  const baseCoord = mockCoordinates[item.DISTRICT] || { lat: 23.5, lng: 77.5, region: 'Madhya Pradesh' };
  const latOffset = (Math.random() - 0.5) * 0.2;
  const lngOffset = (Math.random() - 0.5) * 0.2;
  
  return {
    ...item,
    lat: baseCoord.lat + latOffset,
    lng: baseCoord.lng + lngOffset,
    region: baseCoord.region,
    area_hectares: (parseInt(item.TOTAL_AREA_SQFT) * 0.092903 / 10000).toFixed(2),
    coordinates_display: (baseCoord.lat + latOffset).toFixed(4) + '°N, ' + (baseCoord.lng + lngOffset).toFixed(4) + '°E'
  };
});

const PattaAtlasView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [viewMode, setViewMode] = useState('map');

  // Filter Logic
  const filteredData = useMemo(() => {
    return enrichedFraData.filter(item => {
      const matchesSearch = !searchTerm || 
        item.PATTA_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.BENEFICIARY_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.VILLAGE?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistrict = !selectedDistrict || item.DISTRICT === selectedDistrict;
      const matchesRegion = !selectedRegion || item.region === selectedRegion;
      
      return matchesSearch && matchesDistrict && matchesRegion;
    });
  }, [searchTerm, selectedDistrict, selectedRegion]);

  // Get unique values for filters
  const districts = [...new Set(enrichedFraData.map(item => item.DISTRICT))].sort();
  const regions = [...new Set(enrichedFraData.map(item => item.region))].sort();

  // Focus on selected patta
  const focusOnPatta = (patta) => {
    setSelectedPatta(patta);
    setViewMode('map');
  };

  // Map Component (Simplified for better compatibility)
  const MapView = () => (
    <Box sx={{ 
      height: '600px', 
      width: '100%', 
      background: 'linear-gradient(45deg, #e3f2fd, #f3e5f5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      border: '2px solid #1976d2',
      borderRadius: 2,
      position: 'relative'
    }}>
      <MapIcon sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
      <Typography variant="h6" color="primary" gutterBottom>
        FRA Patta Geographic Atlas
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Interactive map view showing {filteredData.length} patta locations
      </Typography>
      
      {selectedPatta && (
        <Card sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          maxWidth: 300,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {selectedPatta.PATTA_NUMBER}
            </Typography>
            <Typography variant="body2">
              Beneficiary: {selectedPatta.BENEFICIARY_NAME}
            </Typography>
            <Typography variant="body2">
              Village: {selectedPatta.VILLAGE}
            </Typography>
            <Typography variant="body2">
              Area: {selectedPatta.area_hectares} hectares
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              📍 {selectedPatta.coordinates_display}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📍 FRA Patta Geographic Atlas
        </Typography>
        <Typography variant="subtitle1">
          Interactive geographical view of Forest Rights Act patta locations across Madhya Pradesh
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Total Pattas: {enrichedFraData.length} | Showing: {filteredData.length}
        </Typography>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant={viewMode === 'map' ? 'contained' : 'outlined'}
          startIcon={<MapIcon />}
          onClick={() => setViewMode('map')}
          sx={{ mr: 2 }}
        >
          Map View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'contained' : 'outlined'}
          startIcon={<Search />}
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🔍 Search & Filters
            </Typography>
            
            <TextField
              fullWidth
              label="Search Pattas"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Patta number, beneficiary, village..."
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>District</InputLabel>
              <Select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                label="District"
              >
                <MenuItem value="">All Districts</MenuItem>
                {districts.map(district => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                label="Region"
              >
                <MenuItem value="">All Regions</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                📊 Filter Results
              </Typography>
              <Typography variant="body2">
                Showing: <strong>{filteredData.length}</strong> pattas
              </Typography>
              <Typography variant="body2">
                Total Area: <strong>{filteredData.reduce((sum, item) => sum + parseFloat(item.area_hectares), 0).toFixed(2)}</strong> hectares
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          {viewMode === 'map' ? (
            <Paper elevation={2} sx={{ p: 2 }}>
              <MapView />
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 Patta Listings ({filteredData.length})
              </Typography>
              <List>
                {filteredData.map((patta, index) => (
                  <ListItem 
                    key={patta.PATTA_NUMBER + '-' + index}
                    sx={{ 
                      mb: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => focusOnPatta(patta)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" color="primary">
                            {patta.PATTA_NUMBER}
                          </Typography>
                          <Chip 
                            icon={<LocationOn />} 
                            label={patta.DISTRICT} 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                          />
                          <Chip 
                            label={patta.area_hectares + ' ha'} 
                            size="small" 
                            color="secondary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Beneficiary:</strong> {patta.BENEFICIARY_NAME}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Village:</strong> {patta.VILLAGE} | <strong>Region:</strong> {patta.region}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {patta.coordinates_display}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Tooltip title="View on Map">
                        <IconButton 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            focusOnPatta(patta);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Details">
                        <IconButton color="secondary">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This geographic atlas provides visual representation of FRA patta locations. 
          Coordinate data is generated for demonstration purposes. In production, actual GPS coordinates 
          would be integrated with the survey data.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PattaAtlasView;