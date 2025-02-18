import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-indigo-600">
              DocuAid
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                <span>Features</span>
                <ChevronDown size={16} />
              </button>
              <div className="absolute top-full -left-4 w-48 bg-white shadow-lg rounded-md py-2 hidden group-hover:block">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Product 1</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Product 2</a>
              </div>
            </div>
            <a href="#" className="text-gray-600 hover:text-indigo-600">Solutions</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600">Resources</a>
            <a href="#" className="text-gray-600 hover:text-indigo-600">Company</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700">Sign In</button>
            <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700">Sign Up</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Add to Chrome
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-indigo-50 rounded-md">Products</a>
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-indigo-50 rounded-md">Solutions</a>
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-indigo-50 rounded-md">Resources</a>
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-indigo-50 rounded-md">Company</a>
            <div className="pt-4 flex flex-col space-y-2">
              <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700">Sign In</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;