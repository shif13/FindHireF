import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, MapPin, DollarSign, Phone, MessageSquare, FileText, Upload, Camera, Award, CheckCircle, Clock, Calendar } from 'lucide-react';

const AccountManpower = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    availabilityStatus: 'available',
    availableFrom: '',
    location: '',
    rate: '',
    mobileNumber: '',
    whatsappNumber: '',
    profileDescription: ''
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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const formElements = [
        'firstName',
        'lastName',
        'email',
        'password',
        'jobTitle',
        'availableFrom',
        'location',
        'rate',
        'mobileNumber',
        'whatsappNumber',
        'profileDescription'
      ];
      
      const currentIndex = formElements.indexOf(e.target.name);
      
      if (currentIndex !== -1 && currentIndex < formElements.length - 1) {
        let nextIndex = currentIndex + 1;
        
        if (formElements[nextIndex] === 'availableFrom' && formData.availabilityStatus !== 'busy') {
          nextIndex++;
        }
        
        if (nextIndex < formElements.length) {
          const nextField = formElements[nextIndex];
          const nextInput = document.querySelector(`input[name="${nextField}"], textarea[name="${nextField}"]`);
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
    }
  };

  const handleSubmit = async () => {
    console.log('=== FORM SUBMISSION STARTED ===');
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.jobTitle || !formData.mobileNumber || 
        !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    if (formData.availabilityStatus === 'busy' && !formData.availableFrom) {
      setError('Please select when you will be available');
      return;
    }

    console.log('✅ Validation passed');
    setLoading(true);

    try {
      console.log('📝 Creating FormData...');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
          console.log(`  - ${key}: ${formData[key]}`);
        }
      });

      if (files.profilePhoto) {
        formDataToSend.append('profilePhoto', files.profilePhoto);
        console.log(`  - profilePhoto: ${files.profilePhoto.name} (${files.profilePhoto.size} bytes)`);
      }
      if (files.cv) {
        formDataToSend.append('cv', files.cv);
        console.log(`  - cv: ${files.cv.name} (${files.cv.size} bytes)`);
      }
      if (files.certificates.length > 0) {
        files.certificates.forEach((file, index) => {
          formDataToSend.append('certificates', file);
          console.log(`  - certificate[${index}]: ${file.name} (${file.size} bytes)`);
        });
      }

      console.log('🚀 Sending POST request to http://localhost:5550/api/manpower/signup');
      console.log('⏱️ Starting fetch...');
      
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:5550/api/manpower/signup', {
        method: 'POST',
        body: formDataToSend
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Response received in ${duration}ms`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📦 Response data:', data);
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok && data.success) {
        console.log('🎉 SUCCESS! User ID:', data.userId);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        console.error('❌ Signup failed:', data.message);
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 ERROR:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure backend is running on port 5550.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
      console.log('=== FORM SUBMISSION ENDED ===');
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Manpower Signup</h1>
          <p className="text-gray-600 text-lg">Create your professional profile to connect with opportunities</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
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
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Heavy Equipment Operator, Electrician, Welder"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Availability Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'available', availableFrom: '' }))}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    formData.availabilityStatus === 'available'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 mb-1 ${
                    formData.availabilityStatus === 'available' ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm text-gray-900">Available</div>
                  <div className="text-xs text-gray-600">Ready to work now</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'busy' }))}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    formData.availabilityStatus === 'busy'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className={`w-5 h-5 mb-1 ${
                    formData.availabilityStatus === 'busy' ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold text-sm text-gray-900">Currently Busy</div>
                  <div className="text-xs text-gray-600">Available later</div>
                </button>
              </div>
            </div>

            {formData.availabilityStatus === 'busy' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Select the date when you'll be available for work</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Saudi Arabia, Jubail"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., $50/hr"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
                    placeholder="+1234567890 (optional)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank to use mobile number</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="profileDescription"
                  value={formData.profileDescription}
                  onChange={handleChange}
                  placeholder="Tell us about your experience, skills, and qualifications..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                    className="hidden"
                  />
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors text-center h-24 flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600 truncate w-full px-1">
                      {fileNames.profilePhoto || 'Choose Photo'}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV</label>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'cv')}
                    className="hidden"
                  />
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors text-center h-24 flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
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
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors text-center h-24 flex flex-col items-center justify-center">
                    <Award className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600 truncate w-full px-1">
                      {fileNames.certificates || 'Choose Files'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">Log in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManpower;