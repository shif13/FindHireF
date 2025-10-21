import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/Footer'; // 👈 Import the Footer component

const Layout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/equipment') return 'equipment';
    if (location.pathname === '/recruiter') return 'manpower';
    return 'home';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar activeTab={getActiveTab()} />

      {/* Page content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
