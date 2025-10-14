import React, { useState, useEffect } from 'react';
import { Users, Package, Loader2, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('userData');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);

      // If roles already selected, redirect
      if (parsedUser.rolesSelected) {
        if (parsedUser.userType === 'both' || parsedUser.isFreelancer) {
          window.location.href = '/equipskilldashboard';
        } else if (parsedUser.userType === 'equipment_owner') {
          window.location.href = '/equipmentdashboard';
        }
      }
    }
  }, []);

  const handleSubmit = async () => {
  if (!selectedRole) {
    setError('Please select a role');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');

    // Map selected role to userType and role flags
    let userType, isFreelancer, isEquipmentOwner;
    
    if (selectedRole === 'freelancer') {
      userType = 'jobseeker';
      isFreelancer = true;
      isEquipmentOwner = false;
    } else if (selectedRole === 'equipment') {
      userType = 'equipment_owner';
      isFreelancer = false;
      isEquipmentOwner = true;
    } else if (selectedRole === 'both') {
      userType = 'both';
      isFreelancer = true;
      isEquipmentOwner = true;
    }

    const response = await fetch(`${API_BASE}/users/select-roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userType,
        isFreelancer,
        isEquipmentOwner
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Save updated user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // ✅ Redirect based on role combination
      if (data.user.isFreelancer && !data.user.isEquipmentOwner) {
        window.location.href = '/freelancer-dashboard';
      } else if (data.user.isEquipmentOwner && !data.user.isFreelancer) {
        window.location.href = '/equipmentdashboard';
      } else if (data.user.isFreelancer && data.user.isEquipmentOwner) {
        window.location.href = '/equipskilldashboard';
      } else {
        // Fallback (shouldn’t normally happen)
        window.location.href = '/select-role';
      }
    } else {
      setError(data.msg || 'Failed to select role. Please try again.');
    }
  } catch (err) {
    console.error('Role selection error:', err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome{userData?.firstName ? `, ${userData.firstName}` : ''}!
          </h1>
          <p className="text-gray-600 text-sm">Choose how you want to use ProFetch</p>
        </div>

        {/* Role Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
          
          {/* Freelancer */}
          <div
            onClick={() => setSelectedRole('freelancer')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedRole === 'freelancer'
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedRole === 'freelancer' ? 'bg-teal-100' : 'bg-gray-100'
              }`}>
                <Users className={`w-5 h-5 ${
                  selectedRole === 'freelancer' ? 'text-teal-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Freelancer</h3>
                <p className="text-xs text-gray-600">Find work and showcase skills</p>
              </div>
            </div>
          </div>

          {/* Equipment Owner */}
          <div
            onClick={() => setSelectedRole('equipment')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedRole === 'equipment'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedRole === 'equipment' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Package className={`w-5 h-5 ${
                  selectedRole === 'equipment' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Equipment Owner</h3>
                <p className="text-xs text-gray-600">Rent out your equipment</p>
              </div>
            </div>
          </div>

          {/* Both */}
          <div
            onClick={() => setSelectedRole('both')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedRole === 'both'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedRole === 'both' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <div className="flex gap-1">
                  <Users className={`w-4 h-4 ${
                    selectedRole === 'both' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                  <Package className={`w-4 h-4 ${
                    selectedRole === 'both' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Both</h3>
                <p className="text-xs text-gray-600">Access both features</p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedRole}
            className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
              loading || !selectedRole
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Not you? Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;