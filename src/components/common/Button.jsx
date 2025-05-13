import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-gradient-to-r from-accent to-darkblue text-white rounded hover:scale-105 transition-colors disabled:opacity-60"
    {...props}
  >
    {children}
  </button>
);

export default Button;