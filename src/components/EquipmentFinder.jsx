import React, { useState, useEffect } from 'react';
import { Search, MapPin, Package, Phone, User, Filter, X, Menu, Home, Briefcase, Mail, Building2, MessageCircle } from 'lucide-react';

const EquipmentFinder = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileModal, setProfileModal] = useState({ 
  open: false, 
  userId: null, 
  data: null, 
  loading: false, 
  equipment: null  // ← ADD equipment field
});

const [inquiryModal, setInquiryModal] = useState({ 
  open: false, 
  equipmentId: null, 
  ownerEmail: null, 
  equipmentName: null 
});

const [inquiryForm, setInquiryForm] = useState({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    fetchEquipment();
    fetchStats();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/equipment-search/search`);
      const data = await response.json();

      if (data.success) {
        setEquipment(data.data || []);
      } else {
        setError(data.msg || 'Failed to load equipment');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error loading equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/equipment-search/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const fetchOwnerProfile = async (userId, equipmentItem) => {
  try {
    setProfileModal(prev => ({ 
      ...prev, 
      loading: true, 
      open: true, 
      equipment: equipmentItem  // ← Pass equipment data
    }));
    
    const response = await fetch(`${API_BASE}/equipment-search/owner-profile/${userId}`);
    const data = await response.json();

    if (data.success) {
      setProfileModal({
        open: true,
        userId: userId,
        data: data.data,
        loading: false,
        equipment: equipmentItem  // ← Store equipment data
      });
    } else {
      setError('Failed to load owner profile');
      setProfileModal({ 
        open: false, 
        userId: null, 
        data: null, 
        loading: false, 
        equipment: null 
      });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    setError('Error loading owner profile');
    setProfileModal({ 
      open: false, 
      userId: null, 
      data: null, 
      loading: false, 
      equipment: null 
    });
  }
};

  const closeProfileModal = () => {
    setProfileModal({ open: false, userId: null, data: null, loading: false });
  };

  const openInquiryModal = (equipmentId, ownerEmail, equipmentName) => {
  setInquiryModal({ open: true, equipmentId, ownerEmail, equipmentName });
  setInquiryForm({ name: '', email: '', phone: '', subject: '', message: '' });
};

const closeInquiryModal = () => {
  setInquiryModal({ open: false, equipmentId: null, ownerEmail: null, equipmentName: null });
  setInquiryForm({ name: '', email: '', phone: '', subject: '', message: '' });
};

const handleSendInquiry = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch(`${API_BASE}/inquiry/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipmentId: inquiryModal.equipmentId,
        ...inquiryForm
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('✅ ' + data.message);
      closeInquiryModal();
      closeProfileModal();
    } else {
      alert('❌ ' + (data.message || 'Failed to send inquiry'));
    }
  } catch (error) {
    console.error('Inquiry error:', error);
    alert('❌ Error sending inquiry. Please try again.');
  }
};

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (locationFilter.trim()) params.append('location', locationFilter.trim());
      if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);

      const response = await fetch(`${API_BASE}/equipment-search/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEquipment(data.data || []);
      } else {
        setError(data.msg || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching equipment');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setAvailabilityFilter('all');
    fetchEquipment();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading && equipment.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#3C6E71', borderTopColor: '#284B63' }}></div>
          <p style={{ color: '#353535' }}>Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D9D9D9' }}>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: '#353535' }}>Menu</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Home className="w-5 h-5" style={{ color: '#3C6E71' }} />
              <span style={{ color: '#353535' }}>Home</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/equipment'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
              style={{ backgroundColor: '#3C6E71' }}
            >
              <Package className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Equipment for Hire</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/manpower-finder'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Briefcase className="w-5 h-5" style={{ color: '#3C6E71' }} />
              <span style={{ color: '#353535' }}>Find Manpower</span>
            </button>
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-4">Equipment for Hire</p>
            <p className="text-sm" style={{ color: '#353535' }}>Find the right equipment for your project</p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {profileModal.loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#3C6E71', borderTopColor: '#284B63' }}></div>
                <p style={{ color: '#353535' }}>Loading profile...</p>
              </div>
            ) : profileModal.data ? (
              <>
                {/* Modal Header - Minimal */}
                <div className="relative border-b px-6 py-4" style={{ borderColor: '#e5e7eb' }}>
                  <button
                    onClick={closeProfileModal}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" style={{ color: '#353535' }} />
                  </button>
                  
                  {/* Owner Profile Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 overflow-hidden bg-white flex-shrink-0" style={{ borderColor: '#3C6E71' }}>
                      {profileModal.data.profile_photo ? (
                        <img
                          src={profileModal.data.profile_photo}
                          alt={profileModal.data.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold mb-1 truncate" style={{ color: '#353535' }}>
                        {profileModal.data.name}
                      </h2>
                      {profileModal.data.company_name && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#3C6E71' }}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium truncate">{profileModal.data.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="pt-20 px-8 pb-8">

                  {/* Equipment Being Viewed */}
{profileModal.equipment && (
  <div className="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border-2 border-teal-200">
    <div className="flex items-start gap-4">
      {profileModal.equipment.equipmentImages?.[0] ? (
        <img 
          src={profileModal.equipment.equipmentImages[0]} 
          alt={profileModal.equipment.equipmentName}
          className="w-24 h-24 object-cover rounded-lg shadow-md"
        />
      ) : (
        <div className="w-24 h-24 flex items-center justify-center rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
          <Package className="w-12 h-12" style={{ color: '#3C6E71' }} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-600 mb-1">📋 You're inquiring about:</p>
        <h3 className="text-xl font-bold mb-1" style={{ color: '#353535' }}>
          {profileModal.equipment.equipmentName}
        </h3>
        <p className="text-sm font-medium mb-2" style={{ color: '#3C6E71' }}>
          {profileModal.equipment.equipmentType}
        </p>
        {profileModal.equipment.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {profileModal.equipment.description}
          </p>
        )}
      </div>
    </div>
  </div>
)}
                  {/* Owner Info */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#353535' }}>
                      {profileModal.data.name}
                    </h2>
                    {profileModal.data.company_name && (
                      <div className="flex items-center gap-2 text-lg mb-3" style={{ color: '#3C6E71' }}>
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">{profileModal.data.company_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Mobile Number</p>
                          <p className="font-semibold" style={{ color: '#353535' }}>{profileModal.data.mobile_number}</p>
                        </div>
                      </div>
                    </div>

                    {profileModal.data.whatsapp_number && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">WhatsApp</p>
                            <p className="font-semibold" style={{ color: '#353535' }}>{profileModal.data.whatsapp_number}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-sm break-all" style={{ color: '#353535' }}>{profileModal.data.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-semibold" style={{ color: '#353535' }}>{profileModal.data.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Count Badge */}
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8" style={{ color: '#3C6E71' }} />
                        <div>
                          <p className="text-sm text-gray-600">Total Equipment Listed</p>
                          <p className="text-2xl font-bold" style={{ color: '#3C6E71' }}>
                            {profileModal.data.equipment_count || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Button */}
                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => window.open(`tel:${profileModal.data.mobile_number}`)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#3C6E71', color: 'white' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
                    >
                      <Phone className="w-5 h-5" />
                      Call
                    </button>
                    
                    {profileModal.data.whatsapp_number && (
                      <button
                        onClick={() => window.open(`https://wa.me/${profileModal.data.whatsapp_number.replace(/[^0-9]/g, '')}`)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
                      >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        openInquiryModal(
                          profileModal.equipment?.id,
                          profileModal.data.email,
                          profileModal.equipment?.equipmentName
                        );
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-white"
                      style={{ backgroundColor: '#3C6E71' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
                    >
                      <Mail className="w-5 h-5" />
                      Inquiry
                    </button>
                  </div>

                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p style={{ color: '#353535' }}>Profile not found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
{inquiryModal.open && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
      <div className="p-6 border-b" style={{ borderColor: '#3C6E71' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: '#353535' }}>
            Send Inquiry
          </h2>
          <button
            onClick={closeInquiryModal}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Inquiring about: <strong>{inquiryModal.equipmentName}</strong>
        </p>
      </div>

      <form onSubmit={handleSendInquiry} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
            Your Name *
          </label>
          <input
            type="text"
            required
            value={inquiryForm.name}
            onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ borderColor: '#3C6E71' }}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
            Your Email *
          </label>
          <input
            type="email"
            required
            value={inquiryForm.email}
            onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ borderColor: '#3C6E71' }}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={inquiryForm.phone}
            onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ borderColor: '#3C6E71' }}
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
            Subject
          </label>
          <input
            type="text"
            value={inquiryForm.subject}
            onChange={(e) => setInquiryForm({...inquiryForm, subject: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ borderColor: '#3C6E71' }}
            placeholder="Rental inquiry"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
            Message *
          </label>
          <textarea
            required
            value={inquiryForm.message}
            onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none resize-none"
            style={{ borderColor: '#3C6E71' }}
            rows="4"
            placeholder="I'm interested in renting this equipment..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={closeInquiryModal}
            className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
            style={{ borderColor: '#3C6E71', color: '#353535' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: '#3C6E71' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
          >
            Send Inquiry
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Top Bar with Menu Button */}
      <div className="bg-white shadow-sm border-b" style={{ borderColor: '#3C6E71' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" style={{ color: '#353535' }} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3C6E71' }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#353535' }}>Equipment for Hire</h1>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home className="w-6 h-6" style={{ color: '#353535' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border" style={{ borderColor: '#3C6E71' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#353535' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name or type..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#3C6E71' }}
                onFocus={(e) => e.target.style.borderColor = '#284B63'}
                onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
              />
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#353535' }} />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Filter by location..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#3C6E71' }}
                onFocus={(e) => e.target.style.borderColor = '#284B63'}
                onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
              />
            </div>

            {/* Availability Select */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
              style={{ borderColor: '#3C6E71' }}
              onFocus={(e) => e.target.style.borderColor = '#284B63'}
              onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
            >
              <option value="all">All Availabilities</option>
              <option value="available">Available</option>
              <option value="on-hire">On Hire</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#3C6E71' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#284B63')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3C6E71')}
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-3 border rounded-lg font-medium transition-colors"
              style={{ borderColor: '#3C6E71', color: '#353535' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#D9D9D9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#353535' }}>
            Showing {equipment.length} Equipment
          </h2>
          {(searchTerm || locationFilter || availabilityFilter !== 'all') && (
            <div className="text-sm" style={{ color: '#353535' }}>
              Filtered results
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Equipment Grid */}
        {equipment.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center" style={{ borderColor: '#3C6E71' }}>
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#3C6E71' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#353535' }}>No Equipment Found</h3>
            <p className="mb-6" style={{ color: '#353535' }}>
              {searchTerm || locationFilter || availabilityFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No equipment is currently listed'}
            </p>
            {(searchTerm || locationFilter || availabilityFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#3C6E71' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border"
                style={{ borderColor: '#3C6E71' }}
              >
                {/* Equipment Image */}
                <div className="relative h-48" style={{ backgroundColor: '#D9D9D9' }}>
                  {item.equipmentImages && item.equipmentImages.length > 0 ? (
                    <img
                      src={item.equipmentImages[0]}
                      alt={item.equipmentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16" style={{ color: '#3C6E71' }} />
                    </div>
                  )}
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.availability === 'available'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {item.availability === 'available' ? 'Available' : 'On Hire'}
                    </span>
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1 truncate" style={{ color: '#353535' }}>
                    {item.equipmentName}
                  </h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#3C6E71' }}>
                    {item.equipmentType}
                  </p>

                  {item.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: '#353535' }}>
                      {item.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-xs" style={{ color: '#353535' }}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{item.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{item.contactNumber}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>

                 {/* Action Button */}
                  <button
                    onClick={() => fetchOwnerProfile(item.user_id, item)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#3C6E71', color: 'white' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#284B63'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3C6E71'}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentFinder;