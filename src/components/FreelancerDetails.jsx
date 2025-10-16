import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Eye, Mail, Phone, MessageCircle, ArrowLeft, FileText, Award, X, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const FreelancerDetails = () => {
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [emailData, setEmailData] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    message: ''
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchFreelancerDetails();
  }, []);

  const fetchFreelancerDetails = async () => {
    try {
      setLoading(true);
      const freelancerId = window.location.pathname.split('/').pop();
      
const response = await fetch(`${API_BASE}/api/freelancers/${freelancerId}`, {
          headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.freelancer) {
        setFreelancer(data.freelancer);
        setEmailData(prev => ({
          ...prev,
          subject: `Inquiry about ${data.freelancer.title || 'your profile'}`,
          message: `Hello ${data.freelancer.firstName},\n\nI found your profile on ProFetch and I'm interested in discussing a potential opportunity.\n\n`
        }));
      } else {
        setError('Freelancer not found');
      }
    } catch (error) {
      console.error('Error fetching freelancer:', error);
      setError('Failed to load freelancer details');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserColor = (firstName, lastName) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const name = `${firstName}${lastName}`;
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleViewCV = () => {
    if (freelancer?.cvFilePath) {
      // Remove any leading 'uploads/' from the path
      const cleanPath = freelancer.cvFilePath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
const finalUrl = `${API_BASE}/uploads/${cleanPath}`;
      console.log('CV Path:', freelancer.cvFilePath);
      console.log('Clean Path:', cleanPath);
      console.log('Final URL:', finalUrl);
      setCurrentDocument({ 
        url: finalUrl, 
        name: `CV - ${freelancer.firstName} ${freelancer.lastName}.pdf`,
        type: 'cv'
      });
      setShowDocumentModal(true);
    }
  };

  const handleViewCertificate = (index = 0) => {
    if (freelancer?.certificatesPath && freelancer.certificatesPath.length > 0) {
      const certPath = freelancer.certificatesPath[index];
      // Remove any leading 'uploads/' from the path
      const cleanPath = certPath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
const finalUrl = `${API_BASE}/uploads/${cleanPath}`;
      console.log('Certificate Path:', certPath);
      console.log('Clean Path:', cleanPath);
      console.log('Final URL:', finalUrl);
      setCurrentDocument({ 
        url: finalUrl, 
        name: `Certificate ${index + 1} - ${freelancer.firstName} ${freelancer.lastName}`,
        type: 'certificate'
      });
      setShowDocumentModal(true);
    }
  };

  const handleDownloadDocument = () => {
    if (currentDocument) {
      const link = document.createElement('a');
      link.href = currentDocument.url;
      link.download = currentDocument.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
    setEmailStatus({ show: false, type: '', message: '' });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailData.senderName || !emailData.senderEmail || !emailData.subject || !emailData.message) {
      setEmailStatus({
        show: true,
        type: 'error',
        message: 'Please fill in all fields'
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

const response = await fetch(`${API_BASE}/api/contact/freelancer`, {
          method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          freelancerId: freelancer.id,
          senderInfo: {
            name: emailData.senderName,
            email: emailData.senderEmail
          },
          subject: emailData.subject,
          message: emailData.message
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailStatus({
          show: true,
          type: 'success',
          message: 'Email sent successfully! The freelancer will receive your message.'
        });
        
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailData({
            senderName: '',
            senderEmail: '',
            subject: `Inquiry about ${freelancer.title || 'your profile'}`,
            message: `Hello ${freelancer.firstName},\n\nI found your profile on ProFetch and I'm interested in discussing a potential opportunity.\n\n`
          });
          setEmailStatus({ show: false, type: '', message: '' });
        }, 2000);
      } else {
        setEmailStatus({
          show: true,
          type: 'error',
          message: data.message || 'Failed to send email. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({
        show: true,
        type: 'error',
        message: 'Failed to send email. Please try again later.'
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleWhatsAppClick = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const message = `Hello ${freelancer.firstName}! I found your profile on ProFetch and I'm interested in discussing a potential opportunity.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading freelancer details...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Freelancer not found'}</p>
          <button
            onClick={handleBack}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  // Parse certificates if they're a string
  let certificates = [];
  try {
    if (freelancer.certificatesPath) {
      if (typeof freelancer.certificatesPath === 'string') {
        const trimmed = freelancer.certificatesPath.trim();
        certificates = (trimmed === '' || trimmed === 'null') ? [] : JSON.parse(trimmed);
      } else if (Array.isArray(freelancer.certificatesPath)) {
        certificates = freelancer.certificatesPath;
      }
    }
  } catch (e) {
    console.error('Error parsing certificates:', e);
    certificates = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Document Viewer Modal */}
      {showDocumentModal && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {currentDocument.type === 'cv' ? (
                  <FileText className="w-5 h-5 text-teal-600" />
                ) : (
                  <Award className="w-5 h-5 text-teal-600" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">{currentDocument.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDocument}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setCurrentDocument(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={currentDocument.url}
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact {freelancer.firstName}</h2>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailData.senderName}
                    onChange={(e) => setEmailData({ ...emailData, senderName: e.target.value })}
                    onKeyDown={handleEnterKey}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    disabled={emailSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    onKeyDown={handleEnterKey}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Subject line"
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
                    onKeyDown={handleEnterKey}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Write your message here..."
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
                    type="button"
                    onClick={handleSendEmail}
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={emailSending}
                  >
                    {emailSending ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
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
          {/* Hero Section with Profile Image */}
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              {freelancer.profileImage ? (
                <img
                  src={freelancer.profileImage}
                  alt={`${freelancer.firstName} ${freelancer.lastName}`}
                  className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-xl"
                />
              ) : (
                <div className={`w-40 h-40 rounded-full flex items-center justify-center text-white text-4xl font-bold border-8 border-white shadow-xl ${getUserColor(freelancer.firstName, freelancer.lastName)}`}>
                  {getUserInitials(freelancer.firstName, freelancer.lastName)}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-24 pb-8 px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {freelancer.firstName} {freelancer.lastName}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {freelancer.title || 'Professional'}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
              {freelancer.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{freelancer.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className={freelancer.availability === 'available' ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                  {freelancer.availability === 'available' ? 'Available Now' : 'Currently Busy'}
                </span>
              </div>

              {freelancer.views !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span>{freelancer.views} views</span>
                </div>
              )}
            </div>

            {/* Salary */}
            {freelancer.expectedSalary && (
              <div className="text-3xl font-bold text-teal-600 mb-8">
                {freelancer.salaryCurrency === 'USD' && '$'}
                {freelancer.salaryCurrency === 'INR' && '₹'}
                {freelancer.salaryCurrency === 'EUR' && '€'}
                {freelancer.salaryCurrency === 'GBP' && '£'}
                {freelancer.salaryCurrency === 'SAR' && 'SR '}
                {freelancer.salaryCurrency === 'AED' && 'د.إ '}
                {freelancer.expectedSalary}/yr
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              {freelancer.cvFilePath && (
                <button
                  onClick={handleViewCV}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  View CV
                </button>
              )}
              
              {certificates.length > 0 && (
                <>
                  {certificates.length === 1 ? (
                    <button
                      onClick={() => handleViewCertificate(0)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                    >
                      <Award className="w-5 h-5" />
                      View Certificate
                    </button>
                  ) : (
                    certificates.map((cert, index) => (
                      <button
                        key={index}
                        onClick={() => handleViewCertificate(index)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                      >
                        <Award className="w-5 h-5" />
                        Certificate {index + 1}
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="px-8 pb-8">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              
              {freelancer.phone && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleWhatsAppClick(freelancer.phone)}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 group-hover:text-green-600">WhatsApp</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">{freelancer.phone}</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePhoneClick(freelancer.phone)}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 group-hover:text-blue-600">Phone</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{freelancer.phone}</p>
                    </div>
                  </button>
                </div>
              )}
              
              {freelancer.email && (
                <button
                  onClick={handleEmailClick}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer group"
                >
                  <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-gray-500 group-hover:text-teal-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 break-all">{freelancer.email}</p>
                  </div>
                </button>
              )}
            </div>

            {/* Experience & Bio */}
            {(freelancer.experience || freelancer.bio) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {freelancer.experience && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Experience</h3>
                    <p className="text-lg text-gray-900">{freelancer.experience}</p>
                  </div>
                )}
                
                {freelancer.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Professional Bio</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{freelancer.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetails;