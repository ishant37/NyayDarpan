// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PattaList from "./pages/PattaList.jsx";
import Settings, { SettingsProvider } from "./pages/Settings.jsx";
import Map from "./pages/Map.jsx";
import ScanDoc from "./pages/ScanDoc.jsx";
// Import the new DSS main component
import DecisionSupportSystem from "./pages/dss/DecisionSupportSystem.jsx";
import PendingClaims from "./pages/PendingClaims.jsx";
import ClaimDetail from "./pages/ClaimDetail.jsx";
import ApplyClaim from "./pages/ApplyClaim.jsx";

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="atlas" element={<Map />} />
            <Route path="scandoc" element={<ScanDoc />} />
            {/* Updated this route to point to the new DSS */}
            <Route path="dss" element={<DecisionSupportSystem />} />
            <Route path="pattas" element={<PattaList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pending-claims" element={<PendingClaims />} />
            <Route path="pending-claims/:claimId" element={<ClaimDetail />} />
            <Route path="apply-claim" element={<ApplyClaim />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
