import React from 'react';

const Hero = () => {
  return (
    <div className="relative bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">test</span>
          <span className="block text-indigo-600 mt-2">With AI-Powered Solutions</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Empower your customer service team with cutting-edge AI technology that delivers personalized, efficient support at scale.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
            Get Started
          </button>
          <button className="px-8 py-3 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 font-medium">
            Watch Demo
          </button>
        </div>
        <div className="mt-16">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Platform Dashboard"
            className="rounded-lg shadow-xl mx-auto max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;