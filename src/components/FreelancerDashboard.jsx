import React, { useState, useEffect } from 'react';
import { 
  User, Save, X, Upload, FileText, Award, LogOut, 
  AlertCircle, CheckCircle, MessageCircle, Loader, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewSystem from '../components/ReviewComponent';

const FreelancerDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
 
  const [files, setFiles] = useState({
    cvFile: null,
    certificateFiles: []
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  
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
    availableFrom: '',
    cvFilePath: '',
    certificatesPath: []
  });

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
    USD: ['20,000 - 40,000', '40,000 - 60,000', '60,000 - 80,000', '80,000 - 100,000', '100,000+'],
    INR: ['3,00,000 - 5,00,000', '5,00,000 - 8,00,000', '8,00,000 - 12,00,000', '12,00,000+'],
    EUR: ['25,000 - 40,000', '40,000 - 55,000', '55,000 - 70,000', '70,000+'],
    GBP: ['20,000 - 35,000', '35,000 - 50,000', '50,000 - 65,000', '65,000+'],
    SAR: ['72,000 - 120,000', '120,000 - 180,000', '180,000 - 240,000', '240,000+'],
    AED: ['72,000 - 120,000', '120,000 - 180,000', '180,000 - 240,000', '240,000+']
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/api/freelancer/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);

        if (!data.profile || !data.profile.title) {
          setIsEditing(true);
        }

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
          availableFrom: data.profile?.availableFrom || '',
          cvFilePath: data.profile?.cvFilePath || '',
          certificatesPath: Array.isArray(data.profile?.certificatesPath) 
            ? data.profile.certificatesPath 
            : []
        });
      } else {
        setError(data.msg || 'Failed to fetch profile');
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
    setError('');
    setSuccess('');
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('CV file must be less than 5MB');
      e.target.value = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('CV must be a PDF file');
      e.target.value = '';
      return;
    }

    setFiles(prev => ({ ...prev, cvFile: file }));
    setError('');
    setSuccess('CV selected! Save profile to upload.');
  };

  const handleCertificatesUpload = (e) => {
    const fileArray = Array.from(e.target.files);
    if (fileArray.length === 0) return;

    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError('Total certificate files must be less than 10MB');
      e.target.value = '';
      return;
    }

    const invalidFiles = fileArray.filter(
      file => !['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    );
    
    if (invalidFiles.length > 0) {
      setError('Only PDF, JPG, and PNG files are allowed');
      e.target.value = '';
      return;
    }

    setFiles(prev => ({ ...prev, certificateFiles: fileArray }));
    setError('');
    setSuccess(`${fileArray.length} certificate(s) selected! Save profile to upload.`);
  };

  const handleDeleteCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificatesPath: prev.certificatesPath.filter((_, i) => i !== index)
    }));
  };

 // Add this enhanced logging to your handleSubmit function in FreelancerDashboard.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.firstName || !formData.lastName || !formData.userName || !formData.email) {
    setError('Please fill all required fields');
    return;
  }

  if (!formData.title) {
    setError('Job title is required');
    return;
  }

  try {
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();

    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'certificatesPath') {
        formDataToSend.append('existingCertificates', JSON.stringify(formData[key]));
        console.log('📜 Sending existing certificates:', formData[key]);
      } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // 🔍 DEBUG: Log file uploads
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('CV File:', files.cvFile);
    console.log('Certificate Files:', files.certificateFiles);
    console.log('Certificate Files Count:', files.certificateFiles?.length || 0);

    // Add CV file
    if (files.cvFile) {
      formDataToSend.append('cvFile', files.cvFile);
      console.log('✅ CV file appended to FormData:', files.cvFile.name);
    } else {
      console.log('ℹ️ No new CV file to upload');
    }
    
    // Add certificate files
    if (files.certificateFiles && files.certificateFiles.length > 0) {
      console.log(`📦 Appending ${files.certificateFiles.length} certificate file(s)`);
      files.certificateFiles.forEach((file, index) => {
        formDataToSend.append('certificateFiles', file);
        console.log(`  ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('ℹ️ No new certificate files to upload');
    }

    // 🔍 DEBUG: Log all FormData entries
    console.log('=== FORMDATA CONTENTS ===');
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, value.name, `(${(value.size / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.log('========================');

    const response = await fetch(`${API_BASE}/api/freelancer/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // DON'T set Content-Type - let browser set it with boundary
      },
      body: formDataToSend
    });

    const data = await response.json();

    if (data.success) {
      setSuccess('✅ Profile saved successfully!');
      setIsEditing(false);
      setFiles({ cvFile: null, certificateFiles: [] });
      
      // Clear file inputs
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      
      await fetchProfile();
    } else {
      setError(data.msg || 'Failed to save profile');
    }
  } catch (err) {
    console.error('❌ Save error:', err);
    setError('Network error. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Freelancer Dashboard</h1>
              <p className="text-sm text-gray-600">
                {profile && profile.title ? `Welcome back, ${user?.firstName}` : 'Complete your profile to get started'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile && profile.title && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-4 h-4" />
                Reviews
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {isEditing ? (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {profile && profile.title ? 'Edit Your Profile' : 'Create Your Professional Profile'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., +966 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Jubail, Saudi Arabia"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Safety Officer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select range</option>
                          {salaryRangesByCurrency[formData.salaryCurrency].map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <span className="text-sm">Available Now</span>
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
                          <span className="text-sm">Currently Busy</span>
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
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell us about your professional experience and skills..."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">{formData.bio.length}/1000</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Documents</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV (PDF, max 5MB)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleCVUpload}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload CV
                        </span>
                      </label>
                      
                      {files.cvFile && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700 flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            {files.cvFile.name} ({(files.cvFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                      
                      {formData.cvFilePath && !files.cvFile && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Current CV uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificates (PDF/Images, max 10MB total)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={handleCertificatesUpload}
                        className="hidden"
                        id="cert-upload"
                      />
                      <label htmlFor="cert-upload" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload certificates
                        </span>
                      </label>
                      
                      {files.certificateFiles.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700">
                            {files.certificateFiles.length} new certificate(s) selected
                          </p>
                        </div>
                      )}
                      
                      {formData.certificatesPath.length > 0 && files.certificateFiles.length === 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-green-600">
                            {formData.certificatesPath.length} certificate(s) already uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {formData.certificatesPath.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Certificates:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.certificatesPath.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <a 
                            href={`${API_BASE}/${cert}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate flex-1"
                          >
                            Certificate {index + 1}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(index)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Saving...' : (profile && profile.title ? 'Save Changes' : 'Create Profile')}
                </button>
                
                {profile && profile.title && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    disabled={saving}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
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
                    <p className="text-lg text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p className="text-lg text-gray-900">{user?.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Professional Profile</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                      <p className="text-lg text-gray-900">{profile?.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Experience Level</label>
                      <p className="text-lg text-gray-900">{profile?.experience || 'Not specified'}</p>
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
                        {profile?.expectedSalary ? `${profile.expectedSalary} ${profile.salaryCurrency}` : 'Not specified'}
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
                          {profile?.availability === 'available' ? 'Available Now' : 'Currently Busy'}
                        </span>
                      </p>
                      {profile?.availability === 'busy' && profile?.availableFrom && (
                        <p className="text-sm text-gray-600 mt-1">
                          Available from: {new Date(profile.availableFrom).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">CV/Resume</label>
                    {formData.cvFilePath ? (
                      <a 
                        href={`${API_BASE}/${formData.cvFilePath}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700 font-medium text-sm">View CV</span>
                      </a>
                    ) : (
                      <p className="text-gray-400 italic p-3 bg-gray-50 rounded text-sm">No CV uploaded</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Certificates</label>
                    {formData.certificatesPath.length > 0 ? (
                      <div className="space-y-2">
                        {formData.certificatesPath.map((cert, index) => (
                          <a
                            key={index}
                            href={`${API_BASE}/${cert}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                          >
                            <Award className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 font-medium text-sm">Certificate {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic p-3 bg-gray-50 rounded text-sm">No certificates uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReviewModal && (
        <ReviewSystem 
          isModal={true}
          onClose={() => setShowReviewModal(false)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default FreelancerDashboard;