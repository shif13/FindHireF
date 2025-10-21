import React, { useState, useEffect } from 'react';
import { 
  Star, Send, User, Calendar, CheckCircle, AlertCircle, 
  Loader, X, Edit3, Save, Trash2, MessageCircle, Award
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const ReviewSystem = ({ isModal = false, onClose = null, currentUser = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Review state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    category: 'general'
  });

  // Edit state
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({});

  const categories = [
    { value: 'general', label: 'General Experience' },
    { value: 'job-search', label: 'Job Search' },
    { value: 'recruitment', label: 'Recruitment' },
    { value: 'platform', label: 'Platform Features' },
    { value: 'support', label: 'Customer Support' }
  ];

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/reviews`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const submitReview = async () => {
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (reviewForm.comment.length < 20) {
      setError('Review comment must be at least 20 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const token = getAuthToken();

      if (!token) {
        setError('Please log in to submit a review');
        return;
      }

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Review submitted successfully!');
        setReviewForm({
          rating: 5,
          title: '',
          comment: '',
          category: 'general'
        });
        fetchReviews();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit review
  const startEdit = (review) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      category: review.category
    });
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditForm({});
  };

  const saveEdit = async (reviewId) => {
    try {
      setSubmitting(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Review updated successfully!');
        setEditingReview(null);
        setEditForm({});
        fetchReviews();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to update review');
      }
    } catch (err) {
      console.error('Update review error:', err);
      setError('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Review deleted successfully!');
        fetchReviews();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
      setError('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const canEditReview = (review) => {
    return currentUser && currentUser.id === review.userId;
  };

  // Get user type badge color
  const getUserTypeBadge = (userType) => {
    const badges = {
      'manpower': { color: 'bg-blue-100 text-blue-700', label: 'Manpower' },
      'equipment_owner': { color: 'bg-purple-100 text-purple-700', label: 'Equipment Owner' },
      'both': { color: 'bg-green-100 text-green-700', label: 'Manpower & Equipment' }
    };
    return badges[userType] || badges['manpower'];
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const containerClass = isModal 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    : "max-w-6xl mx-auto p-6";

  const contentClass = isModal
    ? "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    : "bg-white rounded-2xl shadow-lg";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Reviews</h2>
                <p className="text-blue-100">Share your experience with Find-Hire</p>
              </div>
            </div>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700">{success}</p>
                <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Submit Review Section */}
          {currentUser && (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Share Your Experience
              </h3>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={reviewForm.category}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Give your review a title..."
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your experience with Find-Hire... (minimum 20 characters)"
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Minimum 20 characters</span>
                    <span>{reviewForm.comment.length}/1000</span>
                  </div>
                </div>

                <button
                  onClick={submitReview}
                  disabled={submitting || reviewForm.comment.length < 20 || !reviewForm.title.trim()}
                  className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all ${
                    submitting || reviewForm.comment.length < 20 || !reviewForm.title.trim()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-gray-700" />
              Community Reviews ({reviews.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h4>
                <p className="text-gray-500">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const userBadge = getUserTypeBadge(review.userType);
                  
                  return (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      {editingReview === review.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {renderStars(editForm.rating, true, (rating) => 
                                setEditForm(prev => ({ ...prev, rating }))
                              )}
                              <select
                                value={editForm.category}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                              >
                                {categories.map(cat => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            maxLength={100}
                          />

                          <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                            maxLength={1000}
                          />

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => saveEdit(review.id)}
                              disabled={submitting}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                  <User className="w-7 h-7 text-white" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center space-x-3 flex-wrap">
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {review.firstName} {review.lastName}
                                  </h4>
                                  <span className={`px-3 py-1 ${userBadge.color} text-xs font-medium rounded-full`}>
                                    {userBadge.label}
                                  </span>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {categories.find(c => c.value === review.category)?.label || review.category}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3 mt-2">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {canEditReview(review) && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startEdit(review)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit review"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteReview(review.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <h5 className="font-semibold text-gray-900 mb-2 text-lg">{review.title}</h5>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>

                          {review.updatedAt && new Date(review.updatedAt).getTime() !== new Date(review.createdAt).getTime() && (
                            <div className="text-xs text-gray-400 mt-2">
                              Edited on {new Date(review.updatedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;