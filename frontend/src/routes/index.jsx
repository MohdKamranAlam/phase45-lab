import { Route, Routes } from "react-router-dom";
import AppShell from "../app/AppShell.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Explorer from "../pages/Explorer.jsx";
import Surface3D from "../pages/Surface3D.jsx";
import Runs from "../pages/Runs.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import WaterRiskDashboard from "../pages/WaterRiskDashboard.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<WaterRiskDashboard />} />
      <Route element={<AppShell />}>
        <Route path="/lab" element={<Dashboard />} />
        <Route path="/lab/explorer" element={<Explorer />} />
        <Route path="/lab/surface3d" element={<Surface3D />} />
        <Route path="/lab/runs" element={<Runs />} />
      </Route>
    </Routes>
  );
}
