import React, { useState } from 'react';
import { Users, Package, UserCheck, ArrowRight, Search } from 'lucide-react';

const SignUp = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'manpower',
      title: 'Manpower',
      description: 'Find work and showcase skills',
      icon: Users,
      color: 'teal'
    },
    {
      id: 'equipment',
      title: 'Equipment Owner',
      description: 'Rent out your equipment',
      icon: Package,
      color: 'teal'
    },
    {
      id: 'both',
      title: 'Both',
      description: 'Access both features',
      icon: UserCheck,
      color: 'teal'
    }
  ];

   const handleContinue = () => {
  if (selectedRole) {
    window.location.href = `/signup/${selectedRole}`; 
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Search className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">find-hire.co</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log In
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome, Kingsy!
            </h1>
            <p className="text-gray-600 text-lg">
              Choose how you want to use Find-Hire
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="space-y-4 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        isSelected ? 'bg-teal-600' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-1 ${
                          isSelected ? 'text-teal-900' : 'text-gray-900'
                        }`}>
                          {role.title}
                        </h3>
                        <p className={`text-sm ${
                          isSelected ? 'text-teal-700' : 'text-gray-600'
                        }`}>
                          {role.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedRole
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-semibold text-gray-900">Find-Hire.Co</span>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2025 Find-Hire.Co. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;