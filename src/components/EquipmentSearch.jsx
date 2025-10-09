import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, ArrowLeft, Wrench, Mail, Phone, User, FileText, X } from 'lucide-react';

const EquipmentSearch = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [contactModal, setContactModal] = useState({ show: false, equipment: null });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, locationFilter, availabilityFilter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (locationFilter.trim()) params.append('location', locationFilter.trim());
      if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
      
      const url = `https://projectk-6vkc.onrender.com/api/equipment/search${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setEquipment(data.data);
      } else {
        setError(data.msg || 'Failed to fetch equipment');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedEquipment(item);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEquipment(null);
  };

  const openContactModal = (equipmentItem) => {
    setContactModal({ show: true, equipment: equipmentItem });
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: `Hi, I'm interested in renting "${equipmentItem.equipmentName}". Please let me know the availability and booking process.`
    });
    setContactSuccess('');
    setContactError('');
  };

  const closeContactModal = () => {
    setContactModal({ show: false, equipment: null });
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setContactSuccess('');
    setContactError('');
  };

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setContactError('Please enter a valid email address');
      return;
    }

    try {
      setContactLoading(true);
      setContactError('');
      setContactSuccess('');

      const payload = {
        equipmentId: contactModal.equipment.id,
        equipmentName: contactModal.equipment.equipmentName,
        ownerEmail: contactModal.equipment.contactEmail,
        ownerName: contactModal.equipment.contactPerson,
        location: contactModal.equipment.location,
        inquirerName: contactForm.name,
        inquirerEmail: contactForm.email,
        inquirerPhone: contactForm.phone,
        message: contactForm.message
      };

      const response = await fetch('https://projectk-6vkc.onrender.com/api/equipment/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setContactSuccess('Your inquiry has been sent successfully!');
        setContactForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          closeContactModal();
        }, 2000);
      } else {
        setContactError(data.msg || 'Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      setContactError('Failed to send inquiry. Please try again later.');
      console.error('Contact error:', err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const getAvailabilityBadge = (availability) => {
    if (availability === 'available') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Available
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        On Hire
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <button 
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home size={20} />
              <span className="text-sm font-medium">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Equipment for Hire</h1>
          </div>
          <p className="text-lg text-gray-600">Find the right equipment for your project.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Availabilities</option>
              <option value="available">Available</option>
              <option value="on-hire">On Hire</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {equipment.length} equipment
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading equipment...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && equipment.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600">No equipment found matching your criteria.</p>
          </div>
        )}

        {/* Equipment Grid */}
        {!loading && !error && equipment.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {item.equipmentName}
                      </h3>
                      <p className="text-sm text-gray-600">{item.equipmentType}</p>
                    </div>
                    {getAvailabilityBadge(item.availability)}
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{item.contactPerson}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(item)}
                    className="w-full mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEquipment.equipmentName}
                </h2>
                <p className="text-gray-600">{selectedEquipment.equipmentType}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
                {getAvailabilityBadge(selectedEquipment.availability)}
              </div>

              {/* Location */}
              {selectedEquipment.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{selectedEquipment.location}</span>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-800">
                    <User size={18} className="text-gray-400" />
                    <span>{selectedEquipment.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-800">
                    <Phone size={18} className="text-gray-400" />
                    <span>{selectedEquipment.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-800">
                    <Mail size={18} className="text-gray-400" />
                    <span>{selectedEquipment.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Condition Files */}
              {selectedEquipment.equipmentConditionFiles && selectedEquipment.equipmentConditionFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Equipment Condition Documents</h3>
                  <div className="space-y-2">
                    {selectedEquipment.equipmentConditionFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1">{file.originalName}</span>
                        <a
                          href={`https://projectk-6vkc.onrender.com/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    closeDetailsModal();
                    openContactModal(selectedEquipment);
                  }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Send Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModal.show && contactModal.equipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Send Inquiry
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {contactModal.equipment.equipmentName}
                </p>
              </div>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {contactSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                  {contactSuccess}
                </div>
              )}

              {contactError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {contactError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactInputChange}
                    placeholder="Enter your phone (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmitContact}
                    disabled={contactLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {contactLoading ? 'Sending...' : 'Send Inquiry'}
                  </button>
                  <button
                    onClick={closeContactModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSearch;