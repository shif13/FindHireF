import React, { useState, useEffect } from 'react';
import { 
  Package, LogOut, Plus, Edit, Trash2, X, Upload, 
  AlertCircle, CheckCircle, Loader, MapPin, Phone, 
  Mail, User, Image as ImageIcon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const EquipmentDashboard = () => {
  const [user, setUser] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  // Form states
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: '',
    equipmentType: '',
    location: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    availability: 'available',
    description: '',
    equipmentImages: []
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    location: ''
  });

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

      const response = await fetch(`${API_BASE}/api/equipment-owner/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEquipment(data.equipment || []);

        // Pre-fill profile form
        setProfileForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          location: data.user.location || ''
        });

        // Pre-fill equipment form with user contact details
        setEquipmentForm(prev => ({
          ...prev,
          contactPerson: `${data.user.firstName} ${data.user.lastName}`,
          contactNumber: data.user.phone || '',
          contactEmail: data.user.email || '',
          location: data.user.location || ''
        }));
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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError('Total image size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      
      setEquipmentForm(prev => ({
        ...prev,
        equipmentImages: [...prev.equipmentImages, ...urls].slice(0, 5)
      }));
      setSuccess(`${files.length} image(s) uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload images');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const openAddModal = () => {
    // Reset form and pre-fill contact details
    setEquipmentForm({
      equipmentName: '',
      equipmentType: '',
      location: user?.location || '',
      contactPerson: `${user?.firstName} ${user?.lastName}`,
      contactNumber: user?.phone || '',
      contactEmail: user?.email || '',
      availability: 'available',
      description: '',
      equipmentImages: []
    });
    setShowAddModal(true);
  };

  const openEditModal = (eq) => {
    setEditingEquipment(eq);
    setEquipmentForm({
      equipmentName: eq.equipmentName,
      equipmentType: eq.equipmentType,
      location: eq.location || '',
      contactPerson: eq.contactPerson,
      contactNumber: eq.contactNumber,
      contactEmail: eq.contactEmail,
      availability: eq.availability,
      description: eq.description || '',
      equipmentImages: eq.equipmentImages || []
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowProfileModal(false);
    setEditingEquipment(null);
    setError('');
    setSuccess('');
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();

    if (!equipmentForm.equipmentName || !equipmentForm.equipmentType) {
      setError('Equipment name and type are required');
      return;
    }

    if (!equipmentForm.contactPerson || !equipmentForm.contactNumber || !equipmentForm.contactEmail) {
      setError('All contact fields are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Equipment added successfully!');
        setTimeout(() => {
          closeModals();
          fetchProfile();
        }, 1500);
      } else {
        setError(data.msg || 'Failed to add equipment');
      }
    } catch (err) {
      console.error('Add equipment error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/${editingEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Equipment updated successfully!');
        setTimeout(() => {
          closeModals();
          fetchProfile();
        }, 1500);
      } else {
        setError(data.msg || 'Failed to update equipment');
      }
    } catch (err) {
      console.error('Update equipment error:', err);
      setError('Network error. Please try again.');
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Equipment deleted successfully!');
        setShowDeleteDialog(false);
        setEquipmentToDelete(null);
        fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to delete equipment');
      }
    } catch (err) {
      console.error('Delete equipment error:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleToggleAvailability = async (eq) => {
    const newAvailability = eq.availability === 'available' ? 'on-hire' : 'available';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/equipment-owner/${eq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...eq,
          availability: newAvailability
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchProfile();
      } else {
        setError('Failed to update availability');
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
      setError('Network error. Please try again.');
    }
  };

  // Replace the handleUpdateProfile function in EquipmentDashboard.jsx with this:

const handleUpdateProfile = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    setError('');

    const token = localStorage.getItem('token');

    // Use the equipment profile route instead of generic user route
    const response = await fetch(`${API_BASE}/api/equipment-owner/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileForm)
    });

    const data = await response.json();

    if (data.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowProfileModal(false);
        fetchProfile();
      }, 1500);
    } else {
      setError(data.msg || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Update profile error:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Equipment Owner Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4 text-green-400 hover:text-green-600" />
            </button>
          </div>
        )}

        {/* Add Equipment Button */}
        <div className="mb-8">
          <button
            onClick={openAddModal}
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
            <p className="text-gray-500 mb-6">Start by adding your first equipment to your inventory</p>
            <button
              onClick={openAddModal}
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
                        //src={typeof eq.equipmentImages[0] === 'string' ? eq.equipmentImages[0] : eq.equipmentImages[0].path}
                        src={eq.equipmentImages[0]}
                        alt={eq.equipmentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                    {/* Availability Badge */}
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
                        onClick={() => openEditModal(eq)}
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
              {/* Equipment Details */}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Heavy Machinery"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      value={equipmentForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Equipment location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Additional details about the equipment..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
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
                    <span className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB total</p>
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
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
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
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
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
              {/* Equipment Details */}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Heavy Machinery"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={equipmentForm.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      value={equipmentForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Equipment location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={equipmentForm.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Additional details about the equipment..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
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
                    <span className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB total</p>
                  </label>
                </div>

                {/* Uploaded Images Preview */}
                {equipmentForm.equipmentImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {equipmentForm.equipmentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.path || img}
                          alt={`Equipment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
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
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="City, Country"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default EquipmentDashboard;