import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
    {...props}
  >
    {children}
  </button>
);

export default Button;