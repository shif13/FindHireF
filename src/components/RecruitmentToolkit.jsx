import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, Zap, Users, MessageCircle, DollarSign, Briefcase, Mail, Home, ArrowLeft, Linkedin, Github, User, Phone, Star, Award, Clock, Eye, TrendingUp, Code, Database, Layers, BarChart, Settings, Smartphone, Palette, CheckCircle, Send, X, Sparkles, Target, Globe } from 'lucide-react';

const RecruitmentToolkit = () => {
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
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/stats');
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
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/categories');
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
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/jobseekers', {
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

  const handleSkillMatch = async () => {
    if (!skillsInput.trim()) {
      setError('Please enter skills to match');
      return;
    }

    setLoading(true);
    setError('');
   
    try {
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/match-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skillsInput
        }),
      });
     
      const data = await response.json();
      if (response.ok) {
        setCandidates(data.matches || []);
        setSearchType('skills');
        setSearchStats(data.statistics);
      } else {
        setError(data.msg || 'Skill matching failed');
      }
    } catch (error) {
      console.error('Skill match error:', error);
      setError('Network error. Please try again.');
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
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/jobseekers', {
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

  const handleCategorySearch = async (categoryName) => {
    setSearchKeyword(categoryName);
    setLocationSearch('');
    setSelectedFilters({
      experience: '',
      salaryRange: ''
    });
    setLoading(true);
    setError('');
   
    try {
      const response = await fetch('https://projectk-6vkc.onrender.com/api/search/jobseekers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: categoryName,
          location: '',
          experience: '',
          salaryRange: ''
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
      console.error('Category search error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewCandidateDetails = async (candidateId) => {
    try {
      const response = await fetch(`https://projectk-6vkc.onrender.com/api/search/candidate/${candidateId}`);
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
      message: `Hi ${candidate.firstName},\n\nI found your profile on TalentConnect and I'm interested in discussing a potential opportunity that matches your skills.\n\nWould you be available for a brief conversation?\n\nBest regards`
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

      const response = await fetch('https://projectk-6vkc.onrender.com/api/contact/send-email', {
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

  return (
    <div className="min-h-screen bg-gray-50">

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
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                            {candidate.firstName?.[0]}{candidate.lastName?.[0]}
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

        {/* Candidate Details Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
             
              <div className="p-6">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-2xl">
                    {selectedCandidate.firstName?.[0]}{selectedCandidate.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </h3>
                    <p className="text-lg text-gray-600 mb-3">{selectedCandidate.title}</p>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedCandidate.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {selectedCandidate.experience}
                      </div>
                    </div>
                  </div>
                </div>
               
                {selectedCandidate.bio && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-600">{selectedCandidate.bio}</p>
                  </div>
                )}
               
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
               
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCandidate(null);
                      openEmailModal(selectedCandidate);
                    }}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
                  >
                    Send Message
                  </button>
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
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

export default RecruitmentToolkit;