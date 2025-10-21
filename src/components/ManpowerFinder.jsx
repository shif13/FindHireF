import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Briefcase, DollarSign, Phone, Mail, MessageSquare,
  FileText, Award, CheckCircle, Clock, User, Home, X, Filter, Users, Menu, Package,
  Eye, Download
} from 'lucide-react';

const ManpowerFinder = () => {
  const [searchFilters, setSearchFilters] = useState({
    jobTitle: '',
    location: '',
    availabilityStatus: ''
  });

  const [manpowerList, setManpowerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/manpower-search`;

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchFilters)
      });

      const data = await response.json();

      if (data.success) {
        setManpowerList(data.manpower);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchFilters({
      jobTitle: '',
      location: '',
      availabilityStatus: ''
    });
    setManpowerList([]);
    setSearched(false);
  };

  const handleViewProfile = async (manpowerId) => {
    try {
      const response = await fetch(`${API_BASE}/details/${manpowerId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Profile Detail Modal
  if (selectedProfile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#D9D9D9' }}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b" style={{ borderColor: '#3C6E71' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedProfile(null)}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                style={{ color: '#353535' }}
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Back to Results</span>
              </button>

              <a href="/" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors" style={{ color: '#353535' }}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Profile Header */}
            <div className="flex items-start gap-8 mb-8 pb-8 border-b" style={{ borderColor: '#D9D9D9' }}>
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-4" style={{ ringColor: '#3C6E71' }}>
                {selectedProfile.profile_photo ? (
                  <img
                    src={selectedProfile.profile_photo}
                    alt={`${selectedProfile.first_name} ${selectedProfile.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#353535' }}>
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </h1>
                <p className="text-xl font-semibold mb-4" style={{ color: '#3C6E71' }}>
                  {selectedProfile.job_title}
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                    <MapPin className="w-5 h-5" style={{ color: '#353535' }} />
                    <span className="font-medium" style={{ color: '#353535' }}>{selectedProfile.location}</span>
                  </div>

                  {selectedProfile.rate && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                      <DollarSign className="w-5 h-5" style={{ color: '#353535' }} />
                      <span className="font-medium" style={{ color: '#353535' }}>{selectedProfile.rate}</span>
                    </div>
                  )}

                  {selectedProfile.availability_status === 'available' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">Available Now</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-700">
                        Available from{' '}
                        {selectedProfile.available_from
                          ? new Date(selectedProfile.available_from).toLocaleDateString()
                          : 'TBD'}
                      </span>
                    </div>
                  )}
                </div>

                {selectedProfile.profile_description && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#353535' }}>About</h3>
                    <p className="leading-relaxed" style={{ color: '#353535' }}>
                      {selectedProfile.profile_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#353535' }}>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                  <Phone className="w-6 h-6" style={{ color: '#3C6E71' }} />
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <a
                      href={`tel:${selectedProfile.mobile_number}`}
                      className="font-medium hover:underline"
                      style={{ color: '#353535' }}
                    >
                      {selectedProfile.mobile_number}
                    </a>
                  </div>
                </div>

                {selectedProfile.whatsapp_number && (
                  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <a
                        href={`https://wa.me/${selectedProfile.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-green-600"
                        style={{ color: '#353535' }}
                      >
                        {selectedProfile.whatsapp_number}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                  <Mail className="w-6 h-6" style={{ color: '#3C6E71' }} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${selectedProfile.email}`}
                      className="font-medium hover:underline"
                      style={{ color: '#353535' }}
                    >
                      {selectedProfile.email}
                    </a>
                  </div>
                </div>

                {selectedProfile.cv_path && (
                  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                    <FileText className="w-6 h-6" style={{ color: '#3C6E71' }} />
                    <div>
                      <p className="text-sm text-gray-500">Resume/CV</p>
                      <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/${selectedProfile.cv_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium flex items-center gap-1 hover:underline"
                        style={{ color: '#3C6E71' }}
                      >
                        <Download className="w-4 h-4" />
                        Download CV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Certificates */}
            {selectedProfile.certificates && selectedProfile.certificates.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#353535' }}>
                  <Award className="w-6 h-6" style={{ color: '#3C6E71' }} />
                  Certifications ({selectedProfile.certificates.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedProfile.certificates.map((cert, index) => (
                    <a
                      key={index}
                      href={`${import.meta.env.VITE_BACKEND_URL}/${cert}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg hover:shadow-md transition-all"
                      style={{ backgroundColor: '#D9D9D9' }}
                    >
                      <Award className="w-5 h-5" style={{ color: '#3C6E71' }} />
                      <span className="text-sm font-medium" style={{ color: '#353535' }}>Cert {index + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Search Dashboard
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D9D9D9' }}>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: '#353535' }}>Menu</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Home className="w-5 h-5" style={{ color: '#3C6E71' }} />
              <span style={{ color: '#353535' }}>Home</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/equipment'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Package className="w-5 h-5" style={{ color: '#3C6E71' }} />
              <span style={{ color: '#353535' }}>Equipment for Hire</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/manpower-finder'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{ backgroundColor: '#3C6E71' }}
            >
              <Briefcase className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Find Manpower</span>
            </button>
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-4">Recruiter Dashboard</p>
            <p className="text-sm" style={{ color: '#353535' }}>Find skilled professionals for your projects</p>
          </div>
        </div>
      </div>

      {/* Top Bar with Menu Button */}
      <div className="bg-white shadow-sm border-b" style={{ borderColor: '#3C6E71' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" style={{ color: '#353535' }} />
            </button>

            <div className="flex items-center gap-2">
              <Briefcase className="w-8 h-8" style={{ color: '#3C6E71' }} />
              <h1 className="text-2xl font-bold" style={{ color: '#353535' }}>Recruiter Dashboard</h1>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home className="w-6 h-6" style={{ color: '#353535' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#353535' }}>
            Find the best freelance talent for your next project.
          </h2>
          <p style={{ color: '#353535' }}>Search through our database of skilled professionals</p>
        </div>

        {/* Stats Cards
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: '#3C6E71' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#353535' }}>Total Manpower</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#284B63' }}>{stats.totalManpower}</p>
                </div>
                <Users className="w-12 h-12" style={{ color: '#3C6E71' }} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#353535' }}>With CV</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.manpowerWithCV}</p>
                </div>
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: '#3C6E71' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#353535' }}>Available Now</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#284B63' }}>{stats.availableManpower}</p>
                </div>
                <CheckCircle className="w-12 h-12" style={{ color: '#3C6E71' }} />
              </div>
            </div>
          </div>
        )} */}

        {/* Search Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border" style={{ borderColor: '#3C6E71' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchFilters.jobTitle}
                onChange={(e) => setSearchFilters({ ...searchFilters, jobTitle: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#3C6E71' }}
                onFocus={(e) => e.target.style.borderColor = '#284B63'}
                onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#3C6E71' }}
                onFocus={(e) => e.target.style.borderColor = '#284B63'}
                onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={searchFilters.availabilityStatus}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, availabilityStatus: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all appearance-none"
                style={{ borderColor: '#3C6E71' }}
                onFocus={(e) => e.target.style.borderColor = '#284B63'}
                onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
              >
                <option value="">All Availability</option>
                <option value="available">Available Now</option>
                <option value="busy">Currently Busy</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#3C6E71' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#284B63')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3C6E71')}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            <button
              onClick={handleClear}
              className="px-6 py-3 border rounded-lg font-medium transition-colors"
              style={{ borderColor: '#3C6E71', color: '#353535' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#D9D9D9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && !searched && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border" style={{ borderColor: '#3C6E71' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#353535' }}>Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchFilters({ ...searchFilters, jobTitle: category.name });
                    handleSearch();
                  }}
                  className="p-4 border rounded-lg hover:shadow-md transition-all text-left"
                  style={{ borderColor: '#3C6E71' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#284B63';
                    e.currentTarget.style.backgroundColor = '#D9D9D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3C6E71';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <p className="font-semibold mb-1" style={{ color: '#353535' }}>{category.name}</p>
                  <p className="text-sm" style={{ color: '#353535' }}>{category.count} available</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#3C6E71' }}>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#3C6E71', borderTopColor: '#284B63' }}></div>
                <p style={{ color: '#353535' }}>Searching for manpower...</p>
              </div>
            ) : manpowerList.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#3C6E71' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#353535' }}>
                  No freelancers found matching your criteria.
                </h3>
                <p style={{ color: '#353535' }}>Try adjusting your search filters or keywords</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold" style={{ color: '#353535' }}>
                    Found {manpowerList.length} {manpowerList.length === 1 ? 'profile' : 'profiles'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manpowerList.map((profile) => (
                    <div
                      key={profile.id}
                      className="border rounded-xl p-6 hover:shadow-lg transition-shadow"
                      style={{ borderColor: '#3C6E71' }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {profile.profile_photo ? (
                            <img
                              src={profile.profile_photo}
                              alt={`${profile.first_name} ${profile.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate" style={{ color: '#353535' }}>
                            {profile.first_name} {profile.last_name}
                          </h4>
                          <p className="text-sm font-medium truncate" style={{ color: '#3C6E71' }}>
                            {profile.job_title}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#353535' }}>
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{profile.location}</span>
                        </div>

                        {profile.rate && (
                          <div className="flex items-center gap-2 text-sm" style={{ color: '#353535' }}>
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span>{profile.rate}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        {profile.availability_status === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Busy
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewProfile(profile.id)}
                        className="w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium text-white"
                        style={{ backgroundColor: '#3C6E71' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManpowerFinder;