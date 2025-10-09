import React, { useState } from 'react';
import { User, Settings, Home, MapPin, AlertCircle, CheckCircle, Eye, EyeOff, X } from 'lucide-react';

const Register = () => {
  const [userType, setUserType] = useState('jobseeker');
  
  // Job Seeker Form State
  const [jobSeekerData, setJobSeekerData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const [cvFile, setCvFile] = useState(null);
  const [jsCertificates, setJsCertificates] = useState([]);
  const [jsLoading, setJsLoading] = useState(false);
  const [jsError, setJsError] = useState('');
  const [jsSuccess, setJsSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Equipment Form State
  const [equipmentData, setEquipmentData] = useState({
    equipmentName: '',
    equipmentType: '',
    location: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '', 
    availability: 'available'
  });

  const [eqCertificates, setEqCertificates] = useState([]);
  const [eqLoading, setEqLoading] = useState(false);

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

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
      e.preventDefault();
      const formElements = Array.from(document.querySelectorAll(
        'input:not([type="hidden"]):not([disabled]):not([type="file"]), select:not([disabled]), textarea:not([disabled])'
      ));
      const currentIndex = formElements.indexOf(e.target);
      const nextIndex = currentIndex + 1;
      if (nextIndex < formElements.length) {
        formElements[nextIndex].focus();
      } else {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton && !submitButton.disabled) {
          submitButton.focus();
        }
      }
    }
  };

  // Job Seeker Handlers
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
      case 'password':
        if (!value) {
          errors[name] = 'Password is required';
        } else if (value.length < 6) {
          errors[name] = 'Password must be at least 6 characters';
        } else {
          delete errors[name];
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors[name] = 'Please confirm your password';
        } else if (value !== jobSeekerData.password) {
          errors[name] = 'Passwords do not match';
        } else {
          delete errors[name];
        }
        break;
      default:
        break;
    }
    setValidationErrors(errors);
  };

  const handleJobSeekerInputChange = (e) => {
    const { name, value } = e.target;
    setJobSeekerData(prev => ({ ...prev, [name]: value }));
    if (jsError) setJsError('');
    if (jsSuccess) setJsSuccess('');
    if (['firstName', 'lastName', 'userName', 'email', 'password', 'confirmPassword'].includes(name)) {
      setTimeout(() => validateField(name, value), 300);
    }
  };

  const handleJobSeekerFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'cvFile') {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        setJsError('CV file must be less than 5MB');
        return;
      }
      setCvFile(file);
    } else if (name === 'certificateFiles') {
      const fileArray = Array.from(files);
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        setJsError('Total certificate files must be less than 10MB');
        return;
      }
      setJsCertificates(fileArray);
    }
  };

  const validateJobSeekerForm = () => {
    const requiredFields = ['firstName', 'lastName', 'userName', 'email', 'password', 'confirmPassword'];
    const errors = {};
    requiredFields.forEach(field => {
      if (!jobSeekerData[field] || !jobSeekerData[field].trim()) {
        errors[field] = 'This field is required';
      }
    });
    if (jobSeekerData.password !== jobSeekerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (jobSeekerData.password && jobSeekerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (jobSeekerData.email && !emailRegex.test(jobSeekerData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleJobSeekerSubmit = async (e) => {
    e.preventDefault();
    setJsError('');
    setJsSuccess('');
    
    if (!validateJobSeekerForm()) {
      setJsError('Please fix the errors below');
      return;
    }
    
    if (jsLoading) return;
    setJsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(jobSeekerData).forEach((key) => {
        if (key !== 'confirmPassword') {
          formDataToSend.append(key, jobSeekerData[key] || '');
        }
      });
      formDataToSend.append('userType', 'jobseeker');
      
      if (cvFile) formDataToSend.append('cvFile', cvFile);
      if (jsCertificates.length > 0) {
        jsCertificates.forEach((file) => formDataToSend.append('certificateFiles', file));
      }
      
      const response = await fetch('https://projectk-6vkc.onrender.com/api/register', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      
      setJsSuccess(data.msg || 'Registration successful! Welcome to TalentConnect!');
      resetJobSeekerForm();
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      setJsError(error.message || 'Registration failed. Please try again later.');
    } finally {
      setJsLoading(false);
    }
  };

  const resetJobSeekerForm = () => {
    setJobSeekerData({
      firstName: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '',
      phone: '', location: '', title: '', experience: '', expectedSalary: '',
      salaryCurrency: 'USD', bio: '', availability: 'available', availableFrom: ''
    });
    setCvFile(null);
    setJsCertificates([]);
    setValidationErrors({});
  };

  // Equipment Handlers
  const handleEquipmentInputChange = (e) => {
    const { name, value } = e.target;
    setEquipmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'equipmentImages') {
      const fileArray = Array.from(files);
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 25 * 1024 * 1024) {
        alert('Total image files must be less than 25MB');
        e.target.value = '';
        return;
      }
      setEqCertificates(fileArray);
    }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    setEqLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(equipmentData).forEach((key) => {
        formDataToSend.append(key, equipmentData[key]);
      });

      if (eqCertificates.length > 0) {
        eqCertificates.forEach((file) =>
          formDataToSend.append('equipmentImages', file)
        );
      }

      const response = await fetch('https://projectk-6vkc.onrender.com/api/equipment/create', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Equipment listing failed');
      }

      alert(data.msg || 'Equipment listed successfully!');
      resetEquipmentForm();
    } catch (error) {
      alert(error.message || 'Failed to list equipment. Please try again later.');
    } finally {
      setEqLoading(false);
    }
  };
 
  const resetEquipmentForm = () => {
    setEquipmentData({
      equipmentName: '', equipmentType: '', location: '', contactPerson: '', contactNumber: '', contactEmail: '', availability: 'available'
    });
    setEqCertificates([]);
    document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const salaryRanges = salaryRangesByCurrency[jobSeekerData.salaryCurrency] || salaryRangesByCurrency.USD;

  return (
    <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyDown}>
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button onClick={handleHomeClick} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Home size={20} />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">ProFetch</h1>
          <p className="text-gray-600">Create your professional profile or list equipment</p>
        </div>

        {/* Tab Selection */}
        <div className="bg-gray-100 rounded-t-lg overflow-hidden">
          <div className="grid grid-cols-2">
            <button type="button" onClick={() => setUserType('jobseeker')}
              className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                userType === 'jobseeker' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <User size={20} />
              <span className="font-medium">Professional Profile</span>
            </button>
            <button type="button" onClick={() => setUserType('equipment')}
              className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                userType === 'equipment' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <Settings size={20} />
              <span className="font-medium">Equipment Listing</span>
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white shadow-sm rounded-b-lg p-8">
          {userType === 'jobseeker' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                  Create Your Professional Profile
                </h1>
                <p className="text-gray-600">Fill out the form below to create your public profile. This will be visible to recruiters.</p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="firstName" value={jobSeekerData.firstName} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John" required />
                    {validationErrors.firstName && <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="lastName" value={jobSeekerData.lastName} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Doe" required />
                    {validationErrors.lastName && <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="userName" value={jobSeekerData.userName} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Choose a unique username" required />
                    {validationErrors.userName && <p className="mt-1 text-sm text-red-600">{validationErrors.userName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input type="email" name="email" value={jobSeekerData.email} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="abc@example.com" required />
                    {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" value={jobSeekerData.password}
                        onChange={handleJobSeekerInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Create a secure password" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                        value={jobSeekerData.confirmPassword} onChange={handleJobSeekerInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Confirm your password" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={jobSeekerData.phone} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., +966" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input type="text" name="location" value={jobSeekerData.location} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Jubail, Saudi Arabia" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input type="text" name="title" value={jobSeekerData.title} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Safety Officer" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select name="experience" value={jobSeekerData.experience} onChange={handleJobSeekerInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select experience level</option>
                      {experienceOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <select name="expectedSalary" value={jobSeekerData.expectedSalary} onChange={handleJobSeekerInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Select salary range</option>
                          {salaryRanges.map(range => <option key={range} value={range}>{range}</option>)}
                        </select>
                      </div>
                      <div>
                        <select name="salaryCurrency" value={jobSeekerData.salaryCurrency} onChange={handleJobSeekerInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          {currencies.map(currency => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Availability</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="availability" value="available" checked={jobSeekerData.availability === 'available'}
                            onChange={handleJobSeekerInputChange} className="mr-2" />
                          <span className="text-sm text-gray-700">Available Now</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="availability" value="busy" checked={jobSeekerData.availability === 'busy'}
                            onChange={handleJobSeekerInputChange} className="mr-2" />
                          <span className="text-sm text-gray-700">Currently Busy</span>
                        </label>
                      </div>
                      {jobSeekerData.availability === 'busy' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Available From</label>
                          <input type="date" name="availableFrom" value={jobSeekerData.availableFrom}
                            onChange={handleJobSeekerInputChange} min={getTodayDate()}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                    <textarea name="bio" value={jobSeekerData.bio} onChange={handleJobSeekerInputChange} rows="4" maxLength="1000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Share your professional story..." />
                    <div className="text-right text-sm text-gray-500 mt-1">{jobSeekerData.bio.length}/1000</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF, max 5MB)</label>
                    <input type="file" name="cvFile" accept=".pdf" onChange={handleJobSeekerFileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {cvFile && <p className="mt-2 text-sm text-gray-600">Selected: {cvFile.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificates (Images or PDF, max 5MB each)
                    </label>
                    <input
                      type="file"
                      name="certificateFiles"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={handleJobSeekerFileChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {jsCertificates.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        {jsCertificates.length} file{jsCertificates.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </div>

                {jsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{jsError}</p>
                  </div>
                )}
                
                {jsSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{jsSuccess}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleJobSeekerSubmit}
                    disabled={jsLoading || Object.keys(validationErrors).length > 0}
                    className={`flex-1 py-3 px-6 rounded text-white font-medium transition-colors ${
                      jsLoading || Object.keys(validationErrors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}>
                    {jsLoading ? 'Creating Profile...' : 'Create Profile'}
                  </button>
                  
                  <button type="button" onClick={() => window.location.href = '/login'} disabled={jsLoading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors">
                    Sign In Instead
                  </button>
                </div>
              </div>
            </div>
          )}

          {userType === 'equipment' && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">List Your Equipment</h1>
              <p className="text-gray-600 mb-8">Fill out the form below to list your equipment for hire.</p>

              <form onSubmit={handleEquipmentSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                    <input type="text" name="equipmentName" value={equipmentData.equipmentName} onChange={handleEquipmentInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Excavator" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
                    <input type="text" name="equipmentType" value={equipmentData.equipmentType} onChange={handleEquipmentInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Heavy Machinery" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" name="location" value={equipmentData.location} onChange={handleEquipmentInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Jubail, Saudi Arabia" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <input type="text" name="contactPerson" value={equipmentData.contactPerson} onChange={handleEquipmentInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John Doe" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input type="tel" name="contactNumber" value={equipmentData.contactNumber} onChange={handleEquipmentInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., +966" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="contactEmail" 
                    value={equipmentData.contactEmail} 
                    onChange={handleEquipmentInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., contact@example.com" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Images (max 5MB each)</label>
                  <input type="file" name="equipmentImages" accept=".jpg,.jpeg,.png" multiple onChange={handleEquipmentFileChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {eqCertificates.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">{eqCertificates.length} image{eqCertificates.length !== 1 ? 's' : ''} selected</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Availability</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="availability" value="available" checked={equipmentData.availability === 'available'}
                        onChange={handleEquipmentInputChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="availability" value="on-hire" checked={equipmentData.availability === 'on-hire'}
                        onChange={handleEquipmentInputChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">On-Hire</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={eqLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {eqLoading ? 'Creating Listing...' : 'Create Listing'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;