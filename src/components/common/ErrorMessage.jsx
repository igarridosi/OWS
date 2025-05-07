import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-2 text-center">
    {message}
  </div>
);

export default ErrorMessage;