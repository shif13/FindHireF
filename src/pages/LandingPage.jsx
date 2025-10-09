import React from 'react';
import { Home, Briefcase, Wrench, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const handleHomeClick = () => {
     window.location.href = '/';
  };

  const handleFreelancersClick = () => {
     window.location.href = '/recruiter';
  }

  const handleEquipmentClick = () => {
     window.location.href = '/equipment';
  };

const freelancerImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80";
  const equipmentImage = "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 bg-white transition-colors duration-200" 
              onClick={handleHomeClick}
            >
              <Home size={18} />
              <span className="font-medium">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              Find Talent & Equipment
            </h1>
            <p className="text-lg text-gray-600">
              Who are you looking to hire or what do you need to find?
            </p>
          </div>

          {/* Two Column Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Find Freelancers Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={freelancerImage}
                  alt="Forest landscape"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Briefcase size={24} className="text-gray-700 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Find Freelancers</h2>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Browse our recruiter dashboard to find the perfect talent for your project.
                </p>
                
                <button 
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  onClick={handleFreelancersClick}
                >
                  Browse Freelancers
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>

            {/* Find Equipment Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={equipmentImage}
                  alt="Dandelion in hand"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Wrench size={24} className="text-gray-700 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Find Equipment</h2>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Find the right tools and equipment for the job from our listings.
                </p>
                
                <button 
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  onClick={handleEquipmentClick}
                >
                  Browse Equipment
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;