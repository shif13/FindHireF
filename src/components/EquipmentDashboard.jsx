import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Upload, X,MessageSquare,  User, Phone, Mail, MapPin, Building2, AlertCircle, LogOut, Settings, Camera, ToggleRight, ToggleLeft, Search, Bell } from 'lucide-react';
import { uploadMultipleToCloudinary } from '../utils/cloudinaryHelper';
import ReviewSystem from '../components/ReviewComponent';

const EquipmentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  

  // Review Modal State
  const [showReviews, setShowReviews] = useState(false);

  // Form states
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [equipmentForm, setEquipmentForm] = useState({
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

  const [profileForm, setProfileForm] = useState({
    name: '',
    companyName: '',
    location: '',
    mobileNumber: '',
    whatsappNumber: '',
    profilePhoto: null
  });

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // Fetch profile and equipment on mount
  useEffect(() => {
    fetchProfileAndEquipment();
  }, []);

  const fetchProfileAndEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_BASE}/equipment/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setEquipment(data.equipment || []);
        
        setProfileForm({
          name: data.profile.name || '',
          companyName: data.profile.company_name || '',
          location: data.profile.location || '',
          mobileNumber: data.profile.mobile_number || '',
          whatsappNumber: data.profile.whatsapp_number || '',
          profilePhoto: null
        });
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

// Replace handleImageUpload function
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  if (equipmentForm.equipmentImages.length + files.length > 5) {
    setError('Maximum 5 images allowed');
    return;
  }

  setUploading(true);
  setError('');

  try {
    const urls = await uploadMultipleToCloudinary(files, 'equipment_images');
    setEquipmentForm(prev => ({
      ...prev,
      equipmentImages: [...prev.equipmentImages, ...urls]
    }));
    setSuccess('Images uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    setError('Failed to upload images. Please check your Cloudinary configuration.');
  } finally {
    setUploading(false);
  }
};

  const handleRemoveImage = (index) => {
    setEquipmentForm(prev => ({
      ...prev,
      equipmentImages: prev.equipmentImages.filter((_, i) => i !== index)
    }));
  };

  const openAddModal = () => {
    setEquipmentForm({
      equipmentName: '',
      equipmentType: '',
      availability: 'available',
      location: profile?.location || '',
      contactPerson: profile?.name || '',
      contactNumber: profile?.mobile_number || '',
      contactEmail: profile?.email || '',
      description: '',
      equipmentImages: []
    });
    setShowAddModal(true);
  };

  const openEditModal = (eq) => {
    setEditingEquipment(eq);
    setEquipmentForm({
      equipmentName: eq.equipment_name || eq.equipmentName || '',
      equipmentType: eq.equipment_type || eq.equipmentType || '',
      availability: eq.availability || 'available',
      location: eq.location || '',
      contactPerson: eq.contact_person || eq.contactPerson || '',
      contactNumber: eq.contact_number || eq.contactNumber || '',
      contactEmail: eq.contact_email || eq.contactEmail || '',
      description: eq.description || '',
      equipmentImages: eq.equipment_images || eq.equipmentImages || []
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEquipment(null);
    setError('');
    setSuccess('');
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/equipment/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Equipment added successfully!');
        closeModals();
        fetchProfileAndEquipment();
      } else {
        setError(data.message || 'Failed to add equipment');
      }
    } catch (error) {
      console.error('Add error:', error);
      setError('Error adding equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/equipment/update/${editingEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Equipment updated successfully!');
        closeModals();
        fetchProfileAndEquipment();
      } else {
        setError(data.message || 'Failed to update equipment');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Error updating equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/equipment/delete/${equipmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Equipment deleted successfully!');
        setShowDeleteDialog(false);
        setEquipmentToDelete(null);
        fetchProfileAndEquipment();
      } else {
        setError(data.message || 'Failed to delete equipment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting equipment');
    }
  };

  const handleToggleAvailability = async (eq) => {
    try {
      const token = localStorage.getItem('token');
      const newAvailability = eq.availability === 'available' ? 'on-hire' : 'available';
      
      const response = await fetch(`${API_BASE}/equipment/update/${eq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eq,
          availability: newAvailability
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchProfileAndEquipment();
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key] && key !== 'profilePhoto') {
          formData.append(key, profileForm[key]);
        }
      });

      if (profileForm.profilePhoto) {
        formData.append('profilePhoto', profileForm.profilePhoto);
      }

      const response = await fetch(`${API_BASE}/equipment/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile updated successfully!');
        setShowProfileModal(false);
        fetchProfileAndEquipment();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError('Error updating profile');
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDE0D4' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#DDB892', borderTopColor: '#7F5539' }}></div>
          <p style={{ color: '#7F5539' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDE0D4' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: '#DDB892' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B08968' }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#7F5539' }}>Equipment Dashboard</h1>
                <p className="text-sm" style={{ color: '#9C6644' }}>{profile?.name || 'Equipment Owner'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-opacity-10 transition-colors" style={{ backgroundColor: '#E6CCB2' }}>
                <Bell className="w-5 h-5" style={{ color: '#7F5539' }} />
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ backgroundColor: '#E6CCB2' }}
              >
                <Settings className="w-5 h-5" style={{ color: '#7F5539' }} />
              </button>

              <button
  onClick={() => setShowReviews(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
  style={{ backgroundColor: '#B08968' }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#7F5539'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#B08968'}
>
  <MessageSquare className="w-4 h-4" />
  Reviews
</button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#7F5539' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#9C6644'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#7F5539'}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: '#E6CCB2', borderColor: '#B08968' }}>
            <p style={{ color: '#7F5539' }}>{success}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border" style={{ borderColor: '#DDB892' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: '#B08968', backgroundColor: '#E6CCB2' }}>
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10" style={{ color: '#9C6644' }} />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#7F5539' }}>{profile?.name}</h2>
                {profile?.company_name && (
                  <p className="text-sm flex items-center gap-2 mt-1" style={{ color: '#9C6644' }}>
                    <Building2 className="w-4 h-4" />
                    {profile.company_name}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#9C6644' }}>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile?.mobile_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile?.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: '#7F5539' }}>
                {equipment.length}
              </div>
              <p className="text-sm" style={{ color: '#9C6644' }}>Equipment Listed</p>
            </div>
          </div>
        </div>

        {/* Add Equipment Button */}
        <div className="mb-8">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-semibold"
            style={{ backgroundColor: '#B08968' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7F5539'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#B08968'}
          >
            <Plus className="w-5 h-5" />
            Add New Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        {equipment.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center" style={{ borderColor: '#DDB892' }}>
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#B08968' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#7F5539' }}>No Equipment Yet</h3>
            <p className="mb-6" style={{ color: '#9C6644' }}>Start by adding your first equipment to your inventory</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#B08968' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7F5539'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#B08968'}
            >
              <Plus className="w-5 h-5" />
              Add Your First Equipment
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#7F5539' }}>My Equipment Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((eq) => (
                <div key={eq.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border" style={{ borderColor: '#E6CCB2' }}>
                  {/* Equipment Image */}
                  <div className="relative h-48" style={{ backgroundColor: '#E6CCB2' }}>
                    {eq.equipment_images && Array.isArray(eq.equipment_images) && eq.equipment_images.length > 0 ? (
                      <img
                        src={eq.equipment_images[0]}
                        alt={eq.equipment_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16" style={{ color: '#B08968' }} />
                      </div>
                    )}
                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleAvailability(eq)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                          eq.availability === 'available'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        {eq.availability === 'available' ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Available
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            On Hire
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Equipment Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1 truncate" style={{ color: '#7F5539' }}>
                      {eq.equipment_name}
                    </h3>
                    <p className="text-sm font-medium mb-3" style={{ color: '#B08968' }}>
                      {eq.equipment_type}
                    </p>

                    {eq.description && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: '#9C6644' }}>
                        {eq.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-xs" style={{ color: '#9C6644' }}>
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

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(eq)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: '#E6CCB2', color: '#7F5539' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#DDB892'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#E6CCB2'}
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

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center" style={{ borderColor: '#DDB892' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#7F5539' }}>Add New Equipment</h2>
              <button onClick={closeModals} style={{ color: '#9C6644' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="p-6 space-y-6">
              {/* Equipment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#7F5539' }}>Equipment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={equipmentForm.equipmentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892', focusRingColor: '#B08968' }}
                      placeholder="e.g., Excavator CAT 320"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentType"
                      value={equipmentForm.equipmentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      placeholder="e.g., Heavy Machinery"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                    >
                      <option value="available">Available</option>
                      <option value="on-hire">On Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={equipmentForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      placeholder="Equipment location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ borderColor: '#DDB892' }}
                      placeholder="Additional details about the equipment..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#7F5539' }}>Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={equipmentForm.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={equipmentForm.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={equipmentForm.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Images */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Equipment Images (Max 5)
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors" style={{ borderColor: '#DDB892' }}>
                  <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: '#B08968' }} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="equipment-images"
                    disabled={uploading || equipmentForm.equipmentImages.length >= 5}
                  />
                  <label htmlFor="equipment-images" className="cursor-pointer">
                    <span className="text-sm font-medium" style={{ color: '#B08968' }}>
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#9C6644' }}>PNG, JPG up to 10MB total</p>
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {equipmentForm.equipmentImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {equipmentForm.equipmentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2"
                          style={{ borderColor: '#DDB892' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
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
                  onClick={closeModals}
                  className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#DDB892', color: '#7F5539' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#EDE0D4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#B08968' }}
                  onMouseEnter={(e) => !saving && !uploading && (e.target.style.backgroundColor = '#7F5539')}
                  onMouseLeave={(e) => !saving && !uploading && (e.target.style.backgroundColor = '#B08968')}
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
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center" style={{ borderColor: '#DDB892' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#7F5539' }}>Edit Equipment</h2>
              <button onClick={closeModals} style={{ color: '#9C6644' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="p-6 space-y-6">
              {/* Equipment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#7F5539' }}>Equipment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={equipmentForm.equipmentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentType"
                      value={equipmentForm.equipmentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                    >
                      <option value="available">Available</option>
                      <option value="on-hire">On Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={equipmentForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ borderColor: '#DDB892' }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#7F5539' }}>Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={equipmentForm.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={equipmentForm.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={equipmentForm.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#DDB892' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Images */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Equipment Images (Max 5)
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors" style={{ borderColor: '#DDB892' }}>
                  <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: '#B08968' }} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="edit-equipment-images"
                    disabled={uploading || equipmentForm.equipmentImages.length >= 5}
                  />
                  <label htmlFor="edit-equipment-images" className="cursor-pointer">
                    <span className="text-sm font-medium" style={{ color: '#B08968' }}>
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#9C6644' }}>PNG, JPG up to 10MB total</p>
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {equipmentForm.equipmentImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {equipmentForm.equipmentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={typeof img === 'string' ? img : img.path || img}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2"
                          style={{ borderColor: '#DDB892' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
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
                  onClick={closeModals}
                  className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#DDB892', color: '#7F5539' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#EDE0D4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#B08968' }}
                  onMouseEnter={(e) => !saving && !uploading && (e.target.style.backgroundColor = '#7F5539')}
                  onMouseLeave={(e) => !saving && !uploading && (e.target.style.backgroundColor = '#B08968')}
                >
                  {saving ? 'Updating...' : 'Update Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl" style={{ borderColor: '#DDB892' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#7F5539' }}>Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ color: '#9C6644' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {/* Profile Photo */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 mb-3" style={{ borderColor: '#B08968', backgroundColor: '#E6CCB2' }}>
                  {profile?.profile_photo ? (
                    <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12" style={{ color: '#9C6644' }} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileForm(prev => ({ ...prev, profilePhoto: e.target.files[0] }))}
                  className="hidden"
                  id="profile-photo-input"
                />
                <label
                  htmlFor="profile-photo-input"
                  className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
                  style={{ backgroundColor: '#E6CCB2', color: '#7F5539' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#DDB892'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#E6CCB2'}
                >
                  Change Photo
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#DDB892' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={profileForm.companyName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#DDB892' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={profileForm.mobileNumber}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#DDB892' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={profileForm.whatsappNumber}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#DDB892' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7F5539' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#DDB892' }}
                  placeholder="City, Country"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: '#DDB892', color: '#7F5539' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#EDE0D4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#B08968' }}
                  onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#7F5539')}
                  onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#B08968')}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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
                <h3 className="text-xl font-bold" style={{ color: '#7F5539' }}>Delete Equipment</h3>
                <p className="text-sm" style={{ color: '#9C6644' }}>This action cannot be undone</p>
              </div>
            </div>

            <p className="mb-6" style={{ color: '#7F5539' }}>
              Are you sure you want to delete <span className="font-semibold">"{equipmentToDelete.equipment_name}"</span>?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setEquipmentToDelete(null);
                }}
                className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
                style={{ borderColor: '#DDB892', color: '#7F5539' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#EDE0D4'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
      id: profile?.id,
      firstName: profile?.name?.split(' ')[0] || '',
      lastName: profile?.name?.split(' ')[1] || ''
    }}
  />
)}
    </div>
    
  );
};

export default EquipmentDashboard;