import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, Container, Paper } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./Navbar";

const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#764ba2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

const drawerWidth = 280;

const Layout = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Navbar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 2,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            backgroundColor: "background.default",
            minHeight: "100vh",
          }}
        >
          {/* Toolbar spacer for mobile */}
          <Toolbar sx={{ display: { sm: "none" } }} />

          {/* Page Content */}
          <Container
            maxWidth="xl"
            sx={{
              py: 3,
              px: { xs: 2, sm: 3 },
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
