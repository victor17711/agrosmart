import React from 'react';
import logo from '../assets/images/logo.png';

const Preloader = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        {/* Logo with pulse animation */}
        {/* <div className="mb-6 animate-pulse">
          <img 
            src={logo} 
            alt="Loading..." 
            className="h-24 w-auto mx-auto"
          />
        </div> */}
        
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="mt-6 text-gray-600 font-semibold animate-pulse">Se încarcă...</p>
      </div>
    </div>
  );
};

export default Preloader;
