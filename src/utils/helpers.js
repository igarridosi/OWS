// Utility functions (formatting, etc.)

// Utility to decode JWT and get user info (id, email, role)
import { jwtDecode } from 'jwt-decode';

export function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login'; // Or use your router's navigation
}