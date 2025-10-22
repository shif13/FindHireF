import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, DollarSign, FileText, 
  Camera, Upload, Award, Calendar, CheckCircle, Clock, 
  Edit, Save, X, Settings, LogOut, Eye, Lock, Trash2,
  MessageSquare, AlertCircle
} from 'lucide-react';
import ReviewSystem from '../components/ReviewComponent';

const ManpowerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showReviews, setShowReviews] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/manpower/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setFormData({
          firstName: data.profile.first_name,
          lastName: data.profile.last_name,
          jobTitle: data.profile.job_title,
          availabilityStatus: data.profile.availability_status,
          availableFrom: data.profile.available_from || '',
          location: data.profile.location,
          rate: data.profile.rate || '',
          mobileNumber: data.profile.mobile_number,
          whatsappNumber: data.profile.whatsapp_number || '',
          profileDescription: data.profile.profile_description || ''
        });
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
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

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

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

      const response = await fetch(`${API_BASE}/manpower/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        setFiles({ profilePhoto: null, cv: null, certificates: [] });
        setFileNames({ profilePhoto: '', cv: '', certificates: '' });
        await fetchProfile();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4FFF9] to-[#9CEAEF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#07BEB8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4FFF9] to-[#9CEAEF]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#07BEB8]">Find-Hire.Co</h1>
          <p className="text-sm text-gray-600 mt-1">Manpower Dashboard</p>
        </div>

        <nav className="p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#07BEB8] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#07BEB8] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">View Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('edit');
              setEditMode(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeTab === 'edit'
                ? 'bg-[#07BEB8] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Edit className="w-5 h-5" />
            <span className="font-medium">Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#07BEB8] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>

          <div className="border-t border-gray-200 my-4"></div>

            <button
  onClick={() => setShowReviews(true)}
  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-700 hover:bg-gray-100 transition-all"
>
  <MessageSquare className="w-5 h-5" />
  <span className="font-medium">Reviews</span>
</button>


          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.first_name}! 👋
              </h2>
              <p className="text-gray-600">Here's your profile overview</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#07BEB8]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Status</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {profile?.availability_status === 'available' ? 'Available' : 'Busy'}
                    </p>
                  </div>
                  {profile?.availability_status === 'available' ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <Clock className="w-12 h-12 text-orange-500" />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#3DCCC7]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Job Title</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{profile?.job_title}</p>
                  </div>
                  <Briefcase className="w-12 h-12 text-[#3DCCC7]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#68D8D6]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Location</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{profile?.location}</p>
                  </div>
                  <MapPin className="w-12 h-12 text-[#68D8D6]" />
                </div>
              </div>
            </div>

            {/* Profile Preview Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Profile Preview</h3>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {profile?.profile_photo ? (
                    <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile?.first_name} {profile?.last_name}
                  </h4>
                  <p className="text-lg text-[#07BEB8] font-semibold mb-3">{profile?.job_title}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.location}</span>
                    </div>
                    {profile?.rate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{profile.rate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {profile?.availability_status === 'available' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Available Now
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          Busy until {profile?.available_from ? new Date(profile.available_from).toLocaleDateString() : 'TBD'}
                        </span>
                      )}
                    </div>
                  </div>

                  {profile?.profile_description && (
                    <p className="text-gray-700 leading-relaxed">{profile.profile_description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#07BEB8]" />
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="font-medium text-gray-900">{profile?.mobile_number}</p>
                  </div>
                </div>

                {profile?.whatsapp_number && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-[#07BEB8]" />
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-medium text-gray-900">{profile.whatsapp_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#07BEB8]" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile?.email}</p>
                  </div>
                </div>

                {profile?.cv_path && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#07BEB8]" />
                    <div>
                      <p className="text-xs text-gray-500">CV</p>
                      <a href={`${import.meta.env.VITE_BACKEND_URL}/${profile.cv_path}`} target="_blank" rel="noopener noreferrer" className="text-[#07BEB8] hover:underline font-medium">
                        View CV
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {profile?.certificates && profile.certificates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#07BEB8]" />
                    Certificates ({profile.certificates.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.certificates.map((cert, index) => (
                      <a
                        key={index}
                        href={`${import.meta.env.VITE_BACKEND_URL}/${cert}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-[#C4FFF9] text-[#07BEB8] rounded-lg text-sm hover:bg-[#9CEAEF] transition-colors"
                      >
                        Certificate {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h2>
              <p className="text-gray-600">This is how employers see your profile</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-8 mb-8">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-4 ring-[#9CEAEF]">
                  {profile?.profile_photo ? (
                    <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-xl text-[#07BEB8] font-semibold mb-4">{profile?.job_title}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{profile?.location}</span>
                    </div>
                    
                    {profile?.rate && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{profile.rate}</span>
                      </div>
                    )}

                    <div>
                      {profile?.availability_status === 'available' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-700">Available Now</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-orange-700">
                            Available from {profile?.available_from ? new Date(profile.available_from).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile?.profile_description && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                      <p className="text-gray-700 leading-relaxed">{profile.profile_description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-6 h-6 text-[#07BEB8]" />
                    <div>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="font-medium text-gray-900">{profile?.mobile_number}</p>
                    </div>
                  </div>

                  {profile?.whatsapp_number && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-[#07BEB8]" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="font-medium text-gray-900">{profile.whatsapp_number}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-6 h-6 text-[#07BEB8]" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile?.email}</p>
                    </div>
                  </div>

                  {profile?.cv_path && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <FileText className="w-6 h-6 text-[#07BEB8]" />
                      <div>
                        <p className="text-sm text-gray-500">Resume/CV</p>
                        <a 
                          href={`${import.meta.env.VITE_BACKEND_URL}/${profile.cv_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#07BEB8] hover:underline font-medium"
                        >
                          Download CV
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {profile?.certificates && profile.certificates.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#07BEB8]" />
                    Certifications ({profile.certificates.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {profile.certificates.map((cert, index) => (
                      <a
                        key={index}
                        href={`${import.meta.env.VITE_BACKEND_URL}/${cert}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-[#C4FFF9] rounded-lg hover:bg-[#9CEAEF] transition-colors"
                      >
                        <Award className="w-5 h-5 text-[#07BEB8]" />
                        <span className="text-sm font-medium text-[#07BEB8]">Cert {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h2>
                <p className="text-gray-600">Update your information</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {profile?.profile_photo ? (
                        <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profilePhoto')}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-[#07BEB8] text-white rounded-lg hover:bg-[#3DCCC7] transition-colors flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>Change Photo</span>
                      </div>
                    </label>
                    {fileNames.profilePhoto && (
                      <span className="text-sm text-gray-600">{fileNames.profilePhoto}</span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                  />
                </div>

                {/* Availability Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Availability Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'available', availableFrom: '' }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.availabilityStatus === 'available'
                          ? 'border-[#07BEB8] bg-[#C4FFF9]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle className={`w-6 h-6 mb-2 ${
                        formData.availabilityStatus === 'available' ? 'text-[#07BEB8]' : 'text-gray-400'
                      }`} />
                      <div className="font-semibold text-gray-900">Available</div>
                      <div className="text-sm text-gray-600">Ready to work now</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, availabilityStatus: 'busy' }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.availabilityStatus === 'busy'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className={`w-6 h-6 mb-2 ${
                        formData.availabilityStatus === 'busy' ? 'text-orange-500' : 'text-gray-400'
                      }`} />
                      <div className="font-semibold text-gray-900">Currently Busy</div>
                      <div className="text-sm text-gray-600">Available later</div>
                    </button>
                  </div>
                </div>

                {formData.availabilityStatus === 'busy' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                    <input
                      type="date"
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>
                )}

                {/* Location & Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                    <input
                      type="text"
                      name="rate"
                      value={formData.rate}
                      onChange={handleChange}
                      placeholder="e.g., $50/hr"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Description</label>
                  <textarea
                    name="profileDescription"
                    value={formData.profileDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07BEB8] focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update CV</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#07BEB8] transition-colors text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {fileNames.cv || 'Choose new CV'}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Certificates</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'certificates')}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#07BEB8] transition-colors text-center">
                        <Award className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {fileNames.certificates || 'Choose certificates'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-[#07BEB8] hover:bg-[#3DCCC7] text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setEditMode(false);
                      setFiles({ profilePhoto: null, cv: null, certificates: [] });
                      setFileNames({ profilePhoto: '', cv: '', certificates: '' });
                      setError('');
                      setSuccess('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Manage your account settings</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#07BEB8]" />
                    Change Password
                  </h3>
                  <p className="text-gray-600 mb-4">Update your password to keep your account secure</p>
                  <button className="px-6 py-3 bg-[#07BEB8] text-white rounded-lg hover:bg-[#3DCCC7] transition-colors font-medium">
                    Change Password
                  </button>
                </div>

                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{profile?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium text-gray-900">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Status:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-gray-600 mb-4">Permanently delete your account and all associated data</p>
                  <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Review System Modal */}
{showReviews && (
  <ReviewSystem
    isModal={true}
    onClose={() => setShowReviews(false)}
    currentUser={{
      id: profile?.id,
      firstName: profile?.first_name,
      lastName: profile?.last_name
    }}
  />
)}
    </div>
  );
};

export default ManpowerDashboard;