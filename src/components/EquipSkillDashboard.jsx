import React, { useState, useEffect } from 'react';
import { 
  User, Package, Save, MessageCircle, X, Upload, FileText, Award, LogOut, 
  AlertCircle, CheckCircle, Loader, Download, Trash2, Edit,
  MapPin, Phone, Mail, ToggleLeft, ToggleRight, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewSystem from '../components/ReviewComponent';

const EquipSkillDashboard = () => {
  const [activeTab, setActiveTab] = useState('professional'); // 'professional' or 'equipment'
  const [user, setUser] = useState(null);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit modes
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Modal states for equipment
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  
  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Upload states
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingCerts, setUploadingCerts] = useState(false);
  const [uploadingEquipImg, setUploadingEquipImg] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Freelancer form data
  const [freelancerForm, setFreelancerForm] = useState({
    firstName: '', lastName: '', userName: '', email: '', phone: '', location: '',
    title: '', experience: '', expectedSalary: '', salaryCurrency: 'USD',
    bio: '', availability: 'available', availableFrom: '',
    cvFilePath: '', certificatesPath: []
  });

  // Equipment form data
  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: '', equipmentType: '', location: '',
    contactPerson: '', contactNumber: '', contactEmail: '',
    availability: 'available', description: '', equipmentImages: []
  });

  // Profile form (basic user info)
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', location: ''
  });

  const experienceOptions = [
    'Entry Level (0-1 years)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)',
    'Senior (5-8 years)', 'Lead/Expert (8+ years)'
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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch freelancer profile
      const freelancerRes = await fetch(`${API_BASE}/api/freelancer/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const freelancerData = await freelancerRes.json();

      if (freelancerData.success) {
        setUser(freelancerData.user);
        setFreelancerProfile(freelancerData.profile);
        
        // Pre-fill freelancer form
        setFreelancerForm({
          firstName: freelancerData.user.firstName || '',
          lastName: freelancerData.user.lastName || '',
          userName: freelancerData.user.userName || '',
          email: freelancerData.user.email || '',
          phone: freelancerData.user.phone || '',
          location: freelancerData.user.location || '',
          title: freelancerData.profile?.title || '',
          experience: freelancerData.profile?.experience || '',
          expectedSalary: freelancerData.profile?.expectedSalary || '',
          salaryCurrency: freelancerData.profile?.salaryCurrency || 'USD',
          bio: freelancerData.profile?.bio || '',
          availability: freelancerData.profile?.availability || 'available',
          availableFrom: freelancerData.profile?.availableFrom || '',
          cvFilePath: freelancerData.profile?.cvFilePath || '',
          certificatesPath: Array.isArray(freelancerData.profile?.certificatesPath) 
            ? freelancerData.profile.certificatesPath : []
        });

        // If no profile, auto-open edit mode
        if (!freelancerData.profile || !freelancerData.profile.title) {
          setIsEditingProfessional(true);
        }
      }

      // Fetch equipment
         // Fetch equipment
      const equipmentRes = await fetch(`${API_BASE}/api/equipment-owner/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const equipmentData = await equipmentRes.json();

      if (equipmentData.success) {
       const equipmentList = (equipmentData.equipment || []).map(eq => {
  let parsedImages = [];
  try {
    if (Array.isArray(eq.equipmentImages)) {
      parsedImages = eq.equipmentImages;
    } else if (typeof eq.equipmentImages === 'string' && eq.equipmentImages) {
      parsedImages = JSON.parse(eq.equipmentImages);
    }
  } catch (parseError) {
    console.error('Image parse error for equipment:', eq.id, parseError);
    parsedImages = [];
  }
  return {
    ...eq,
    equipmentImages: parsedImages
  };
});
        setEquipment(equipmentList);

        // Pre-fill profile form
        setProfileForm({
          firstName: equipmentData.user.firstName || '',
          lastName: equipmentData.user.lastName || '',
          phone: equipmentData.user.phone || '',
          email: equipmentData.user.email || '',
          location: equipmentData.user.location || ''
        });

        // Pre-fill equipment form contact details
        setEquipmentForm(prev => ({
          ...prev,
          contactPerson: `${equipmentData.user.firstName} ${equipmentData.user.lastName}`,
          contactNumber: equipmentData.user.phone || '',
          contactEmail: equipmentData.user.email || '',
          location: equipmentData.user.location || ''
        }));
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Check completion status
  const isProfessionalComplete = () => {
    return freelancerProfile && freelancerProfile.title && freelancerProfile.experience;
  };

  const isEquipmentComplete = () => {
    return equipment.length > 0;
  };

  // Cloudinary upload
  const uploadToCloudinary = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  // Freelancer handlers
  const handleFreelancerChange = (e) => {
    const { name, value } = e.target;
    setFreelancerForm(prev => ({ ...prev, [name]: value }));
    setError(''); setSuccess('');
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('CV must be less than 5MB');
    if (file.type !== 'application/pdf') return setError('CV must be PDF');

    try {
      setUploadingCV(true);
      const url = await uploadToCloudinary(file, 'raw');
      setFreelancerForm(prev => ({ ...prev, cvFilePath: url }));
      setSuccess('CV uploaded!');
    } catch (err) {
      setError('Failed to upload CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleCertificatesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) return setError('Total size must be less than 10MB');

    try {
      setUploadingCerts(true);
      const urls = await Promise.all(files.map(file => uploadToCloudinary(file, 'image')));
      setFreelancerForm(prev => ({
        ...prev,
        certificatesPath: [...prev.certificatesPath, ...urls]
      }));
      setSuccess(`${files.length} certificate(s) uploaded!`);
    } catch (err) {
      setError('Failed to upload certificates');
    } finally {
      setUploadingCerts(false);
    }
  };

  const handleDeleteCertificate = (index) => {
    setFreelancerForm(prev => ({
      ...prev,
      certificatesPath: prev.certificatesPath.filter((_, i) => i !== index)
    }));
  };

  const handleSaveFreelancer = async (e) => {
    e.preventDefault();
    
    if (!freelancerForm.firstName || !freelancerForm.lastName || !freelancerForm.userName || !freelancerForm.email) {
      return setError('Please fill all required fields');
    }
    if (!freelancerForm.title) return setError('Job title is required');

    try {
      setSaving(true);
      setError(''); setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/freelancer/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(freelancerForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Professional profile saved!');
        setIsEditingProfessional(false);
        fetchAllData();
      } else {
        setError(data.msg || 'Failed to save');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  // Equipment handlers
  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEquipmentImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 5) return setError('Max 5 images');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) return setError('Total size must be less than 10MB');

    try {
      setUploadingEquipImg(true);
      const urls = await Promise.all(files.map(file => uploadToCloudinary(file)));
      setEquipmentForm(prev => ({
        ...prev,
        equipmentImages: [...prev.equipmentImages, ...urls].slice(0, 5)
      }));
      setSuccess(`${files.length} image(s) uploaded!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploadingEquipImg(false);
    }
  };

  const handleRemoveEquipmentImage = (index) => {
    setEquipmentForm(prev => ({
      ...prev,
      equipmentImages: prev.equipmentImages.filter((_, i) => i !== index)
    }));
  };

  const openAddEquipmentModal = () => {
    setEquipmentForm({
      equipmentName: '', equipmentType: '', location: user?.location || '',
      contactPerson: `${user?.firstName} ${user?.lastName}`,
      contactNumber: user?.phone || '', contactEmail: user?.email || '',
      availability: 'available', description: '', equipmentImages: []
    });
    setShowAddModal(true);
  };

  const openEditEquipmentModal = (eq) => {
    setEditingEquipment(eq);
    setEquipmentForm({
      equipmentName: eq.equipmentName, equipmentType: eq.equipmentType,
      location: eq.location || '', contactPerson: eq.contactPerson,
      contactNumber: eq.contactNumber, contactEmail: eq.contactEmail,
      availability: eq.availability, description: eq.description || '',
      equipmentImages: eq.equipmentImages || []
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEquipment(null);
    setError(''); setSuccess('');
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!equipmentForm.equipmentName || !equipmentForm.equipmentType) {
      return setError('Equipment name and type required');
    }

    try {
      setSaving(true); setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Equipment added!');
        setTimeout(() => { closeModals(); fetchAllData(); }, 1500);
      } else {
        setError(data.msg || 'Failed to add');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/${editingEquipment.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Equipment updated!');
        setTimeout(() => { closeModals(); fetchAllData(); }, 1500);
      } else {
        setError(data.msg || 'Failed to update');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/${equipmentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Equipment deleted!');
        setShowDeleteDialog(false);
        setEquipmentToDelete(null);
        fetchAllData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to delete');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleToggleAvailability = async (eq) => {
    const newAvailability = eq.availability === 'available' ? 'on-hire' : 'available';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/${eq.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eq, availability: newAvailability })
      });

      const data = await response.json();
      if (data.success) fetchAllData();
      else setError('Failed to update availability');
    } catch (err) {
      setError('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
           <div className="flex items-center gap-3">
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
        {/* Messages */}
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('professional')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'professional'
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Professional Profile
              {isProfessionalComplete() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'equipment'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              Equipment Listing
              {isEquipmentComplete() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'professional' && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditingProfessional ? 'Edit Professional Profile' : 'Professional Profile'}
              </h2>
              {!isEditingProfessional && freelancerProfile && freelancerProfile.title && (
                <button
                  onClick={() => setIsEditingProfessional(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfessional ? (
              <form onSubmit={handleSaveFreelancer} className="space-y-6">
                {/* Basic Info */}
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
                        value={freelancerForm.firstName}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        value={freelancerForm.lastName}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        value={freelancerForm.userName}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        value={freelancerForm.email}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={freelancerForm.phone}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={freelancerForm.location}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
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
                        value={freelancerForm.title}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Safety Officer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                      <select
                        name="experience"
                        value={freelancerForm.experience}
                        onChange={handleFreelancerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select experience</option>
                        {experienceOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <select
                            name="expectedSalary"
                            value={freelancerForm.expectedSalary}
                            onChange={handleFreelancerChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select range</option>
                            {salaryRangesByCurrency[freelancerForm.salaryCurrency].map(range => (
                              <option key={range} value={range}>{range}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            name="salaryCurrency"
                            value={freelancerForm.salaryCurrency}
                            onChange={handleFreelancerChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {currencies.map(currency => (
                              <option key={currency.code} value={currency.code}>{currency.code}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-6">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="availability"
                              value="available"
                              checked={freelancerForm.availability === 'available'}
                              onChange={handleFreelancerChange}
                              className="mr-2"
                            />
                            <span className="text-sm">Available Now</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="availability"
                              value="busy"
                              checked={freelancerForm.availability === 'busy'}
                              onChange={handleFreelancerChange}
                              className="mr-2"
                            />
                            <span className="text-sm">Currently Busy</span>
                          </label>
                        </div>
                        {freelancerForm.availability === 'busy' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Available From</label>
                            <input
                              type="date"
                              name="availableFrom"
                              value={freelancerForm.availableFrom}
                              onChange={handleFreelancerChange}
                              min={getTodayDate()}
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={freelancerForm.bio}
                        onChange={handleFreelancerChange}
                        rows="4"
                        maxLength="1000"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="text-right text-sm text-gray-500 mt-1">{freelancerForm.bio.length}/1000</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Documents</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CV (PDF, max 5MB)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCVUpload}
                          className="hidden"
                          id="cv-upload"
                          disabled={uploadingCV}
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                          <span className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                            {uploadingCV ? 'Uploading...' : 'Click to upload CV'}
                          </span>
                        </label>
                        {freelancerForm.cvFilePath && (
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">CV uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certificates (max 10MB total)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleCertificatesUpload}
                          className="hidden"
                          id="cert-upload"
                          disabled={uploadingCerts}
                        />
                        <label htmlFor="cert-upload" className="cursor-pointer">
                          <span className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                            {uploadingCerts ? 'Uploading...' : 'Click to upload'}
                          </span>
                        </label>
                        {freelancerForm.certificatesPath.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-green-600">
                              {freelancerForm.certificatesPath.length} certificate(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {freelancerForm.certificatesPath.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {freelancerForm.certificatesPath.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="text-xs text-gray-600 truncate">Certificate {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 px-6 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Professional Profile'}
                  </button>
                  
                  {freelancerProfile && freelancerProfile.title && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfessional(false);
                        fetchAllData();
                      }}
                      disabled={saving}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              // View Mode - Professional Profile
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
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

                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-xl font-semibold mb-4">Professional Profile</h3>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                          <p className="text-lg text-gray-900">{freelancerProfile?.title}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
                          <p className="text-lg text-gray-900">{freelancerProfile?.experience || 'Not specified'}</p>
                        </div>
                      </div>

                      {freelancerProfile?.bio && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                          <p className="text-gray-700 leading-relaxed">{freelancerProfile.bio}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Expected Salary</label>
                          <p className="text-lg text-gray-900">
                            {freelancerProfile?.expectedSalary ? `${freelancerProfile.expectedSalary} ${freelancerProfile.salaryCurrency}` : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Availability</label>
                          <p className="text-lg">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              freelancerProfile?.availability === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {freelancerProfile?.availability === 'available' ? 'Available Now' : 'Currently Busy'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Documents</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">CV/Resume</label>
                        {freelancerForm.cvFilePath ? (
                          <a 
                            href={freelancerForm.cvFilePath}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors"
                          >
                            <FileText className="w-5 h-5 text-teal-600" />
                            <span className="text-teal-700 font-medium text-sm">View CV</span>
                            <Download className="w-4 h-4 text-teal-600 ml-auto" />
                          </a>
                        ) : (
                          <p className="text-gray-400 italic p-3 bg-gray-50 rounded text-sm">No CV uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Certificates</label>
                        {freelancerForm.certificatesPath.length > 0 ? (
                          <div className="space-y-2">
                            {freelancerForm.certificatesPath.map((cert, index) => (
                              <a 
                                key={index} 
                                href={cert}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                              >
                                <Award className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 font-medium text-sm">Certificate {index + 1}</span>
                                <Download className="w-4 h-4 text-green-600 ml-auto" />
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
        )}

        {activeTab === 'equipment' && (
          <div>
            {/* Add Equipment Button */}
            <div className="mb-6">
              <button
                onClick={openAddEquipmentModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add New Equipment
              </button>
            </div>

            {/* Equipment Grid */}
            {equipment.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Equipment Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first equipment</p>
                <button
                  onClick={openAddEquipmentModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Equipment
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Equipment Inventory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                      {/* Equipment Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100">
                        {eq.equipmentImages && eq.equipmentImages.length > 0 ? (
                          <img
                            src={eq.equipmentImages[0]}
                            alt={eq.equipmentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-purple-300" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleAvailability(eq)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              eq.availability === 'available'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            } transition-colors`}
                          >
                            {eq.availability === 'available' ? (
                              <><ToggleRight className="w-4 h-4" />Available</>
                            ) : (
                              <><ToggleLeft className="w-4 h-4" />On Hire</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Equipment Details */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                          {eq.equipmentName}
                        </h3>
                        <p className="text-sm text-purple-600 font-medium mb-3">
                          {eq.equipmentType}
                        </p>

                        {eq.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {eq.description}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{eq.contactPerson}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{eq.contactNumber}</span>
                          </div>
                          {eq.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{eq.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEquipmentModal(eq)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setEquipmentToDelete(eq);
                              setShowDeleteDialog(true);
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Add New Equipment</h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={equipmentForm.equipmentName}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Excavator CAT 320"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentType"
                      value={equipmentForm.equipmentType}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Heavy Machinery"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="available">Available</option>
                      <option value="on-hire">On Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={equipmentForm.location}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Equipment location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleEquipmentChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={equipmentForm.contactPerson}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={equipmentForm.contactNumber}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={equipmentForm.contactEmail}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Images (Max 5)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEquipmentImageUpload}
                    className="hidden"
                    id="equipment-images"
                    disabled={uploadingEquipImg || equipmentForm.equipmentImages.length >= 5}
                  />
                  <label htmlFor="equipment-images" className="cursor-pointer">
                    <span className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {uploadingEquipImg ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB total</p>
                  </label>
                </div>

                {equipmentForm.equipmentImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {equipmentForm.equipmentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipmentImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingEquipImg}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Edit Equipment</h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={equipmentForm.equipmentName}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentType"
                      value={equipmentForm.equipmentType}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="available">Available</option>
                      <option value="on-hire">On Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={equipmentForm.location}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleEquipmentChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={equipmentForm.contactPerson}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={equipmentForm.contactNumber}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={equipmentForm.contactEmail}
                      onChange={handleEquipmentChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Images (Max 5)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEquipmentImageUpload}
                    className="hidden"
                    id="edit-equipment-images"
                    disabled={uploadingEquipImg || equipmentForm.equipmentImages.length >= 5}
                  />
                  <label htmlFor="edit-equipment-images" className="cursor-pointer">
                    <span className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {uploadingEquipImg ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB total</p>
                  </label>
                </div>

                {equipmentForm.equipmentImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {equipmentForm.equipmentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipmentImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingEquipImg}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Updating...' : 'Update Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && equipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Equipment</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{equipmentToDelete.equipmentName}"</span>?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setEquipmentToDelete(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEquipment}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default EquipSkillDashboard;