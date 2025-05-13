import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../../utils/helpers';

const ProtectedRoute = ({ children }) => {
  const user = getUserFromToken();
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
