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
  Chip,
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
} from "@mui/icons-material";

const drawerWidth = 280;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Get logged-in user info
  const getLoggedInUser = () => {
    const userData = localStorage.getItem('loggedInUser');
    return userData ? JSON.parse(userData) : { username: 'Guest', displayName: 'Guest User' };
  };

  const loggedInUser = getLoggedInUser();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('loggedInUser');
    // Reload the page to trigger re-authentication
    window.location.reload();
  };

  // Corrected navItems with a proper icon for DSS
  const navItems = [
    { path: "/", label: "Dashboard", icon: <Dashboard />, color: "#34d399" },
    { path: "/atlas", label: "Atlas", icon: <Map />, color: "#60a5fa" },
    { path: "/scandoc", label: "Scan Document", icon: <DocumentScanner />, color: "#f472b6" },
    { path: "/dss", label: "Decision Support", icon: <Psychology />, color: "#fbbf24" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)", // Rich dark slate to teal
        color: "#e2e8f0", // Light gray text for contrast
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Forest sx={{ fontSize: 40, color: "#34d399" }} />
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
              color: "#94a3b8", // Muted slate color
              fontSize: "11px",
            }}
          >
            Forest Rights Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: "12px",
                  py: 1.2,
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
                    minWidth: 44,
                    filter: active ? `drop-shadow(0 0 5px ${item.color}60)` : "none",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: active ? "#fff" : "#e2e8f0",
                      fontWeight: active ? 600 : 500,
                      fontSize: "15px",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Actions Section */}
      <Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />
        <List sx={{ px: 2, py: 2 }}>
          {/* Settings and Logout Buttons */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link}
              to="/settings"
              sx={{ borderRadius: "12px", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" } }}
            >
              <ListItemIcon sx={{ color: "#94a3b8", minWidth: 44 }}><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ borderRadius: "12px", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" } }}
            >
              <ListItemIcon sx={{ color: "#94a3b8", minWidth: 44 }}><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

        {/* User Profile */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "#10b981" }}>
            {loggedInUser.displayName ? loggedInUser.displayName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#fff" }}>
              {loggedInUser.displayName || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "11px" }}>
              {loggedInUser.role || 'Role'} • {loggedInUser.username}
            </Typography>
          </Box>
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
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