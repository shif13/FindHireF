import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import LandingPage from "../pages/LandingPage";
import SignupManpower from "../pages/AccountManpower";
import AccountEquipment from "../pages/AccountEquipOwner";
import SignUp from "../pages/Signup";
import SignupBoth from "../pages/AccountBoth";
import Login from "../pages/Login";
import ManpowerDashboard from "../components/ManpowerDashboard";
import EquipmentDashboard from "../components/EquipmentDashboard";
import ManpowerFinder from "../components/ManpowerFinder";
import EquipmentFinder from "../components/EquipmentFinder";
import BothDashboard from "../components/BothDashboard";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Routes WITH Navbar & Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signup/manpower" element={<SignupManpower />} />
          <Route path="/signup/equipment" element={<AccountEquipment />} />
          <Route path="/signup/both" element={<SignupBoth />} />
          
        </Route>

        {/* Routes WITHOUT Navbar & Footer (Authentication & Dashboards) */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/manpowerdashboard" element={<ManpowerDashboard />} />
        <Route path="/equipmentdashboard" element={<EquipmentDashboard />} />
        <Route path="/manpower-finder" element={<ManpowerFinder />} />
        <Route path="/equipment" element={<EquipmentFinder />} />
        <Route path="/dashboard" element={<BothDashboard />} />

      </Routes>
    </Router>
  );
}
