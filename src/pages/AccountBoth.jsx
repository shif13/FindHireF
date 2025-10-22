import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, MapPin, DollarSign, Phone, MessageSquare, FileText, Upload, Camera, Award, CheckCircle, Clock, Calendar, Building2, AlertCircle } from 'lucide-react';

const AccountBoth = () => {
  const [activeTab, setActiveTab] = useState('common');
  
  const [formData, setFormData] = useState({
    // Common fields (Tab 1)
    name: '',
    email: '',
    password: '',
    location: '',
    mobileNumber: '',
    whatsappNumber: '',
    
    // Manpower fields (Tab 2)
    jobTitle: '',
    availabilityStatus: 'available',
    availableFrom: '',
    rate: '',
    profileDescription: '',
    
    // Equipment fields (Tab 3)
    companyName: ''
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    cv: null,
    certificates: []
  });

  const [fileNames, setFileNames] = useState({
    profilePhoto: '',
    cv: '',
    certificates: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Track which profiles are enabled
  const [hasManpowerProfile, setHasManpowerProfile] = useState(false);
  const [hasEquipmentProfile, setHasEquipmentProfile] = useState(false);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = e.target.files;
    
    if (type === 'profilePhoto' && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, profilePhoto: selectedFiles[0] }));
      setFileNames(prev => ({ ...prev, profilePhoto: selectedFiles[0].name }));
      setPhotoPreview(URL.createObjectURL(selectedFiles[0]));
    } else if (type === 'cv' && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, cv: selectedFiles[0] }));
      setFileNames(prev => ({ ...prev, cv: selectedFiles[0].name }));
    } else if (type === 'certificates') {
      const filesArray = Array.from(selectedFiles);
      setFiles(prev => ({ ...prev, certificates: filesArray }));
      setFileNames(prev => ({ 
        ...prev, 
        certificates: `${filesArray.length} file(s) selected` 
      }));
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Check if at least one profile is enabled
    if (!hasManpowerProfile && !hasEquipmentProfile) {
      setError('Please enable at least one profile (Freelancer or Equipment Owner)');
      return;
    }

    // Common field validation
    if (!formData.name || !formData.email || !formData.password || 
        !formData.mobileNumber || !formData.location) {
      setError('Please fill in all required common fields in the Common Info tab');
      setActiveTab('common');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setActiveTab('common');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setActiveTab('common');
      return;
    }

    if (formData.mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      setActiveTab('common');
      return;
    }

    // Manpower validation (if enabled)
    if (hasManpowerProfile) {
      if (!formData.jobTitle) {
        setError('Please enter job title for freelancer profile');
        setActiveTab('freelancer');
        return;
      }
      if (formData.availabilityStatus === 'busy' && !formData.availableFrom) {
        setError('Please select when you will be available');
        setActiveTab('freelancer');
        return;
      }
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append('hasManpowerProfile', hasManpowerProfile);
      formDataToSend.append('hasEquipmentProfile', hasEquipmentProfile);

      if (files.profilePhoto) {
        formDataToSend.append('profilePhoto', files.profilePhoto);
      }
      if (files.cv) {
        formDataToSend.append('cv', files.cv);
      }
      if (files.certificates.length > 0) {
        files.certificates.forEach(file => {
          formDataToSend.append('certificates', file);
        });
      }

      const response = await fetch(`${API_BASE}/both/signup`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Cannot connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Your Account</h1>
          <p className="text-gray-600 text-lg">Set up your professional profiles</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Please enable at least one profile type below to create your account
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('common')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'common'
                  ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Common Info
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'freelancer'
                  ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5 inline-block mr-2" />
              Freelancer Profile
              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                hasManpowerProfile ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {hasManpowerProfile ? 'Enabled' : 'Disabled'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'equipment'
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Equipment Owner
              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                hasEquipmentProfile ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {hasEquipmentProfile ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          <div className="p-8">
            {/* Tab 1: Common Information */}
            {activeTab === 'common' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Information</h2>
                <p className="text-sm text-gray-600 mb-6">This information will be shared across both profiles</p>

                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Photo
                  </label>
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-600 bg-gray-100">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-teal-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-teal-700 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profilePhoto')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This photo will be used for all profiles</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Saudi Arabia, Jubail"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Mobile & WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave blank to use mobile</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Freelancer Profile */}
            {activeTab === 'freelancer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Freelancer Profile</h2>
                    <p className="text-sm text-gray-600 mt-1">Showcase your skills and find work</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Enable this profile</span>
                    <input
                      type="checkbox"
                      checked={hasManpowerProfile}
                      onChange={(e) => setHasManpowerProfile(e.target.checked)}
                      className="w-6 h-6 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>

                {hasManpowerProfile ? (
                  <div className="space-y-6">
                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          placeholder="e.g., Electrician, Welder"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Availability
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'available', availableFrom: '' }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.availabilityStatus === 'available'
                              ? 'border-teal-600 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <CheckCircle className={`w-5 h-5 mb-1 ${
                            formData.availabilityStatus === 'available' ? 'text-teal-600' : 'text-gray-400'
                          }`} />
                          <div className="text-xs font-medium">Available Now</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'busy' }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.availabilityStatus === 'busy'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Clock className={`w-5 h-5 mb-1 ${
                            formData.availabilityStatus === 'busy' ? 'text-orange-500' : 'text-gray-400'
                          }`} />
                          <div className="text-xs font-medium">Busy</div>
                        </button>
                      </div>
                    </div>

                    {formData.availabilityStatus === 'busy' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available From
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            name="availableFrom"
                            value={formData.availableFrom}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="rate"
                          value={formData.rate}
                          onChange={handleChange}
                          placeholder="e.g., $50/hr"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="profileDescription"
                        value={formData.profileDescription}
                        onChange={handleChange}
                        placeholder="Tell us about your experience..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    {/* Files */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CV</label>
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange(e, 'cv')}
                            className="hidden"
                          />
                          <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-teal-500 transition-colors text-center h-20 flex flex-col items-center justify-center">
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-600 truncate w-full px-1">
                              {fileNames.cv || 'Choose CV'}
                            </p>
                          </div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certificates</label>
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'certificates')}
                            className="hidden"
                          />
                          <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-teal-500 transition-colors text-center h-20 flex flex-col items-center justify-center">
                            <Award className="w-5 h-5 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-600 truncate w-full px-1">
                              {fileNames.certificates || 'Choose Files'}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Freelancer profile is disabled</p>
                    <p className="text-xs text-gray-400">Enable the profile using the toggle above</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Equipment Owner Profile */}
            {activeTab === 'equipment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Owner Profile</h2>
                    <p className="text-sm text-gray-600 mt-1">List your equipment for rent</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Enable this profile</span>
                    <input
                      type="checkbox"
                      checked={hasEquipmentProfile}
                      onChange={(e) => setHasEquipmentProfile(e.target.checked)}
                      className="w-6 h-6 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                  </label>
                </div>

                {hasEquipmentProfile ? (
                  <div className="space-y-6">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name (Optional)
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g., ACME Equipment Rentals"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        Your equipment listings can be added after account creation from your dashboard.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Equipment owner profile is disabled</p>
                    <p className="text-xs text-gray-400">Enable the profile using the toggle above</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBoth;