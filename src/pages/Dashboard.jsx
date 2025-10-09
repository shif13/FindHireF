import React, { useState, useEffect } from 'react';
import { 
  User, Save, X, Upload, FileText, Award, MapPin, Phone, Mail, 
  Briefcase, DollarSign, Calendar, CheckCircle, AlertCircle, 
  Loader, Home, MessageCircle, Star
} from 'lucide-react';
import ReviewSystem from '../components/ReviewComponent';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showReviews, setShowReviews] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    experience: '',
    expectedSalary: '',
    salaryCurrency: 'USD',
    bio: '',
    availability: 'available',
    availableFrom: ''
  });
  
  const [files, setFiles] = useState({
    cvFile: null,
    certificateFiles: []
  });

  const API_BASE = 'https://projectk-6vkc.onrender.com/api';

  const experienceOptions = [
    'Entry Level (0-1 years)',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-8 years)',
    'Lead/Expert (8+ years)'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
  ];

  const salaryRangesByCurrency = {
    USD: ['20,000 - 40,000', '40,000 - 60,000', '60,000 - 80,000', '80,000 - 100,000', '100,000 - 150,000', '150,000+'],
    INR: ['3,00,000 - 5,00,000', '5,00,000 - 8,00,000', '8,00,000 - 12,00,000', '12,00,000 - 18,00,000', '18,00,000 - 25,00,000', '25,00,000+'],
    EUR: ['25,000 - 40,000', '40,000 - 55,000', '55,000 - 70,000', '70,000 - 90,000', '90,000 - 120,000', '120,000+'],
    GBP: ['20,000 - 35,000', '35,000 - 50,000', '50,000 - 65,000', '65,000 - 85,000', '85,000 - 110,000', '110,000+'],
    SAR: ['72,000 - 120,000', '120,000 - 180,000', '180,000 - 240,000', '240,000 - 300,000', '300,000 - 400,000', '400,000+'],
    AED: ['72,000 - 120,000', '120,000 - 180,000', '180,000 - 240,000', '240,000 - 300,000', '300,000 - 400,000', '400,000+']
  };

  const salaryRanges = salaryRangesByCurrency[formData.salaryCurrency] || salaryRangesByCurrency.USD;

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          errors[name] = 'This field is required';
        } else if (value.trim().length < 1) {
          errors[name] = 'Must be at least 1 character';
        } else if (value.trim().length > 50) {
          errors[name] = 'Must be less than 50 characters';
        } else {
          delete errors[name];
        }
        break;
      
      case 'userName':
        if (!value.trim()) {
          errors[name] = 'Username is required';
        } else if (value.length < 3) {
          errors[name] = 'Username must be at least 3 characters';
        } else if (value.length > 30) {
          errors[name] = 'Username must be less than 30 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors[name] = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete errors[name];
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors[name] = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors[name] = 'Please enter a valid email address';
        } else {
          delete errors[name];
        }
        break;
      
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      
      if (!token) {
        setError('Please log in to access your dashboard');
        return;
      }

      const response = await fetch(`${API_BASE}/dashboard/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);

        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          userName: data.user.userName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          title: data.profile?.title || '',
          experience: data.profile?.experience || '',
          expectedSalary: data.profile?.expectedSalary || '',
          salaryCurrency: data.profile?.salaryCurrency || 'USD',
          bio: data.profile?.bio || '',
          availability: data.profile?.availability || 'available',
          availableFrom: data.profile?.availableFrom || ''
        });
      } else {
        setError(data.msg || 'Failed to fetch profile');
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
    
    if (['firstName', 'lastName', 'userName', 'email'].includes(name)) {
      setTimeout(() => validateField(name, value), 300);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (name === 'cvFile') {
      const file = fileList[0];
      if (file && file.size > 5 * 1024 * 1024) {
        setError('CV file must be less than 5MB');
        return;
      }
      setFiles(prev => ({ ...prev, cvFile: file }));
    } else if (name === 'certificateFiles') {
      const fileArray = Array.from(fileList);
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        setError('Total certificate files must be less than 10MB');
        return;
      }
      setFiles(prev => ({ ...prev, certificateFiles: fileArray }));
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = getAuthToken();
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (files.cvFile) {
        formDataToSend.append('cvFile', files.cvFile);
      }
      if (files.certificateFiles.length > 0) {
        files.certificateFiles.forEach(file => {
          formDataToSend.append('certificateFiles', file);
        });
      }

      const response = await fetch(`${API_BASE}/dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
        setFiles({ cvFile: null, certificateFiles: [] });
        setValidationErrors({});
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      } else {
        setError(data.msg || 'Failed to update profile');
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFiles({ cvFile: null, certificateFiles: [] });
    setValidationErrors({});
    setError('');
    setSuccess('');
    fetchProfile();
    document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const navigateToHome = () => {
    window.location.href = '/';
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:border-transparent transition-colors";
    if (validationErrors[fieldName]) {
      return `${baseClass} border-red-300 focus:ring-red-500 bg-red-50`;
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Access Denied</h2>
          <p className="text-gray-600 text-center mb-8">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={navigateToHome}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Go to Home"
              >
                <Home className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.availability === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile?.availability === 'available' ? 'Available' : 'Busy'}
              </span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Success</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Edit Your Profile</h2>
              <p className="text-gray-600">Update your information and preferences</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={getInputClassName('firstName')}
                      placeholder="Enter your first name"
                      required
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={getInputClassName('lastName')}
                      placeholder="Enter your last name"
                      required
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className={getInputClassName('userName')}
                      placeholder="Choose a unique username"
                      required
                    />
                    {validationErrors.userName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.userName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={getInputClassName('email')}
                      placeholder="Enter your email address"
                      required
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Safety Officer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience level</option>
                      {experienceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <select
                          name="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select salary range</option>
                          {salaryRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>{currency.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Availability</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="availability"
                            value="available"
                            checked={formData.availability === 'available'}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Available Now</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="availability"
                            value="busy"
                            checked={formData.availability === 'busy'}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Currently Busy</span>
                        </label>
                      </div>
                      {formData.availability === 'busy' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Available From</label>
                          <input
                            type="date"
                            name="availableFrom"
                            value={formData.availableFrom}
                            onChange={handleInputChange}
                            min={getTodayDate()}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      maxLength="1000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Share your professional story..."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.bio.length}/1000</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Documents</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV (PDF, max 5MB)</label>
                    <input
                      type="file"
                      name="cvFile"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.cvFile && (
                      <p className="mt-2 text-sm text-gray-600">Selected: {files.cvFile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificates (PDF, JPG, PNG, max 10MB total)</label>
                    <input
                      type="file"
                      name="certificateFiles"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.certificateFiles.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        {files.certificateFiles.length} file{files.certificateFiles.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={updateProfile}
                  disabled={saving || Object.keys(validationErrors).length > 0}
                  className={`flex-1 py-3 px-6 rounded text-white font-medium transition-colors ${
                    saving || Object.keys(validationErrors).length > 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-lg text-gray-900">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                    <p className="text-lg text-gray-900">@{user?.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-lg text-gray-900 break-all">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-lg text-gray-900">{user?.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p className="text-lg text-gray-900">{user?.location || <span className="text-gray-400 italic">Not provided</span>}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Profile</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                      <p className="text-lg text-gray-900">{profile?.title || <span className="text-gray-400 italic">Not specified</span>}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Experience Level</label>
                      <p className="text-lg text-gray-900">{profile?.experience || <span className="text-gray-400 italic">Not specified</span>}</p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Professional Bio</label>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Expected Salary</label>
                      <p className="text-lg text-gray-900">
                        {profile?.expectedSalary ? `${profile.expectedSalary} ${profile.salaryCurrency || 'USD'}` : <span className="text-gray-400 italic">Not specified</span>}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Availability</label>
                      <p className="text-lg">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile?.availability === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile?.availability === 'available' ? 'Available' : 'Currently Busy'}
                        </span>
                      </p>
                      {profile?.availability === 'busy' && profile?.availableFrom && (
                        <p className="text-sm text-gray-600 mt-1">Available from: {new Date(profile.availableFrom).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">CV/Resume</label>
                    {profile?.cvFilePath ? (
                      <a 
                        href={`https://projectk-6vkc.onrender.com/${profile.cvFilePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700 font-medium">View CV</span>
                      </a>
                    ) : (
                      <p className="text-gray-400 italic p-3 bg-gray-50 rounded">No CV uploaded</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Certificates</label>
                    {(() => {
                      try {
                        const certs = profile?.certificatesPath 
                          ? (typeof profile.certificatesPath === 'string' 
                              ? JSON.parse(profile.certificatesPath) 
                              : profile.certificatesPath)
                          : [];
                        
                        return Array.isArray(certs) && certs.length > 0 ? (
                          <div className="space-y-2">
                            {certs.map((cert, index) => (
                              <a 
                                key={index} 
                                href={`https://projectk-6vkc.onrender.com/${cert}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                              >
                                <Award className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 font-medium">Certificate {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic p-3 bg-gray-50 rounded">No certificates uploaded</p>
                        );
                      } catch (error) {
                        console.error('Error parsing certificates:', error);
                        return <p className="text-gray-400 italic p-3 bg-gray-50 rounded">No certificates uploaded</p>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Reviews Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  Help others by sharing your experience with ProFetch
                </p>
                
                <button
                  onClick={() => setShowReviews(true)}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  <span>Write Review</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Modal */}
        {showReviews && (
          <ReviewSystem
            isModal={true}
            onClose={() => setShowReviews(false)}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;