import React, { useState, useEffect } from 'react';
import { Star, RefreshCw, Search, X, MapPin, Phone, Mail, User, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTagline, setCurrentTagline] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const [currentSearchWord, setCurrentSearchWord] = useState(0);

  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const REVIEWS_LIMIT = 6;
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const taglines = [
    "Rent Heavy Equipment with Ease.",
    "Connecting Experts to Projects.",
    "The Industrial Hiring Hub.",
    "Find Skilled Workers Instantly."
  ];

  const placeholders = [
    "e.g., 'Electrician', 'Excavator Rental'...",
    "e.g., 'Plumber', 'Crane Operator'...",
    "e.g., 'Welder', 'Forklift Rental'...",
    "e.g., 'Carpenter', 'Bulldozer'..."
  ];

  const searchWords = [
    "Cranes",
    "Excavators",
    "Operators",
    "Electricians",
    "Plumbers"
  ];

  const carouselImages = [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=400&fit=crop'
  ];

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
    fetchFeaturedFreelancers();
    fetchFeaturedEquipment();
    
    const initialTimer = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 4000);

    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    const taglineInterval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);

    const placeholderInterval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    const searchWordInterval = setInterval(() => {
      setCurrentSearchWord((prev) => (prev + 1) % searchWords.length);
    }, 800);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(carouselInterval);
      clearInterval(taglineInterval);
      clearInterval(placeholderInterval);
      clearInterval(searchWordInterval);
    };
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
        console.warn('Reviews endpoint returned error:', response.status);
        setReviews([]);
        return;
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
        setReviews([]);
      }
    } catch (error) {
      console.warn('Error fetching reviews:', error);
      setReviews([]);
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
        console.warn('Review stats endpoint returned error:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReviewStats(data.stats);
      }
    } catch (error) {
      console.warn('Error fetching review stats:', error);
    }
  };

  const fetchFeaturedFreelancers = async () => {
    try {
      const response = await fetch(`${API_BASE}/manpower-search/featured`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('Featured freelancers endpoint returned error:', response.status);
        setFeaturedFreelancers([]);
        return;
      }
      
      const data = await response.json();
      console.log('Featured Freelancers Response:', data);
      
      if (data.success && data.manpower) {
        // Transform the data to match what the UI expects
        const transformedData = data.manpower.slice(0, 3).map(person => ({
          id: person.id,
          firstName: person.first_name,
          lastName: person.last_name,
          title: person.job_title,
          email: person.email,
          phone: person.mobile_number || person.whatsapp_number,
          location: person.location,
          profilePhoto: person.profile_photo,
          availabilityStatus: person.availability_status,
          rate: person.rate,
          description: person.profile_description
        }));
        console.log('Transformed Freelancers:', transformedData);
        setFeaturedFreelancers(transformedData);
      } else {
        setFeaturedFreelancers([]);
      }
    } catch (error) {
      console.warn('Error fetching featured freelancers:', error);
      setFeaturedFreelancers([]);
    }
  };

  const fetchFeaturedEquipment = async () => {
    try {
      const response = await fetch(`${API_BASE}/equipment-search/search`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.warn('Featured equipment endpoint returned error:', response.status);
        setFeaturedEquipment([]);
        return;
      }
      
      const data = await response.json();
      console.log('Featured Equipment Response:', data);
      
      if (data.success && data.data) {
        // Transform the data to match what the UI expects
        const transformedData = data.data.slice(0, 3).map(equipment => {
          // Parse equipment images
          let images = [];
          try {
            if (Array.isArray(equipment.equipmentImages)) {
              images = equipment.equipmentImages;
            } else if (typeof equipment.equipmentImages === 'string') {
              images = JSON.parse(equipment.equipmentImages);
            }
          } catch (e) {
            console.error('Error parsing equipment images:', e);
          }

          return {
            id: equipment.id,
            equipmentName: equipment.equipmentName,
            category: equipment.equipmentType,
            email: equipment.contactEmail,
            phone: equipment.contactNumber,
            location: equipment.location,
            availability: equipment.availability,
            description: equipment.description,
            image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=200&fit=crop',
            contactPerson: equipment.contactPerson
          };
        });
        console.log('Transformed Equipment:', transformedData);
        setFeaturedEquipment(transformedData);
      } else {
        setFeaturedEquipment([]);
      }
    } catch (error) {
      console.warn('Error fetching featured equipment:', error);
      setFeaturedEquipment([]);
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/landing?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleRefreshReviews = () => {
    fetchReviews();
    fetchReviewStats();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          
          {/* Initial Animation or Main Content */}
          <div className="text-center mb-6 sm:mb-8">
            {showInitialAnimation ? (
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <Search className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 text-teal-600" strokeWidth={2.5} />
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                    <div className="animate-words-flow flex flex-col items-center gap-4 sm:gap-6">
                      {[0, 1, 2, 3, 4].map((offset) => (
                        <span key={offset} className="text-[10px] sm:text-xs font-semibold text-teal-700 whitespace-nowrap">
                          {searchWords[(currentSearchWord + offset) % searchWords.length]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-500">
                  The Industrial Hiring Hub.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-600 mb-3 sm:mb-4">
                  Find-Hire.Co
                </h1>
                <p 
                  key={currentTagline}
                  className="text-sm sm:text-base text-gray-500 transition-opacity duration-500"
                >
                  {taglines[currentTagline]}
                </p>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
            <div className="bg-white rounded-full shadow-sm border border-gray-200 p-1 sm:p-1.5 flex items-center gap-1 sm:gap-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 sm:ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={placeholders[currentPlaceholder]}
                className="flex-1 outline-none text-gray-700 text-xs sm:text-sm min-w-0"
              />
              <button
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-7 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
              >
                Find
              </button>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative rounded-lg overflow-hidden shadow-md max-w-2xl mx-auto">
            <div className="relative h-48 sm:h-64 md:h-80">
              <img
                src={carouselImages[currentSlide]}
                alt="Carousel"
                className="w-full h-full object-cover"
              />
              
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all bg-white/80 rounded-full p-1 sm:p-1.5"
              >
                <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all bg-white/80 rounded-full p-1 sm:p-1.5"
              >
                <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      {!showInitialAnimation && (
        <>
          <div className="bg-white py-8 sm:py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-12">
                Featured Listings
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {featuredFreelancers.map((freelancer) => (
                  <div key={`freelancer-${freelancer.id}`} className="flex flex-col items-center group">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3">
                      {freelancer.profilePhoto ? (
                        <img
                          src={freelancer.profilePhoto}
                          alt={`${freelancer.firstName} ${freelancer.lastName}`}
                          className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm sm:text-base md:text-lg font-bold shadow-md group-hover:shadow-lg transition-shadow duration-300 ${getUserColor(freelancer.firstName, freelancer.lastName)}`}>
                          {getUserInitials(freelancer.firstName, freelancer.lastName)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-xs sm:text-sm line-clamp-1 px-1 sm:px-2">
                      {freelancer.title}
                    </h3>
                    <button
                      onClick={() => openFreelancerModal(freelancer)}
                      className="text-teal-600 hover:text-teal-700 text-[10px] sm:text-xs font-medium transition-colors mt-1"
                    >
                      View Details
                    </button>
                  </div>
                ))}

                {featuredEquipment.map((equipment) => (
                  <div key={`equipment-${equipment.id}`} className="flex flex-col items-center group">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3">
                      <img 
                        src={equipment.image}
                        alt={equipment.equipmentName}
                        className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                      />
                      {equipment.availability === 'available' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-xs sm:text-sm line-clamp-1 px-1 sm:px-2">
                      {equipment.equipmentName}
                    </h3>
                    <button
                      onClick={() => openEquipmentModal(equipment)}
                      className="text-teal-600 hover:text-teal-700 text-[10px] sm:text-xs font-medium transition-colors mt-1"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {featuredFreelancers.length === 0 && featuredEquipment.length === 0 && (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <p className="text-sm sm:text-base">No featured listings available at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white py-8 sm:py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="backdrop-blur-xl bg-gray-50 rounded-2xl shadow-xl border border-gray-200 p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Top Reviews
                    </h2>
                    {reviewStats && (
                      <div className="flex items-center space-x-1.5 sm:space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{reviewStats.averageRating}</span>
                        <span className="text-gray-600 text-[10px] sm:text-xs">
                          ({reviewStats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleRefreshReviews}
                    disabled={loading}
                    className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh reviews"
                  >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {error && (
                  <div className="mb-2 sm:mb-3 p-2 bg-red-500/20 border border-red-300/30 rounded-lg text-red-700 text-xs backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {loading ? (
                    <div className="col-span-full text-center text-gray-700 py-4 sm:py-6">
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-xl p-2.5 sm:p-3 border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${getUserColor(review.firstName, review.lastName)}`}>
                            {getUserInitials(review.firstName, review.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-[11px] sm:text-xs truncate">
                              {review.firstName} {review.lastName}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-gray-600">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-[11px] sm:text-xs mb-0.5 sm:mb-1 line-clamp-1">
                          {review.title}
                        </h4>
                        <p className="text-gray-700 text-[10px] sm:text-[11px] leading-relaxed line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-700 py-4 sm:py-6">
                      <p className="text-xs sm:text-sm">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Freelancer Modal */}
      {showFreelancerModal && selectedFreelancer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b sticky top-0 bg-white flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedFreelancer.firstName} {selectedFreelancer.lastName}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">{selectedFreelancer.title}</p>
              </div>
              
              <button
                onClick={closeFreelancerModal}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {selectedFreelancer.profilePhoto && (
                <div className="flex justify-center">
                  <img 
                    src={selectedFreelancer.profilePhoto}
                    alt={`${selectedFreelancer.firstName} ${selectedFreelancer.lastName}`}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <User size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                    <span className="truncate">{selectedFreelancer.firstName} {selectedFreelancer.lastName}</span>
                  </div>
                  {selectedFreelancer.location && (
                    <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                      <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                      <span className="truncate">{selectedFreelancer.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedFreelancer.description && (
                <div className="pt-3 sm:pt-4 border-t">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">About</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{selectedFreelancer.description}</p>
                </div>
              )}

              <div className="pt-3 sm:pt-4 border-t">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Contact</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {selectedFreelancer.email && (
                    <a
                      href={`mailto:${selectedFreelancer.email}`}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        if (!selectedFreelancer.email || !selectedFreelancer.email.includes('@')) {
                          e.preventDefault();
                          alert('Invalid email address');
                        }
                      }}
                    >
                      <Mail size={20} className="sm:w-6 sm:h-6 text-blue-600 mb-1 sm:mb-2" />
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">Email</span>
                    </a>
                  )}

                  {selectedFreelancer.phone && (
                    <a
                      href={`tel:${selectedFreelancer.phone}`}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        if (!selectedFreelancer.phone) {
                          e.preventDefault();
                          alert('No phone number available');
                        }
                      }}
                    >
                      <Phone size={20} className="sm:w-6 sm:h-6 text-green-600 mb-1 sm:mb-2" />
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">Call</span>
                    </a>
                  )}

                  {selectedFreelancer.phone && (
                    <a
                      href={`https://wa.me/${selectedFreelancer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        const cleanNumber = selectedFreelancer.phone.replace(/[^0-9]/g, '');
                        if (!cleanNumber || cleanNumber.length < 10) {
                          e.preventDefault();
                          alert('Invalid WhatsApp number');
                        }
                      }}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mb-1 sm:mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <button
                  onClick={() => window.location.href = '/manpower-finder'}
                  className="w-full px-4 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                  View All Professionals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b sticky top-0 bg-white flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedEquipment.equipmentName}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">{selectedEquipment.category}</p>
              </div>
              <button
                onClick={closeEquipmentModal}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {selectedEquipment.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedEquipment.image}
                    alt={selectedEquipment.equipmentName}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Equipment Details</h3>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <Package size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                    <span className="truncate">{selectedEquipment.equipmentName}</span>
                  </div>
                  {selectedEquipment.location && (
                    <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                      <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                      <span className="truncate">{selectedEquipment.location}</span>
                    </div>
                  )}
                  {selectedEquipment.availability && (
                    <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                      <div className={`w-3 h-3 rounded-full ${selectedEquipment.availability === 'available' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className="capitalize">{selectedEquipment.availability}</span>
                    </div>
                  )}
                  {selectedEquipment.contactPerson && (
                    <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                      <User size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                      <span className="truncate">{selectedEquipment.contactPerson}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedEquipment.description && (
                <div className="pt-3 sm:pt-4 border-t">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{selectedEquipment.description}</p>
                </div>
              )}

              <div className="pt-3 sm:pt-4 border-t">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Contact Owner</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {selectedEquipment.email && (
                    <a
                      href={`mailto:${selectedEquipment.email}`}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        if (!selectedEquipment.email || !selectedEquipment.email.includes('@')) {
                          e.preventDefault();
                          alert('Invalid email address');
                        }
                      }}
                    >
                      <Mail size={20} className="sm:w-6 sm:h-6 text-blue-600 mb-1 sm:mb-2" />
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">Email</span>
                    </a>
                  )}

                  {selectedEquipment.phone && (
                    <a
                      href={`tel:${selectedEquipment.phone}`}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        if (!selectedEquipment.phone) {
                          e.preventDefault();
                          alert('No phone number available');
                        }
                      }}
                    >
                      <Phone size={20} className="sm:w-6 sm:h-6 text-green-600 mb-1 sm:mb-2" />
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">Call</span>
                    </a>
                  )}

                  {selectedEquipment.phone && (
                    <a
                      href={`https://wa.me/${selectedEquipment.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                      onClick={(e) => {
                        const cleanNumber = selectedEquipment.phone.replace(/[^0-9]/g, '');
                        if (!cleanNumber || cleanNumber.length < 10) {
                          e.preventDefault();
                          alert('Invalid WhatsApp number');
                        }
                      }}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mb-1 sm:mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <button
                  onClick={() => window.location.href = '/equipment'}
                  className="w-full px-4 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Package size={16} className="sm:w-[18px] sm:h-[18px]" />
                  View All Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes words-flow {
          0% {
            transform: translateY(40px);
          }
          100% {
            transform: translateY(-100px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }

        .animate-words-flow {
          animation: words-flow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;