import React, { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Star, RefreshCw, Home as HomeIcon } from 'lucide-react';
import videoFile from '../assets/videos/video1.mp4';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const REVIEWS_LIMIT = 6;
  const FEATURED_LIMIT = 3;
const API_BASE = import.meta.env.VITE_BACKEND_URL;
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
      console.log('Fetching featured freelancers...');
      const response = await fetch(`${API_BASE}/freelancers/featured?limit=${FEATURED_LIMIT}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Freelancers response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Freelancers data:', data);
      
      if (data.success && data.freelancers) {
        setFeaturedFreelancers(data.freelancers);
        console.log('Featured freelancers set:', data.freelancers.length);
      }
    } catch (error) {
      console.error('Error fetching featured freelancers:', error);
    }
  };

  const fetchFeaturedEquipment = async () => {
    try {
      console.log('Fetching featured equipment...');
      const response = await fetch(`${API_BASE}/equipment/featured?limit=${FEATURED_LIMIT}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Equipment response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Equipment data:', data);
      
      if (data.success && data.equipment) {
        setFeaturedEquipment(data.equipment);
        console.log('Featured equipment set:', data.equipment.length);
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
    window.location.href = '/register';
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
          <div className="flex items-center justify-start gap-8 h-16">
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
        </div>
      </nav>

      <div className="min-h-screen relative overflow-hidden">
        {/* Video Background */}
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

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl">
                ProFetch
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 mb-8 font-light drop-shadow-lg">
                Your one-stop platform for freelance talent and equipment hire.
              </p>
            </div>

            {/* Content Buttons */}
            <div className="max-w-5xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
                What would you like to do today?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* List Your Services */}
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

                {/* Find What You Need */}
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

      {/* Featured Listings Section - Combined */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Featured Listings
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Featured Freelancers - First 3 */}
            {featuredFreelancers.slice(0, 3).map((freelancer) => (
              <div key={`freelancer-${freelancer.id}`} className="flex flex-col items-center group">
                <div className="relative w-20 h-20 mb-3">
                  {freelancer.profileImage ? (
                    <img
                      src={freelancer.profileImage}
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-teal-500"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-teal-500 ${getUserColor(freelancer.firstName, freelancer.lastName)}`}>
                      {getUserInitials(freelancer.firstName, freelancer.lastName)}
                    </div>
                  )}
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-0.5 text-xs line-clamp-1 px-2">
                  {freelancer.title || `${freelancer.firstName} ${freelancer.lastName}`}
                </h3>
                <button
                  onClick={() => window.location.href = `/freelancer/${freelancer.id}`}
                  className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors mt-1"
                >
                  View Details
                </button>
              </div>
            ))}

            {/* Featured Equipment - First 3 */}
            {featuredEquipment.slice(0, 3).map((equipment) => (
              <div key={`equipment-${equipment.id}`} className="flex flex-col items-center group">
                <div className="relative w-20 h-20 mb-3">
                  <img
                    src={equipment.image || '/placeholder-equipment.jpg'}
                    alt={equipment.equipmentName}
                    className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300 ring-4 ring-persian_green-500"
                  />
                  {equipment.availability === 'available' && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-mint-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-0.5 text-xs line-clamp-1 px-2">
                  {equipment.equipmentName}
                </h3>
                <button
                  onClick={() => window.location.href = `/equipment/${equipment.id}`}
                  className="text-persian_green-600 hover:text-persian_green-700 text-xs font-medium transition-colors mt-1"
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

      {/* Reviews Section - Bottom - Compact & Transparent */}
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

            {/* Reviews Grid - Compact */}
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
    </div>
  );
};

export default Home;