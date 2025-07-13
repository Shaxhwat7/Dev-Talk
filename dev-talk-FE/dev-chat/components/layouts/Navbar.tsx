'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/5 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href='/'>
            <div className="flex items-center space-x-3">
              
              <h1 className="text-3xl font-extrabold tracking-tight text-white hover:cursor-pointer hover:scale-110 transition-transform duration-300">
                Dev<span className="text-purple-400">Chat</span>
              </h1>
            </div>
          </Link>

          <div className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/10 transition duration-300 cursor-pointer">
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
