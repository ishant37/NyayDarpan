import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, useTheme, styled, Tooltip, Typography } from '@mui/material';
import { Map as MapIcon, Analytics, Terrain } from '@mui/icons-material';

// Import the different map components with their file extensions
import CadastrialMap from './Maps/CadastrialMap.jsx';
import AssestMap from './Maps/AssestMap.jsx';
import TopoGraphicalMap from './Maps/TopoGraphicalMap.jsx';

// Configuration for map types to keep the code clean and scalable
const mapOptions = [
  { id: 'cadastrial', label: 'Cadastrial Map', icon: <MapIcon />, component: <CadastrialMap /> },
  { id: 'asset', label: 'Asset Map', icon: <Analytics />, component: <AssestMap /> },
  { id: 'topographical', label: 'Topographical Map', icon: <Terrain />, component: <TopoGraphicalMap /> },
];

// Styled components for a custom, clean look
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: '30px',
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: '30px !important',
  border: 'none !important',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 4px 15px ${theme.palette.primary.main}50`,
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Map = () => {
  const [activeMap, setActiveMap] = useState('cadastrial');

  const handleMapChange = (event, newMap) => {
    // Prevent deselecting a button
    if (newMap !== null) {
      setActiveMap(newMap);
    }
  };
  
  // Find the component to render based on the active state
  const ActiveMapComponent = mapOptions.find(map => map.id === activeMap)?.component;

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Map Switcher Control at the top-center */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000, // Ensure it's above the map layers
        }}
      >
        <StyledToggleButtonGroup
          value={activeMap}
          exclusive
          onChange={handleMapChange}
          aria-label="map type"
        >
          {mapOptions.map((option) => (
            <Tooltip title={option.label} key={option.id} arrow>
              <StyledToggleButton value={option.id} aria-label={option.label}>
                {option.icon}
                <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  {option.label}
                </Typography>
              </StyledToggleButton>
            </Tooltip>
          ))}
        </StyledToggleButtonGroup>
      </Box>

      {/* Render the active map component, which will fill the container */}
      <Box sx={{ height: '100%', width: '100%' }}>
        {ActiveMapComponent}
      </Box>
    </Box>
  );
};

export default Map;

