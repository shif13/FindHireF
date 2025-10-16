import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, Zap, Users, MessageCircle, DollarSign, Briefcase, Mail, Home, ArrowLeft, Linkedin, Github, User, Phone, Star, Award, Clock, Eye, TrendingUp, Code, Database, Layers, BarChart, Settings, Smartphone, Palette, CheckCircle, Send, X, Sparkles, Target, Globe, FileText, Download, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const Buff = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    experience: '',
    salaryRange: ''
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [searchStats, setSearchStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [professionalCategories, setProfessionalCategories] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [emailModal, setEmailModal] = useState({ show: false, candidate: null });
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [emailSending, setEmailSending] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  useEffect(() => {
    loadDashboardStats();
    loadProfessionalCategories();
  }, []);

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/search/stats`);
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data);
      }
    } catch (error) {
      console.warn('Failed to load dashboard stats:', error);
    }
  };

  const loadProfessionalCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/search/categories`);
      const data = await response.json();
      if (data.success) {
        setProfessionalCategories(data.categories);
      }
    } catch (error) {
      console.warn('Failed to load professional categories:', error);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'Code': Code,
      'Database': Database,
      'Layers': Layers,
      'BarChart': BarChart,
      'TrendingUp': TrendingUp,
      'Settings': Settings,
      'Smartphone': Smartphone,
      'Palette': Palette,
      'Users': Users,
      'CheckCircle': CheckCircle,
      'User': User
    };
    const IconComponent = iconMap[iconName] || User;
    return <IconComponent className="w-5 h-5" />;
  };

  const handleGeneralSearch = async () => {
    if (!searchKeyword.trim() && !locationSearch.trim() && !selectedFilters.experience) {
      setError('Please enter a search term or select filters');
      return;
    }

    setLoading(true);
    setError('');
   
    try {
      const response = await fetch(`${API_BASE}/api/search/jobseekers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: searchKeyword,
          location: locationSearch,
          ...selectedFilters
        }),
      });
     
      const data = await response.json();
      if (response.ok) {
        setCandidates(data.candidates || []);
        setSearchType('general');
        setSearchStats(data.searchCriteria);
      } else {
        setError(data.msg || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      setError('Please enter a location to search');
      return;
    }

    setLoading(true);
    setError('');
   
    try {
      const response = await fetch(`${API_BASE}/api/search/jobseekers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: locationSearch,
          jobTitle: '',
          ...selectedFilters
        }),
      });
     
      const data = await response.json();
      if (response.ok) {
        setCandidates(data.candidates || []);
        setSearchType('location');
        setSearchStats(data.searchCriteria);
      } else {
        setError(data.msg || 'Location search failed');
      }
    } catch (error) {
      console.error('Location search error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewCandidateDetails = async (candidateId) => {
    try {
      const response = await fetch(`${API_BASE}/api/search/candidate/${candidateId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedCandidate(data.candidate);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    }
  };

  const openEmailModal = (candidate) => {
    setEmailModal({ show: true, candidate });
    setEmailForm({
      subject: `Opportunity: ${candidate.title || 'Professional Role'}`,
      message: `Hi ${candidate.firstName},\n\nI found your profile on ProFetch and I'm interested in discussing a potential opportunity that matches your skills.\n\nWould you be available for a brief conversation?\n\nBest regards`
    });
  };

  const sendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    if (emailForm.subject.length > 200) {
      alert('Subject must be less than 200 characters');
      return;
    }

    if (emailForm.message.length < 10) {
      alert('Message must be at least 10 characters');
      return;
    }

    if (emailForm.message.length > 5000) {
      alert('Message must be less than 5000 characters');
      return;
    }

    setEmailSending(true);
   
    try {
      const token = localStorage.getItem('authToken');
     
      const headers = {
        'Content-Type': 'application/json'
      };
     
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/contact/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          candidateId: emailModal.candidate.id,
          subject: emailForm.subject.trim(),
          message: emailForm.message.trim()
        }),
      });

      const data = await response.json();
     
      if (response.ok && data.success) {
        alert('Email sent successfully! The candidate will receive your message.');
        setEmailModal({ show: false, candidate: null });
        setEmailForm({ subject: '', message: '' });
        console.log('Email sent with ID:', data.messageId);
      } else {
        const errorMsg = data.msg || 'Failed to send email';
        alert(`Error: ${errorMsg}`);
       
        if (response.status === 401) {
          console.log('Authentication required');
        } else if (response.status === 404) {
          alert('Candidate not found. They may have been removed from the platform.');
        } else if (response.status === 400) {
          console.error('Validation error:', errorMsg);
        }
      }
    } catch (error) {
      console.error('Email send error:', error);
     
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to send email. Please try again later.');
      }
    } finally {
      setEmailSending(false);
    }
  };

  const closeEmailModal = () => {
    setEmailModal({ show: false, candidate: null });
    setEmailForm({ subject: '', message: '' });
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setLocationSearch('');
    setSkillsInput('');
    setSelectedFilters({
      experience: '',
      salaryRange: ''
    });
    setCandidates([]);
    setError('');
    setSearchType('general');
    setSearchStats(null);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
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

  const handleViewCV = (candidate) => {
    if (candidate?.cvFilePath) {
      const cleanPath = candidate.cvFilePath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
      const finalUrl = `${API_BASE}/uploads/${cleanPath}`;
      setCurrentDocument({ 
        url: finalUrl, 
        name: `CV - ${candidate.firstName} ${candidate.lastName}.pdf`,
        type: 'cv'
      });
      setShowDocumentModal(true);
    }
  };

  const handleViewCertificate = (candidate, index = 0) => {
    if (candidate?.certificatesPath && candidate.certificatesPath.length > 0) {
      const certPath = candidate.certificatesPath[index];
      const cleanPath = certPath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
      const finalUrl = `${API_BASE}/uploads/${cleanPath}`;
      setCurrentDocument({ 
        url: finalUrl, 
        name: `Certificate ${index + 1} - ${candidate.firstName} ${candidate.lastName}`,
        type: 'certificate'
      });
      setShowDocumentModal(true);
    }
  };

  const handleDownloadDocument = () => {
    if (currentDocument) {
      const link = document.createElement('a');
      link.href = currentDocument.url;
      link.download = currentDocument.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleWhatsAppClick = (phone, candidate) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const message = `Hello ${candidate.firstName}! I found your profile on ProFetch and I'm interested in discussing a potential opportunity.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // Parse certificates safely
  const parseCertificates = (certificatesPath) => {
    let certificates = [];
    try {
      if (certificatesPath) {
        if (typeof certificatesPath === 'string') {
          const trimmed = certificatesPath.trim();
          certificates = (trimmed === '' || trimmed === 'null') ? [] : JSON.parse(trimmed);
        } else if (Array.isArray(certificatesPath)) {
          certificates = certificatesPath;
        }
      }
    } catch (e) {
      console.error('Error parsing certificates:', e);
      certificates = [];
    }
    return certificates;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Document Viewer Modal */}
      {showDocumentModal && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {currentDocument.type === 'cv' ? (
                  <FileText className="w-5 h-5 text-teal-600" />
                ) : (
                  <Award className="w-5 h-5 text-teal-600" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">{currentDocument.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDocument}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setCurrentDocument(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={currentDocument.url}
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <button 
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home size={20} />
              <span className="text-sm font-medium">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <Briefcase className="w-8 h-8 mr-3" />
              Recruiter Dashboard
            </h1>
            <p className="text-gray-600">
              Find the best freelance talent for your next project.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Main Search Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            {/* Search Inputs */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                  placeholder="Search by name or skill..."
                  onKeyPress={(e) => e.key === 'Enter' && handleGeneralSearch()}
                />
              </div>
             
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                  placeholder="Filter by location..."
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGeneralSearch}
                disabled={loading}
                className={`bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
             
              <button
                onClick={clearSearch}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {candidates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No freelancers found matching your criteria.</h3>
                <p className="text-gray-500">
                  Try adjusting your search filters or keywords
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div key={candidate.id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-lg ${getUserColor(candidate.firstName, candidate.lastName)}`}>
                            {getUserInitials(candidate.firstName, candidate.lastName)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            candidate.availability === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                        </div>
                       
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            {candidate.matchScore && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMatchScoreColor(candidate.matchScore)}`}>
                                {candidate.matchScore}% Match
                              </span>
                            )}
                          </div>
                         
                          <p className="text-gray-700 mb-3 font-medium">
                            {candidate.title || 'Professional'}
                          </p>
                         
                          <div className="grid md:grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {candidate.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2" />
                              {candidate.experience || 'Experience not specified'}
                            </div>
                          </div>
                         
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {candidate.skills.slice(0, 6).map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 6 && (
                                <span className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600">
                                  +{candidate.skills.length - 6} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                     
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => openEmailModal(candidate)}
                          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium text-sm whitespace-nowrap"
                        >
                          Contact
                        </button>
                        <button
                          onClick={() => viewCandidateDetails(candidate.id)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm whitespace-nowrap"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Modal */}
        {emailModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      To: {emailModal.candidate?.firstName} {emailModal.candidate?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={closeEmailModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
             
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      placeholder="Enter subject..."
                    />
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                      rows="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
                      placeholder="Write your message..."
                    />
                  </div>
                 
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeEmailModal}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      disabled={emailSending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendEmail}
                      disabled={emailSending || !emailForm.subject.trim() || !emailForm.message.trim()}
                      className={`px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 ${
                        emailSending || !emailForm.subject.trim() || !emailForm.message.trim()
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {emailSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Candidate Details Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 shadow-xl">
              {/* Modal Header with Gradient */}
              <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold border-8 border-white shadow-xl ${getUserColor(selectedCandidate.firstName, selectedCandidate.lastName)}`}>
                    {getUserInitials(selectedCandidate.firstName, selectedCandidate.lastName)}
                  </div>
                </div>
              </div>
             
              {/* Profile Info */}
              <div className="pt-20 pb-6 px-8 text-center border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </h2>
                <p className="text-xl text-gray-600 mb-4">{selectedCandidate.title || 'Professional'}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
                  {selectedCandidate.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span>{selectedCandidate.location}</span>
                    </div>
                  )}
                  
                  {selectedCandidate.availability && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className={selectedCandidate.availability === 'available' ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                        {selectedCandidate.availability === 'available' ? 'Available Now' : 'Currently Busy'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Salary */}
                {selectedCandidate.expectedSalary && (
                  <div className="text-3xl font-bold text-teal-600 mb-6">
                    {selectedCandidate.salaryCurrency === 'USD' && '$'}
                    {selectedCandidate.salaryCurrency === 'INR' && '₹'}
                    {selectedCandidate.salaryCurrency === 'EUR' && '€'}
                    {selectedCandidate.salaryCurrency === 'GBP' && '£'}
                    {selectedCandidate.salaryCurrency === 'SAR' && 'SR '}
                    {selectedCandidate.salaryCurrency === 'AED' && 'د.إ '}
                    {selectedCandidate.expectedSalary}/yr
                  </div>
                )}

                {/* Document Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {selectedCandidate.cvFilePath && (
                    <button
                      onClick={() => handleViewCV(selectedCandidate)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      View CV
                    </button>
                  )}
                  
                  {(() => {
                    const certificates = parseCertificates(selectedCandidate.certificatesPath);
                    if (certificates.length > 0) {
                      return certificates.length === 1 ? (
                        <button
                          onClick={() => handleViewCertificate(selectedCandidate, 0)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                        >
                          <Award className="w-5 h-5" />
                          View Certificate
                        </button>
                      ) : (
                        certificates.map((cert, index) => (
                          <button
                            key={index}
                            onClick={() => handleViewCertificate(selectedCandidate, index)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                          >
                            <Award className="w-5 h-5" />
                            Certificate {index + 1}
                          </button>
                        ))
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Details Section */}
              <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  
                  {selectedCandidate.phone && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <button
                        onClick={() => handleWhatsAppClick(selectedCandidate.phone, selectedCandidate)}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-xs text-gray-500 group-hover:text-green-600">WhatsApp</p>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">{selectedCandidate.phone}</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handlePhoneClick(selectedCandidate.phone)}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-xs text-gray-500 group-hover:text-blue-600">Phone</p>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{selectedCandidate.phone}</p>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {selectedCandidate.email && (
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        openEmailModal(selectedCandidate);
                      }}
                      className="w-full flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer group"
                    >
                      <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs text-gray-500 group-hover:text-teal-600">Email</p>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 break-all">{selectedCandidate.email}</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Experience & Bio */}
                {(selectedCandidate.experience || selectedCandidate.bio) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {selectedCandidate.experience && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Experience
                        </h3>
                        <p className="text-lg text-gray-900">{selectedCandidate.experience}</p>
                      </div>
                    )}
                    
                    {selectedCandidate.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Professional Bio
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedCandidate.bio}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Section */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Section */}
                {selectedCandidate.availableFrom && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock className="w-5 h-5" />
                      <p className="text-sm font-medium">
                        Available from: {new Date(selectedCandidate.availableFrom).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons at Bottom */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const candidate = selectedCandidate;
                      setSelectedCandidate(null);
                      openEmailModal(candidate);
                    }}
                    className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Message
                  </button>
                  
                  {selectedCandidate.phone && (
                    <button
                      onClick={() => handleWhatsAppClick(selectedCandidate.phone, selectedCandidate)}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buff;