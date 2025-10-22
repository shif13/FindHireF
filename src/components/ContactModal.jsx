import React, { useState } from 'react';
import { X, Mail, Phone, User, MessageSquare, Send, CheckCircle } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, type, targetData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/inquiry`;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'manpower' ? '/manpower' : '/equipment';
      const payload = {
        ...formData,
        ...(type === 'manpower' 
          ? { manpowerId: targetData.id }
          : { equipmentId: targetData.id }
        )
      };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
      } else {
        setError(data.message || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Inquiry error:', error);
      setError('Error sending inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Get target name based on type
  const getTargetName = () => {
    if (type === 'manpower') {
      return `${targetData.first_name || targetData.firstName || ''} ${targetData.last_name || targetData.lastName || ''}`.trim();
    }
    return targetData.equipmentName || targetData.equipment_name || 'this equipment';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {success ? (
          // Success Screen
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#353535' }}>
              Inquiry Sent Successfully! 🎉
            </h3>
            <p className="text-lg mb-2" style={{ color: '#353535' }}>
              Your message has been delivered to {getTargetName()}.
            </p>
            <p className="text-sm" style={{ color: '#353535' }}>
              You should receive a response within 24-48 hours.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative p-6 border-b" style={{ borderColor: '#D9D9D9' }}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-6 h-6" style={{ color: '#353535' }} />
              </button>
              
              <div className="pr-12">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#353535' }}>
                  Send Inquiry
                </h2>
                <p style={{ color: '#353535' }}>
                  Contact {getTargetName()}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{ borderColor: '#3C6E71' }}
                    onFocus={(e) => e.target.style.borderColor = '#284B63'}
                    onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
                  Your Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{ borderColor: '#3C6E71' }}
                    onFocus={(e) => e.target.style.borderColor = '#284B63'}
                    onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
                  Your Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{ borderColor: '#3C6E71' }}
                    onFocus={(e) => e.target.style.borderColor = '#284B63'}
                    onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={type === 'manpower' ? 'Job Opportunity' : 'Equipment Rental Inquiry'}
                  className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                  style={{ borderColor: '#3C6E71' }}
                  onFocus={(e) => e.target.style.borderColor = '#284B63'}
                  onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#353535' }}>
                  Your Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder={type === 'manpower' 
                      ? "Hi, I'm interested in your services. I'd like to discuss..." 
                      : "Hi, I'm interested in renting this equipment. Please provide details about..."
                    }
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all resize-none"
                    style={{ borderColor: '#3C6E71' }}
                    onFocus={(e) => e.target.style.borderColor = '#284B63'}
                    onBlur={(e) => e.target.style.borderColor = '#3C6E71'}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 20 characters</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.email || !formData.message}
                className="w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3C6E71' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#284B63')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3C6E71')}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Inquiry
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;