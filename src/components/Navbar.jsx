import React, { useState, useEffect } from 'react';
import { Users, Search, Home } from 'lucide-react';

const Navbar = ({ activeTab = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const placeholders = [
    "e.g., 'Electrician', 'Excavator Rental'...",
    "e.g., 'Plumber', 'Crane Operator'...",
    "e.g., 'Welder', 'Forklift Rental'...",
    "e.g., 'Carpenter', 'Bulldozer'..."
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Placeholder rotation interval
    const placeholderInterval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(placeholderInterval);
    };
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/landing?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'equipment', label: 'Find Equipment', icon: Search, path: '/equipment' },
    { id: 'manpower', label: 'Find Manpower', icon: Users, path: '/manpower-finder' }
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
        : 'bg-white/80 backdrop-blur-sm border-b border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
            <Search className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-semibold text-gray-900">find-hire.co</span>
          </div>
          
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation('/login')}
              className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Log In
            </button>
            <button
              onClick={() => handleNavigation('/signup')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;