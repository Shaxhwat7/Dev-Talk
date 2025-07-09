'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-transparent backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md hover:scale-105 transform transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-black" />
            </div>
            <span className="text-white text-xl font-bold tracking-wider">Dev Talk</span>
          </div>

          {/* Profile Placeholder */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-300 cursor-pointer">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-inner">
              <span className="text-black font-semibold text-sm">S</span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
