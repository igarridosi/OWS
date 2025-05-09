import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-2 right-4 absolute md:block">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500"></div>
  </div>
);

export default LoadingSpinner;