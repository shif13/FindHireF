import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Register from "../pages/Register";
import LandingPage from "../pages/LandingPage";
import EquipmentSearch from "../components/EquipmentSearch";
import RecruitmentToolkit from "../components/RecruitmentToolkit";
import FreelancerDetails from "../components/FreelancerDetails";
import EquipmentDetails from "../components/EquipmentDetails";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/equipment" element={<EquipmentSearch />} /> 
        <Route path="/recruiter" element={<RecruitmentToolkit />} />
        
        {/* Detail page routes */}
        <Route path="/freelancer/:id" element={<FreelancerDetails />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
      </Routes>
    </Router>
  );
}