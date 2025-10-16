import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import LandingPage from "../pages/LandingPage";
import EquipmentSearch from "../components/EquipmentSearch";
import RecruitmentToolkit from "../components/RecruitmentToolkit";
import FreelancerDetails from "../components/FreelancerDetails";
import EquipmentDetails from "../components/EquipmentDetails";
import Signup from "../pages/Signup";
import RoleSelection from "../components/RoleSelection";
import EquipmentDashboard from "../pages/EquipmentDashboard"; 
import FreelancerDashboard from "../components/FreelancerDashboard";  
import EquipSkillDashboard from "../components/EquipSkillDashboard";
import Buff from "../components/Buff";


export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/equipment" element={<EquipmentSearch />} /> 
        <Route path="/recruiter" element={<RecruitmentToolkit />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/equipmentdashboard" element={<EquipmentDashboard />} />
        <Route path="/freelancer/:id" element={<FreelancerDetails />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
        <Route path="/equipskilldashboard" element={<EquipSkillDashboard />} />
        <Route path="/buff" element={<Buff />} />
      </Routes>
    </Router>
  );
}