import React from 'react';
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <MessageCircle className="w-6 h-6 text-black" />
            </div>
            
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-medium text-sm">S</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;