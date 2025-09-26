import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PattaList from "./pages/PattaList.jsx";
import Settings, { SettingsProvider } from "./pages/Settings.jsx";
import Map from "./pages/Map.jsx";
import ScanDoc from "./pages/ScanDoc.jsx";
import DecisionSupportPanel from "./pages/DecisionSupportPanel.jsx";

// --- UPDATE ---
// Import the AuthWrapper to protect the application
import AuthWrapper from './pages/AuthWrapper.jsx';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        {/* The AuthWrapper now protects all the routes within it. */}
        {/* It will show the LoginModal if the user is not authenticated. */}
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Navbar: "/" → Dashboard */}
              <Route index element={<Dashboard />} />

              {/* Navbar: "/atlas" → Atlas/Map Page */}
              <Route path="atlas" element={<Map />} />

              {/* Navbar: "/scandoc" → Scan Document */}
              <Route path="scandoc" element={<ScanDoc />} />

              {/* Navbar: "/dss" → Decision Support Panel */}
              <Route path="dss" element={<DecisionSupportPanel />} />

              {/* Other routes */}
              <Route path="pattas" element={<PattaList />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;

