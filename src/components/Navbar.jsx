import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Map,
  DocumentScanner,
  Psychology,
  Settings,
  Logout,
  Menu,
  Notifications,
  Forest,
  PlaylistAdd,
} from "@mui/icons-material";

// Original max width for the expanded state
const MAX_DRAWER_WIDTH = 280;
// New min width for the collapsed state
const MIN_DRAWER_WIDTH = 70;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(MIN_DRAWER_WIDTH);
  const location = useLocation();

  const isMinimized = drawerWidth === MIN_DRAWER_WIDTH;

  const getLoggedInUser = () => {
    const userData = localStorage.getItem('loggedInUser');
    return userData ? JSON.parse(userData) : { username: 'Guest', displayName: 'Guest User', role: 'Role' };
  };

  const loggedInUser = getLoggedInUser();

  const handleLogout = () => {
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('loggedInUser');
    window.location.reload();
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Dashboard />, color: "#34d399" },
    { path: "/atlas", label: "Atlas", icon: <Map />, color: "#60a5fa" },
    { path: "/scandoc", label: "Scan Document", icon: <DocumentScanner />, color: "#f472b6" },
    { path: "/dss", label: "Decision Support", icon: <Psychology />, color: "#fbbf24" },
    { path: "/apply-claim", label: "Apply for Claim", icon: <PlaylistAdd />, color: "#c084fc" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMouseEnter = () => {
    setDrawerWidth(MAX_DRAWER_WIDTH);
  };

  const handleMouseLeave = () => {
    setDrawerWidth(MIN_DRAWER_WIDTH);
  };

  /**
   * Helper component to apply smooth visibility transition to text
   * The text is always in the DOM, preventing height/alignment jumps.
   */
  const SmoothText = ({ children }) => (
    <Box
      sx={{
        // Use opacity and width/overflow to smoothly hide/show the text
        opacity: isMinimized ? 0 : 1,
        width: isMinimized ? 0 : 'auto',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.2s ease-in-out, width 0.3s ease-in-out 0.1s',
        display: 'flex', // Ensure the text content maintains flex alignment
        alignItems: 'center',
        ml: isMinimized ? 0 : 1, // Optional: adjust margin when expanded
      }}
    >
      {children}
    </Box>
  );

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
        color: "#e2e8f0",
      }}
    >
      {/* Logo Section - MODIFIED TO BE A CLICKABLE LINK TO THE ROOT ROUTE ("/") */}
      <Box
        component={Link} // Use Link component here
        to="/" // Directs to the Dashboard
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: isMinimized ? 'center' : 'flex-start',
          gap: 2,
          textDecoration: 'none', // Remove link underline
          color: 'inherit', // Keep text color
          cursor: 'pointer', // Ensure it looks clickable
          // Add a slight hover effect for better UX
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        <Forest sx={{ fontSize: 40, color: "#34d399" }} />
        <SmoothText>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#fff",
                letterSpacing: "0.5px",
              }}
            >
              FRA Portal
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontSize: "11px",
              }}
            >
              Forest Rights Management
            </Typography>
          </Box>
        </SmoothText>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: isMinimized ? 0 : 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1, justifyContent: isMinimized ? 'center' : 'flex-start' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                // Center button content when minimized
                sx={{
                  borderRadius: "12px",
                  py: 1.2,
                  justifyContent: isMinimized ? 'center' : 'flex-start',
                  // Ensure button takes full width when expanded for border
                  width: '100%',
                  backgroundColor: active ? "rgba(74, 222, 128, 0.1)" : "transparent",
                  borderLeft: active ? `4px solid ${item.color}` : "4px solid transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? item.color : "#94a3b8",
                    // Fix minWidth to prevent icon shift
                    minWidth: MIN_DRAWER_WIDTH - 48, // e.g., 32px for icon centering
                    filter: active ? `drop-shadow(0 0 5px ${item.color}60)` : "none",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {/* Use ListItemText, but hide the primary text content smoothly with CSS */}
                <ListItemText
                  primary={item.label}
                  sx={{
                    // Style the entire text container for smooth transition
                    opacity: isMinimized ? 0 : 1,
                    width: isMinimized ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s ease-in-out, width 0.3s ease-in-out 0.1s',
                    "& .MuiListItemText-primary": {
                      color: active ? "#fff" : "#e2e8f0",
                      fontWeight: active ? 600 : 500,
                      fontSize: "15px",
                      whiteSpace: 'nowrap', // Prevent wrapping
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Actions Section - Adjust for minimization */}
      <Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: isMinimized ? 0 : 2 }} />
        <List sx={{ px: isMinimized ? 0 : 2, py: 2 }}>
          {/* Settings and Logout Buttons */}
          {[
            { label: 'Settings', icon: <Settings />, path: '/settings' },
            { label: 'Logout', icon: <Logout />, onClick: handleLogout }
          ].map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1, justifyContent: isMinimized ? 'center' : 'flex-start' }}>
              <ListItemButton
                component={item.path ? Link : 'div'}
                to={item.path}
                onClick={item.onClick}
                sx={{
                  borderRadius: "12px",
                  justifyContent: isMinimized ? 'center' : 'flex-start',
                  width: '100%',
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" }
                }}
              >
                <ListItemIcon sx={{ color: "#94a3b8", minWidth: MIN_DRAWER_WIDTH - 48 }}>{item.icon}</ListItemIcon>

                {/* Use ListItemText for action items with smooth hide/show */}
                <ListItemText
                    primary={item.label}
                    sx={{
                        opacity: isMinimized ? 0 : 1,
                        width: isMinimized ? 0 : 'auto',
                        overflow: 'hidden',
                        transition: 'opacity 0.2s ease-in-out, width 0.3s ease-in-out 0.1s',
                        "& .MuiListItemText-primary": {
                            whiteSpace: 'nowrap',
                        }
                    }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: isMinimized ? 0 : 2 }} />

        {/* User Profile - Adjust for minimization */}
        <Box sx={{ p: isMinimized ? 1 : 2, display: "flex", alignItems: "center", justifyContent: isMinimized ? 'center' : 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "#10b981" }}>
            {loggedInUser.displayName ? loggedInUser.displayName.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          {/* Wrap profile text in SmoothText for a consistent layout */}
          <SmoothText>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#fff" }}>
                {loggedInUser.displayName || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "11px" }}>
                {loggedInUser.role || 'Role'} • {loggedInUser.username}
              </Typography>
            </Box>
          </SmoothText>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar for mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${MAX_DRAWER_WIDTH}px)` },
          ml: { sm: `${MAX_DRAWER_WIDTH}px` },
          display: { sm: "none" },
          background: "#fff",
          boxShadow: "none",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: "#0f172a" }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: "#0f172a" }}>
            FRA Portal
          </Typography>
          <IconButton sx={{ color: "#0f172a" }}>
            <Notifications />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{
          width: { xs: MAX_DRAWER_WIDTH, sm: drawerWidth },
          flexShrink: { sm: 0 },
          transition: { sm: 'width 0.3s ease-in-out' },
        }}
        // Apply hover handlers only to the desktop view's wrapper Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Mobile Drawer (uses MAX_DRAWER_WIDTH) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: MAX_DRAWER_WIDTH,
              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
              transition: 'width 0.3s ease-in-out',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default Navbar;