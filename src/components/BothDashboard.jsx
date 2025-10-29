import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Briefcase, DollarSign, Camera, Save, AlertCircle, CheckCircle, Package, Plus, Edit, Trash2, Eye, X, Upload, Building2, Settings, LogOut } from 'lucide-react';
import { uploadMultipleToCloudinary } from '../utils/cloudinaryHelper';
import ReviewSystem from '../components/ReviewComponent'; 

const BothDashboard = () => {
const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile data
  const [manpowerProfile, setManpowerProfile] = useState(null);
  const [equipmentProfile, setEquipmentProfile] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  
  //Review
  const [showReviews, setShowReviews] = useState(false);

  // Modals
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [sidebarView, setSidebarView] = useState('manpower'); // Toggle sidebar profile view
  
  const [equipmentFormData, setEquipmentFormData] = useState({
    equipmentName: '',
    equipmentType: '',
    availability: 'available',
    location: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    description: '',
    equipmentImages: []
  });

  // Form data for professional tab
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    jobTitle: '',
    expectedSalary: '',
    availability: 'available',
    bio: '',
    companyName: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/both/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setManpowerProfile(data.manpowerProfile);
        setEquipmentProfile(data.equipmentProfile);
        setEquipmentList(data.equipment || []);

        if (data.manpowerProfile) {
          setFormData({
            firstName: data.manpowerProfile.first_name || '',
            lastName: data.manpowerProfile.last_name || '',
            email: data.manpowerProfile.email || '',
            phone: data.manpowerProfile.mobile_number || '',
            whatsapp: data.manpowerProfile.whatsapp_number || '',
            location: data.manpowerProfile.location || '',
            jobTitle: data.manpowerProfile.job_title || '',
            expectedSalary: data.manpowerProfile.rate || '',
            availability: data.manpowerProfile.availability_status || 'available',
            bio: data.manpowerProfile.profile_description || '',
            companyName: data.equipmentProfile?.company_name || ''
          });
          setPhotoPreview(data.manpowerProfile.profile_photo);
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const inputs = Array.from(form.querySelectorAll('input:not([type="file"]), select, textarea'));
      const index = inputs.indexOf(e.target);
      
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfessionalDetails = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('availabilityStatus', formData.availability);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('rate', formData.expectedSalary);
      formDataToSend.append('mobileNumber', formData.phone);
      formDataToSend.append('whatsappNumber', formData.whatsapp);
      formDataToSend.append('profileDescription', formData.bio);

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const response = await fetch(`${API_BASE}/both/manpower-profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Professional details updated successfully!');
        fetchProfiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update details');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Error updating details');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEquipmentOwnerDetails = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/both/equipment-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyName: formData.companyName })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Equipment owner details updated successfully!');
        fetchProfiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update details');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Error updating details');
    } finally {
      setSaving(false);
    }
  };

  const openAddEquipmentModal = () => {
    setEditingEquipment(null);
    setEquipmentFormData({
      equipmentName: '',
      equipmentType: '',
      availability: 'available',
      location: manpowerProfile?.location || '',
      contactPerson: `${manpowerProfile?.first_name || ''} ${manpowerProfile?.last_name || ''}`.trim(),
      contactNumber: manpowerProfile?.mobile_number || '',
      contactEmail: manpowerProfile?.email || '',
      description: '',
      equipmentImages: []
    });
    setShowEquipmentModal(true);
  };

  const openEditEquipmentModal = (equipment) => {
    setEditingEquipment(equipment);
    setEquipmentFormData({
      equipmentName: equipment.equipment_name || '',
      equipmentType: equipment.equipment_type || '',
      availability: equipment.availability || 'available',
      location: equipment.location || '',
      contactPerson: equipment.contact_person || '',
      contactNumber: equipment.contact_number || '',
      contactEmail: equipment.contact_email || '',
      description: equipment.description || '',
      equipmentImages: equipment.equipment_images || []
    });
    setShowEquipmentModal(true);
  };

  const closeEquipmentModal = () => {
    setShowEquipmentModal(false);
    setEditingEquipment(null);
    setEquipmentFormData({
      equipmentName: '',
      equipmentType: '',
      availability: 'available',
      location: '',
      contactPerson: '',
      contactNumber: '',
      contactEmail: '',
      description: '',
      equipmentImages: []
    });
  };

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setEquipmentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (equipmentFormData.equipmentImages.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const urls = await uploadMultipleToCloudinary(files, 'equipment_images');
      setEquipmentFormData(prev => ({
        ...prev,
        equipmentImages: [...prev.equipmentImages, ...urls]
      }));
      setSuccess('Images uploaded successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setEquipmentFormData(prev => ({
      ...prev,
      equipmentImages: prev.equipmentImages.filter((_, i) => i !== index)
    }));
  };

  const handleSaveEquipment = async () => {
    setError('');
    setSuccess('');

    if (!equipmentFormData.equipmentName || !equipmentFormData.equipmentType || 
        !equipmentFormData.contactPerson || !equipmentFormData.contactNumber || 
        !equipmentFormData.contactEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const url = editingEquipment 
        ? `${API_BASE}/equipment/update/${editingEquipment.id}`
        : `${API_BASE}/equipment/add`;
      
      const method = editingEquipment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentFormData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(editingEquipment ? 'Equipment updated successfully!' : 'Equipment added successfully!');
        closeEquipmentModal();
        fetchProfiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save equipment');
      }
    } catch (error) {
      console.error('Save equipment error:', error);
      setError('Error saving equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;

    try {
      const response = await fetch(`${API_BASE}/equipment/delete/${equipmentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Equipment deleted successfully!');
        setShowDeleteDialog(false);
        setEquipmentToDelete(null);
        fetchProfiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete equipment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting equipment');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {formData.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
  onClick={() => setShowReviews(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
>
  <Eye className="w-4 h-4" />
  Reviews
</button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
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

        <div className="flex gap-6">
          {/* Sidebar - View Only */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-6">
              <div className="p-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-600 bg-gray-100 mb-4">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{formData.email}</p>

                  {/* Toggle Switch for Sidebar View */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4">
                    <button
                      onClick={() => setSidebarView('manpower')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        sidebarView === 'manpower'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => setSidebarView('equipment')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        sidebarView === 'equipment'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Equipment
                    </button>
                  </div>
                </div>

                {/* Profile Details - View Only */}
                {sidebarView === 'manpower' ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <p className="text-base font-semibold text-teal-600">{formData.jobTitle || 'No job title'}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.location || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Rate</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.expectedSalary || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${
                          formData.availability === 'available' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {formData.availability === 'available' ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    {formData.bio && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Bio</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{formData.bio}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <p className="text-base font-semibold text-purple-600">
                        {formData.companyName || 'No company name'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.location || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Total Equipment</p>
                        <p className="text-2xl font-bold text-purple-600">{equipmentList.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Editable Tabs */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'basic'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Basic Info
                  </button>
                  <button
                    onClick={() => setActiveTab('professional')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'professional'
                        ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    Professional Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'equipment'
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    Equipment Listing
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'basic' ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
                      <p className="text-sm text-gray-600 mb-6">Update your common details (shown in sidebar)</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                      {/* Profile Photo */}
                      <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 bg-gray-100">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="profile-photo-basic"
                          />
                          <label
                            htmlFor="profile-photo-basic"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm inline-flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Change Photo
                          </label>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6 mt-6 border-t">
                        <button
                          type="button"
                          onClick={() => fetchProfiles()}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProfessionalDetails}
                          disabled={saving}
                          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            saving
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Save className="w-5 h-5" />
                          {saving ? 'Saving...' : 'Save Basic Info'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : activeTab === 'professional' ? (
                
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Professional Profile</h3>
                      <p className="text-sm text-gray-600 mb-6">Update your professional information and availability</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                      {/* Profile Photo */}
                      <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-teal-600 bg-gray-100">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="profile-photo"
                          />
                          <label
                            htmlFor="profile-photo"
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 transition-colors text-sm inline-flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Change Photo
                          </label>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
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
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
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
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Rate
                          </label>
                          <input
                            type="text"
                            name="expectedSalary"
                            value={formData.expectedSalary}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., $50/hr"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Availability
                          </label>
                          <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          >
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio / Profile Description
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            rows={4}
                            placeholder="Tell us about yourself, your experience, and skills..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name <span className="text-gray-400 text-xs">(Equipment Owner)</span>
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Your company name for equipment listings"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6 mt-6 border-t">
                        <button
                          type="button"
                          onClick={() => fetchProfiles()}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProfessionalDetails}
                          disabled={saving}
                          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            saving
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          <Save className="w-5 h-5" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Equipment Listing</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your equipment inventory</p>
                      </div>
                      <button 
                        onClick={openAddEquipmentModal}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Equipment
                      </button>
                    </div>

                    {equipmentList.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Yet</h3>
                        <p className="text-gray-600 mb-4">Start by adding your first equipment</p>
                        <button 
                          onClick={openAddEquipmentModal}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Your First Equipment
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equipmentList.map((eq) => (
                          <div key={eq.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 relative">
                            <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              #{equipmentList.findIndex(e => e.id === eq.id) + 1}
                            </div>
                            
                            {eq.equipment_images && eq.equipment_images.length > 0 ? (
                              <img 
                                src={eq.equipment_images[0]} 
                                alt={eq.equipment_name}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="p-5">
                              <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{eq.equipment_name}</h3>
                              <p className="text-sm text-purple-600 font-medium mb-3">{eq.equipment_type}</p>

                              {eq.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{eq.description}</p>
                              )}

                              <div className="space-y-2 mb-4 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{eq.contact_person}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{eq.contact_number}</span>
                                </div>
                                {eq.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{eq.location}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  eq.availability === 'available' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {eq.availability === 'available' ? 'Available' : 'On Hire'}
                                </span>
                              </div>

                              <div className="flex gap-2 pt-3 border-t">
                                <button
                                  onClick={() => openEditEquipmentModal(eq)}
                                  className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h2>
              <button onClick={closeEquipmentModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Equipment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="equipmentName"
                        value={equipmentFormData.equipmentName}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Excavator CAT 320"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                        value={equipmentFormData.equipmentType}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Heavy Machinery"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={equipmentFormData.availability}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        <option value="available">Available</option>
                        <option value="on-hire">On Hire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={equipmentFormData.location}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Equipment location"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={equipmentFormData.description}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        placeholder="Additional details about the equipment..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={equipmentFormData.contactPerson}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                        value={equipmentFormData.contactNumber}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                        value={equipmentFormData.contactEmail}
                        onChange={handleEquipmentChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Equipment Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Images (Max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-purple-500">
                    <Upload className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEquipmentImagesChange}
                      className="hidden"
                      id="equipment-images"
                      disabled={uploading || equipmentFormData.equipmentImages.length >= 5}
                    />
                    <label htmlFor="equipment-images" className="cursor-pointer">
                      <span className="text-sm font-medium text-purple-600">
                        {uploading ? 'Uploading...' : 'Click to upload images'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB total</p>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {equipmentFormData.equipmentImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {equipmentFormData.equipmentImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Equipment ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeEquipmentModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={saving || uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEquipment}
                    disabled={saving || uploading}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      saving || uploading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {uploading ? 'Uploading...' : saving ? 'Saving...' : editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                  </button>
                </div>
              </form>
            </div>
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
                <h3 className="text-xl font-bold text-gray-900">Delete Equipment</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{equipmentToDelete.equipment_name}"</span>?
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
      {/* Review System Modal */}
{showReviews && (
  <ReviewSystem
    isModal={true}
    onClose={() => setShowReviews(false)}
    currentUser={{
      id: manpowerProfile?.id,
      firstName: formData.firstName,
      lastName: formData.lastName
    }}
  />
)}
    </div>
  );
};

export default BothDashboard;