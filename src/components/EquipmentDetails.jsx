import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Eye, Mail, Phone, MessageCircle, ArrowLeft, CheckCircle, XCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const EquipmentDetails = () => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailData, setEmailData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    message: ''
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ show: false, type: '', message: '' });

const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchEquipmentDetails();
  }, []);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const equipmentId = window.location.pathname.split('/').pop();
      
      const response = await fetch(`${API_BASE}/equipment/${equipmentId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.equipment) {
        setEquipment(data.equipment);
        setEmailData(prev => ({
          ...prev,
          message: `Hello,\n\nI'm interested in renting your ${data.equipment.equipmentName}.\n\nCould you please provide more information about:\n- Availability dates\n- Rental terms and pricing\n- Pickup/delivery options\n\nThank you!`
        }));
      } else {
        setError('Equipment not found');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^uploads\//, '');
return `${import.meta.env.VITE_BACKEND_URL}/uploads/${cleanPath}`;  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? equipment.equipmentImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === equipment.equipmentImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleWhatsAppClick = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const message = `Hello! I'm interested in renting your ${equipment.equipmentName}. Is it still available?`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
    setEmailStatus({ show: false, type: '', message: '' });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailData.senderName || !emailData.senderEmail || !emailData.message) {
      setEmailStatus({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.senderEmail)) {
      setEmailStatus({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    try {
      setEmailSending(true);
      setEmailStatus({ show: false, type: '', message: '' });

      const response = await fetch(`${API_BASE}/contact/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          equipmentId: equipment.id,
          inquiryData: {
            name: emailData.senderName,
            email: emailData.senderEmail,
            phone: emailData.senderPhone,
            message: emailData.message
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailStatus({
          show: true,
          type: 'success',
          message: 'Inquiry sent successfully! The equipment owner will receive your message.'
        });
        
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailData({
            senderName: '',
            senderEmail: '',
            senderPhone: '',
            message: `Hello,\n\nI'm interested in renting your ${equipment.equipmentName}.\n\nCould you please provide more information about:\n- Availability dates\n- Rental terms and pricing\n- Pickup/delivery options\n\nThank you!`
          });
          setEmailStatus({ show: false, type: '', message: '' });
        }, 2000);
      } else {
        setEmailStatus({
          show: true,
          type: 'error',
          message: data.message || 'Failed to send inquiry. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setEmailStatus({
        show: true,
        type: 'error',
        message: 'Failed to send inquiry. Please try again later.'
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      const next = form.elements[index + 1];
      if (next) next.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Equipment not found'}</p>
          <button
            onClick={handleBack}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  // Get equipment images
  const equipmentImages = equipment.equipmentImages && equipment.equipmentImages.length > 0 
    ? equipment.equipmentImages 
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Lightbox Modal */}
      {showImageModal && equipmentImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous button */}
            {equipmentImages.length > 1 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Image */}
            <img
              src={getImageUrl(equipmentImages[currentImageIndex].path)}
              alt={`Equipment ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Next button */}
            {equipmentImages.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Image counter */}
            {equipmentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full">
                {currentImageIndex + 1} / {equipmentImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Inquire About {equipment.equipmentName}</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {emailStatus.show && (
                <div className={`mb-4 p-4 rounded-lg ${
                  emailStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {emailStatus.message}
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailData.senderName}
                    onChange={(e) => setEmailData({ ...emailData, senderName: e.target.value })}
                    onKeyDown={handleEnterKey}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your name"
                    disabled={emailSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailData.senderEmail}
                    onChange={(e) => setEmailData({ ...emailData, senderEmail: e.target.value })}
                    onKeyDown={handleEnterKey}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    disabled={emailSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={emailData.senderPhone}
                    onChange={(e) => setEmailData({ ...emailData, senderPhone: e.target.value })}
                    onKeyDown={handleEnterKey}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+1234567890"
                    disabled={emailSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Write your inquiry here..."
                    disabled={emailSending}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    disabled={emailSending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={emailSending}
                  >
                    {emailSending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Listings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Image Section */}
          <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
            {equipmentImages.length > 0 ? (
              <img
                src={getImageUrl(equipmentImages[0].path)}
                alt={equipment.equipmentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-xl">No images available</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Availability Badge */}
            <div className="absolute top-4 right-4">
              {equipment.availability === 'available' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">On-Hire</span>
                </div>
              )}
            </div>

            {/* Equipment Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{equipment.equipmentName}</h1>
              <p className="text-xl opacity-90">{equipment.equipmentType}</p>
            </div>
          </div>

          {/* Image Gallery Thumbnails */}
          {equipmentImages.length > 1 && (
            <div className="px-8 py-6 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Equipment Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {equipmentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all group"
                  >
                    <img
                      src={getImageUrl(image.path)}
                      alt={`Equipment ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center">
                      <Eye className="text-white w-6 h-6" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Info */}
          <div className="px-8 py-6">
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b">
              {equipment.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">{equipment.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className={`font-semibold ${equipment.availability === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                  {equipment.availability === 'available' ? 'Available Now' : 'Currently On-Hire'}
                </span>
              </div>

              {equipment.views !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">{equipment.views} views</span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact Person</h3>
                <p className="text-lg font-medium text-gray-900 mb-4">{equipment.contactPerson}</p>
              </div>
              
              {equipment.contactNumber && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleWhatsAppClick(equipment.contactNumber)}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 group-hover:text-green-600">WhatsApp</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">{equipment.contactNumber}</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePhoneClick(equipment.contactNumber)}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 group-hover:text-blue-600">Phone</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{equipment.contactNumber}</p>
                    </div>
                  </button>
                </div>
              )}
              
              {equipment.contactEmail && (
                <button
                  onClick={handleEmailClick}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group"
                >
                  <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-gray-500 group-hover:text-emerald-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 break-all">{equipment.contactEmail}</p>
                  </div>
                </button>
              )}
            </div>

            {/* Equipment Description */}
            {equipment.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Equipment Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{equipment.description}</p>
              </div>
            )}

            {/* Availability Status Card */}
            <div className={`rounded-lg p-6 ${
              equipment.availability === 'available' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {equipment.availability === 'available' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">This equipment is available for hire</p>
                      <p className="text-sm text-green-700">Contact the owner to arrange rental details</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">This equipment is currently on-hire</p>
                      <p className="text-sm text-red-700">Check back later or contact the owner for availability</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;