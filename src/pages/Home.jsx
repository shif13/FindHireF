import React, { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Star, RefreshCw, Home as HomeIcon, X, MapPin, Phone, Mail, User, Package } from 'lucide-react';
import videoFile from '../assets/videos/video1.mp4';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const REVIEWS_LIMIT = 6;
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
    fetchFeaturedFreelancers();
    fetchFeaturedEquipment();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/reviews?_=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.reviews) {
        const sortedReviews = data.reviews.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setReviews(sortedReviews.slice(0, REVIEWS_LIMIT));
      } else {
        setError('No reviews found');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(`Failed to load reviews: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews/stats?_=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReviewStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchFeaturedFreelancers = async () => {
    try {
      const response = await fetch(`${API_BASE}/search/featured`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.freelancers) {
        setFeaturedFreelancers(data.freelancers);
      }
    } catch (error) {
      console.error('Error fetching featured freelancers:', error);
    }
  };

  const fetchFeaturedEquipment = async () => {
    try {
      const response = await fetch(`${API_BASE}/equipment/featured`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.equipment) {
        setFeaturedEquipment(data.equipment);
      }
    } catch (error) {
      console.error('Error fetching featured equipment:', error);
    }
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserColor = (firstName, lastName) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const name = `${firstName}${lastName}`;
    const index = name.length % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  const navigateToGetStarted = () => {
    window.location.href = '/signup';
  };

  const navigateToEquipmentFinder = () => {
    window.location.href = '/landing';
  };

  const handleRefreshReviews = () => {
    fetchReviews();
    fetchReviewStats();
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const openFreelancerModal = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowFreelancerModal(true);
  };

  const closeFreelancerModal = () => {
    setShowFreelancerModal(false);
    setSelectedFreelancer(null);
  };

  const openEquipmentModal = (equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentModal(true);
  };

  const closeEquipmentModal = () => {
    setShowEquipmentModal(false);
    setSelectedEquipment(null);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, path: '/' },
    { id: 'equipment', label: 'Find Equipment', icon: Search, path: '/equipment' },
    { id: 'manpower', label: 'Find Manpower', icon: Users, path: '/recruiter' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'home';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigation('/login')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl">
                ProFetch
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 mb-8 font-light drop-shadow-lg">
                Your one-stop platform for freelance talent and equipment hire.
              </p>
            </div>

            <div className="max-w-5xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
                What would you like to do today?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-2xl border border-white/40 p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        List Your Services
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Get hired as a freelancer or list your equipment for rental.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={navigateToGetStarted}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-sm shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-2xl border border-white/40 p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Find What You Need
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Browse skilled freelancers and available equipment.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={navigateToEquipmentFinder}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-sm shadow-lg hover:shadow-xl"
                  >
                    Start Browsing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Featured Listings
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredFreelancers.map((freelancer) => (
              <div key={`freelancer-${freelancer.id}`} className="flex flex-col items-center group">
                <div className="relative w-20 h-20 mb-3">
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-teal-500 ${getUserColor(freelancer.firstName, freelancer.lastName)}`}>
                    {getUserInitials(freelancer.firstName, freelancer.lastName)}
                  </div>
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-0.5 text-xs line-clamp-1 px-2">
                  {freelancer.title}
                </h3>
                <button
                  onClick={() => openFreelancerModal(freelancer)}
                  className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors mt-1"
                >
                  View Details
                </button>
              </div>
            ))}

            {featuredEquipment.map((equipment) => (
              <div key={`equipment-${equipment.id}`} className="flex flex-col items-center group">
                <div className="relative w-20 h-20 mb-3">
                  <img
                    src={equipment.image || '/placeholder-equipment.jpg'}
                    alt={equipment.equipmentName}
                    className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-purple-500"
                  />
                  {equipment.availability === 'available' && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-0.5 text-xs line-clamp-1 px-2">
                  {equipment.equipmentName}
                </h3>
                <button
                  onClick={() => openEquipmentModal(equipment)}
                  className="text-purple-600 hover:text-purple-700 text-xs font-medium transition-colors mt-1"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {featuredFreelancers.length === 0 && featuredEquipment.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No featured listings available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-xl bg-gray-50 rounded-2xl shadow-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Top Reviews
                </h2>
                {reviewStats && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{reviewStats.averageRating}</span>
                    <span className="text-gray-600 text-xs">
                      ({reviewStats.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefreshReviews}
                disabled={loading}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh reviews"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-300/30 rounded-lg text-red-700 text-xs backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading ? (
                <div className="col-span-full text-center text-gray-700 py-6">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-3 border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${getUserColor(review.firstName, review.lastName)}`}>
                        {getUserInitials(review.firstName, review.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-xs truncate">
                          {review.firstName} {review.lastName}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-1">
                      {review.title}
                    </h4>
                    <p className="text-gray-700 text-[11px] leading-relaxed line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-700 py-6">
                  <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Freelancer Modal */}
      {showFreelancerModal && selectedFreelancer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedFreelancer.firstName} {selectedFreelancer.lastName}
                </h2>
                <p className="text-gray-600">{selectedFreelancer.title}</p>
              </div>
              <button
                onClick={closeFreelancerModal}
                className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <User size={18} className="text-gray-400" />
                    <span>{selectedFreelancer.firstName} {selectedFreelancer.lastName}</span>
                  </div>
                  {selectedFreelancer.location && (
                    <div className="flex items-center gap-2 text-gray-800">
                      <MapPin size={18} className="text-gray-400" />
                      <span>{selectedFreelancer.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* Email Button */}
                  <a
                    href={`mailto:${selectedFreelancer.email}`}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <Mail size={24} className="text-blue-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">Email</span>
                  </a>

                  {/* Phone Button */}
                  {selectedFreelancer.phone && (
                    <a
                      href={`tel:${selectedFreelancer.phone}`}
                      className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                    >
                      <Phone size={24} className="text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Call</span>
                    </a>
                  )}

                  {/* WhatsApp Button */}
                  {selectedFreelancer.phone && (
                    <a
                      href={`https://wa.me/${selectedFreelancer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                    >
                      <svg 
                        className="w-6 h-6 text-emerald-600 mb-2" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* View All Button */}
              <div className="pt-4">
                <button
                  onClick={() => window.location.href = '/recruiter'}
                  className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  View All Freelancers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEquipment.equipmentName}
                </h2>
                <p className="text-gray-600">{selectedEquipment.equipmentType}</p>
              </div>
              <button
                onClick={closeEquipmentModal}
                className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedEquipment.availability === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {selectedEquipment.availability === 'available' ? 'Available' : 'On Hire'}
                </span>
              </div>

              {/* Location */}
              {selectedEquipment.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{selectedEquipment.location}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEquipment.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEquipment.description}</p>
                </div>
              )}

              {/* Contact Owner */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Owner</h3>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-800 mb-2">
                    <User size={18} className="text-gray-400" />
                    <span className="font-medium">{selectedEquipment.contactPerson}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Email Button */}
                  <a
                    href={`mailto:${selectedEquipment.contactEmail}`}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <Mail size={24} className="text-blue-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">Email</span>
                  </a>

                  {/* Phone Button */}
                  {selectedEquipment.contactNumber && (
                    <a
                      href={`tel:${selectedEquipment.contactNumber}`}
                      className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                    >
                      <Phone size={24} className="text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Call</span>
                    </a>
                  )}

                  {/* WhatsApp Button */}
                  {selectedEquipment.contactNumber && (
                    <a
                      href={`https://wa.me/${selectedEquipment.contactNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                    >
                      <svg 
                        className="w-6 h-6 text-emerald-600 mb-2" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* View All Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => window.location.href = '/equipment'}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Package size={18} />
                  View All Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;