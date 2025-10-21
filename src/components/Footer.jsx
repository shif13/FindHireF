import React from "react";
import { Search } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-teal-600" />
            <span className="text-lg font-semibold text-gray-900">
              Find-Hire.Co
            </span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500 text-center sm:text-left">
            © 2025 Find-Hire.Co. All rights reserved.
          </div>

          {/* Links */}
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
  );
};

export default Footer;
