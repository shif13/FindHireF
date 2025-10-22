import React, { useState, useEffect } from 'react';
import { Users, Search, Home, Menu, X } from 'lucide-react';

const Navbar = ({ activeTab = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
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
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Always visible */}
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0" onClick={() => handleNavigation('/')}>
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <span className="text-base sm:text-xl font-semibold text-gray-900">find-hire.co</span>
            </div>
            
            {/* Desktop Navigation - Hidden on mobile/tablet */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
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

            {/* Tablet Navigation - Icons only, hidden on mobile and desktop */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeTab;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`p-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
            
            {/* Auth Buttons - Hidden on small screens */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => handleNavigation('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button - Only on small screens */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Only on small screens */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-14 sm:top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeTab;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 space-y-2 sm:hidden">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="w-full text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-all text-base"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigation('/signup')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-all text-base"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;