import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Search, ArrowLeft, X, CheckCircle, AlertCircle, Key } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetData, setResetData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const API_BASE = 'http://localhost:5550/api';

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }

    // Check if URL contains reset token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      verifyResetToken(token);
    }
  }, []);

  const verifyResetToken = async (token) => {
    setVerifyingToken(true);
    setShowResetModal(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth/verify-reset-token/${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setTokenValid(true);
      } else {
        setResetError(data.message || 'Invalid or expired reset token');
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setResetError('Failed to verify reset token');
      setTokenValid(false);
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleResetDataChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
    if (resetError) setResetError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (rememberMe) {
          localStorage.setItem('rememberEmail', formData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        if (data.user.user_type === 'manpower') {
          window.location.href = '/manpowerdashboard';
        } else if (data.user.user_type === 'equipment_owner') {
          window.location.href = '/equipmentdashboard';
        } else if (data.user.user_type === 'both') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetData.password || !resetData.confirmPassword) {
      setResetError('Please fill in all fields');
      return;
    }

    if (resetData.password !== resetData.confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (resetData.password.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: resetData.password,
          confirmPassword: resetData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSuccess(true);
        setTimeout(() => {
          setShowResetModal(false);
          setResetData({ password: '', confirmPassword: '' });
          setResetSuccess(false);
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
      } else {
        setResetError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const form = e.target.closest('form');
      if (!form) return;
      
      const focusableElements = form.querySelectorAll(
        'input[type="email"], input[type="password"], input[type="text"], button[type="submit"]'
      );
      const focusableArray = Array.from(focusableElements);
      const currentIndex = focusableArray.indexOf(e.target);
      
      if (currentIndex < focusableArray.length - 1) {
        focusableArray[currentIndex + 1].focus();
      } else {
        form.querySelector('button[type="submit"]').click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Search className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">find-hire.co</span>
            </a>
            <a 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Log in to your Find-Hire account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="m@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <a
                href="/signup"
                className="block w-full py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center"
              >
                Create an account
              </a>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-teal-600 hover:text-teal-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Step 1: Request Reset Email) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmail('');
                setForgotError('');
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Sent!
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Check your inbox for the password reset link
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotSuccess(false);
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{forgotError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="m@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    forgotLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotError('');
                  }}
                  className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal (Step 2: Enter New Password) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
            {!verifyingToken && !resetSuccess && (
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetData({ password: '', confirmPassword: '' });
                  setResetError('');
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                verifyingToken ? 'bg-gray-100' :
                resetSuccess ? 'bg-green-100' :
                !tokenValid && !verifyingToken ? 'bg-red-100' :
                'bg-teal-100'
              }`}>
                {verifyingToken ? (
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
                ) : resetSuccess ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : !tokenValid ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Key className="w-8 h-8 text-teal-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {verifyingToken ? 'Verifying...' :
                 resetSuccess ? 'Password Reset!' :
                 !tokenValid ? 'Invalid Token' :
                 'Reset Your Password'}
              </h2>
              <p className="text-gray-600 text-sm">
                {verifyingToken ? 'Please wait while we verify your reset token' :
                 resetSuccess ? 'Your password has been changed successfully' :
                 !tokenValid ? 'This reset link is invalid or has expired' :
                 'Enter your new password below'}
              </p>
            </div>

            {verifyingToken ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : resetSuccess ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm mb-4">
                  You can now log in with your new password
                </p>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetData({ password: '', confirmPassword: '' });
                    setResetSuccess(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : !tokenValid ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm mb-4">
                  Please request a new password reset link
                </p>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setShowForgotModal(true);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Request New Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{resetError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showResetPassword ? "text" : "password"}
                      name="password"
                      value={resetData.password}
                      onChange={handleResetDataChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showResetConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={handleResetDataChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    • Password must be at least 6 characters long<br/>
                    • Both passwords must match
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    resetLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {resetLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2025 Find-Hire.Co. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;