import React, { useState } from 'react';
import { 
  User, Mail, Lock, Briefcase, MapPin, DollarSign, 
  Phone, MessageSquare, FileText, Upload, Camera, 
  Award, Eye, EyeOff, X, Building2, Users, Search
} from 'lucide-react';

const SignupBoth = () => {
  const [activeTab, setActiveTab] = useState('freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common fields
  const [commonData, setCommonData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    mobileNumber: ''
  });

  // Manpower specific fields
  const [manpowerData, setManpowerData] = useState({
    jobTitle: '',
    rate: '',
    whatsappNumber: '',
    profileDescription: ''
  });

  // Equipment owner specific fields
  const [equipmentData, setEquipmentData] = useState({
    company_name: '',
    whatsapp_number: ''
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    cv: null,
    certificates: []
  });

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManpowerChange = (e) => {
    const { name, value } = e.target;
    setManpowerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setEquipmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    if (fileType === 'certificates') {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => ({
        ...prev,
        certificates: [...prev.certificates, ...newFiles]
      }));
    } else {
      const file = e.target.files[0];
      if (file) {
        setFiles(prev => ({
          ...prev,
          [fileType]: file
        }));
      }
    }
  };

  const removeCertificate = (index) => {
    setFiles(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (commonData.password !== commonData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (commonData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!commonData.fullName || !commonData.email || !commonData.password || !commonData.mobileNumber || !commonData.location) {
      setError('Please fill in all required common fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append common fields
      formDataToSend.append('fullName', commonData.fullName);
      formDataToSend.append('email', commonData.email);
      formDataToSend.append('password', commonData.password);
      formDataToSend.append('mobileNumber', commonData.mobileNumber);
      formDataToSend.append('location', commonData.location);

      // Append manpower data as JSON
      const manpowerPayload = {
        jobTitle: manpowerData.jobTitle || null,
        rate: manpowerData.rate || null,
        whatsappNumber: manpowerData.whatsappNumber || commonData.mobileNumber,
        profileDescription: manpowerData.profileDescription || null
      };
      formDataToSend.append('manpowerData', JSON.stringify(manpowerPayload));

      // Append equipment data as JSON
      const equipmentPayload = {
        company_name: equipmentData.company_name || null,
        whatsapp_number: equipmentData.whatsapp_number || commonData.mobileNumber
      };
      formDataToSend.append('equipmentData', JSON.stringify(equipmentPayload));

      // Append files
      if (files.profilePhoto) {
        formDataToSend.append('profilePhoto', files.profilePhoto);
      }
      
      if (files.cv) {
        formDataToSend.append('cv', files.cv);
      }
      
      if (files.certificates.length > 0) {
        files.certificates.forEach(cert => {
          formDataToSend.append('certificates', cert);
        });
      }

      const response = await fetch(`${API_BASE}/both/signup`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Account created successfully for both roles! Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Failed to create account');
      }

    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent default form submission
    handleSubmit(e);    // Call your existing submit logic
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
    
      {/* Main Content */}
      <div className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Tabs Header */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('freelancer')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                    activeTab === 'freelancer'
                      ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Freelancer Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('equipment')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                    activeTab === 'equipment'
                      ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  Equipment Listing
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Profile
                </h1>
                <p className="text-gray-600">
                  Register as both a freelancer and equipment owner. Fill in the common details and switch between tabs for role-specific information.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <div className="space-y-6" onSubmit={handleSubmit}>
                {/* Common Fields - Always Visible */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Common Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Full Name & Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="fullName"
                            value={commonData.fullName}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Max Robinson"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={commonData.email}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="m@example.com"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={commonData.password}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="••••••••"
                            required
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            onKeyDown={handleKeyDown}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={commonData.confirmPassword}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="••••••••"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location & Mobile */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="location"
                            value={commonData.location}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., Saudi Arabia, Jubail"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={commonData.mobileNumber}
                            onChange={handleCommonChange}
                            onKeyDown={handleKeyDown}
                            placeholder="+1234567890"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab-specific Content */}
                {activeTab === 'freelancer' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      Freelancer Details
                    </h2>

                    {/* Job Title & Rate */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role / Job Title
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="jobTitle"
                            value={manpowerData.jobTitle}
                            onChange={handleManpowerChange}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., Heavy Equipment Operator"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="rate"
                            value={manpowerData.rate}
                            onChange={handleManpowerChange}
                            onKeyDown={handleKeyDown}
                            placeholder="$50/hr"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={manpowerData.whatsappNumber}
                          onChange={handleManpowerChange}
                          onKeyDown={handleKeyDown}
                          placeholder="+1234567890"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Profile Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Description
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          name="profileDescription"
                          value={manpowerData.profileDescription}
                          onChange={handleManpowerChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Tell us about your experience and skills..."
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* File Uploads */}
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'profilePhoto')}
                            onKeyDown={handleKeyDown}
                            className="hidden"
                            id="profilePhoto"
                          />
                          <label
                            htmlFor="profilePhoto"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <Camera className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">
                              {files.profilePhoto ? files.profilePhoto.name.substring(0, 10) + '...' : 'Choose File'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload CV
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange(e, 'cv')}
                            onKeyDown={handleKeyDown}
                            className="hidden"
                            id="cv"
                          />
                          <label
                            htmlFor="cv"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">
                              {files.cv ? files.cv.name.substring(0, 10) + '...' : 'Choose File'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificates
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={(e) => handleFileChange(e, 'certificates')}
                            onKeyDown={handleKeyDown}
                            className="hidden"
                            id="certificates"
                          />
                          <label
                            htmlFor="certificates"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <Award className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {files.certificates.length > 0 ? `${files.certificates.length} file(s)` : 'Choose File'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Certificate List */}
                      {files.certificates.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Selected Certificates:</p>
                          {files.certificates.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600 truncate flex-1">{cert.name}</span>
                              <button
                                type="button"
                                onClick={() => removeCertificate(index)}
                                onKeyDown={handleKeyDown}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'equipment' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-teal-600" />
                      Equipment Owner Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="company_name"
                            value={equipmentData.company_name}
                            onChange={handleEquipmentChange}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., ACME Rentals"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp Number
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="whatsapp_number"
                            value={equipmentData.whatsapp_number}
                            onChange={handleEquipmentChange}
                            onKeyDown={handleKeyDown}
                            placeholder="+1234567890"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You can add your equipment listings after completing the registration process.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SignupBoth;