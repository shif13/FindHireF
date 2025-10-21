import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, MapPin, Phone, MessageSquare, Building2, Camera, CheckCircle, AlertCircle } from 'lucide-react';

const AccountEquipment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    location: '',
    mobileNumber: '',
    whatsappNumber: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile photo must be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.closest('form');
      if (!form) return;
      
      const inputs = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]'));
      const currentIndex = inputs.indexOf(e.target);
      
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || 
        !formData.mobileNumber || !formData.location) {
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

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const response = await fetch(`${API_BASE}/equipment/signup`, {
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure backend is running on port 5550.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#EDE0D4' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#B08968' }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#7F5539' }}>Account Created!</h2>
          <p style={{ color: '#9C6644' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#EDE0D4' }}>
    
      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border p-8" style={{ borderColor: '#DDB892' }}>
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#FECACA', borderLeft: '4px solid #DC2626' }}>
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: '#7F5539' }}>
                Profile Photo (Optional)
              </label>
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: '#B08968', backgroundColor: '#E6CCB2' }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16" style={{ color: '#9C6644' }} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 rounded-full p-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#B08968' }}>
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs mt-2" style={{ color: '#9C6644' }}>Maximum file size: 5MB</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., John Doe"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                  style={{ 
                    borderColor: '#DDB892',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B08968'}
                  onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., ACME Equipment Rentals"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                  style={{ 
                    borderColor: '#DDB892',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B08968'}
                  onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                  style={{ 
                    borderColor: '#DDB892',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B08968'}
                  onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all"
                  style={{ 
                    borderColor: '#DDB892',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B08968'}
                  onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: '#9C6644' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: '#9C6644' }}>Minimum 6 characters</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Saudi Arabia, Jubail"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                  style={{ 
                    borderColor: '#DDB892',
                    backgroundColor: '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B08968'}
                  onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                />
              </div>
            </div>

            {/* Mobile & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{ 
                      borderColor: '#DDB892',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#B08968'}
                    onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  WhatsApp Number
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9C6644' }} />
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="+1234567890 (optional)"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{ 
                      borderColor: '#DDB892',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#B08968'}
                    onBlur={(e) => e.target.style.borderColor = '#DDB892'}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#9C6644' }}>Leave blank to use mobile number</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              style={{
                backgroundColor: loading ? '#9C6644' : '#B08968',
                color: '#FFFFFF',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#7F5539')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#B08968')}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm" style={{ color: '#9C6644' }}>
                Already have an account?{' '}
                <a href="/login" className="font-medium hover:underline" style={{ color: '#7F5539' }}>
                  Log in
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#9C6644' }}>
            By creating an account, you agree to our{' '}
            <a href="/terms" className="hover:underline" style={{ color: '#7F5539' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="hover:underline" style={{ color: '#7F5539' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountEquipment;