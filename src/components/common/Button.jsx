import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent transition-colors disabled:opacity-60"
    {...props}
  >
    {children}
  </button>
);

export default Button;