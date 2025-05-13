import React, { useState, useEffect } from 'react';
import Button from './Button';
import backendApiService from '../../services/backendApiService';
import { getUserFromToken, logout } from '../../utils/helpers';

const ProfileSettings = ({ onClose, onProfileUpdate }) => {
  const [user, setUser] = useState({ email: '', name: '', bio: '', visibility: 'public' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError('Failed to fetch user data');
        }
      } catch {
        setError('Failed to fetch user data');
      }
    };
    fetchUserData();
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await backendApiService.put('/users/me', {
        name: user.name,
        bio: user.bio,
        visibility: user.visibility
      });
      setSuccess('Profile updated successfully!');
      if (onProfileUpdate) onProfileUpdate({ name: user.name, bio: user.bio, visibility: user.visibility });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;
  
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
  
      if (res.ok) {
        alert('✅ Your account has been deleted.');
        localStorage.removeItem('token');
        window.location.href = '/'; // Redirect to home or login page
      } else {
        // Check if the response is valid JSON
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await res.json();
          alert('❌ Error: ' + error.message);
        } else {
          alert('❌ Something went wrong. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('❌ Failed to delete account.');
    }
  };
  
  

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
  };

  return (
    <div className="w-[30vw] p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-darkblue">Profile Settings</h2>
      <form onSubmit={handleSave} className="flex flex-col font-normal">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <select
            className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            value={user.visibility}
            onChange={e => setUser(u => ({ ...u, visibility: e.target.value }))}
            required
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border mb-2 rounded-lg focus:outline-none focus:ring-2 bg-[#26a22494] text-darkblue font-bold focus:ring-accent"
            value={user.email}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border mb-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            value={user.name}
            onChange={e => setUser(u => ({ ...u, name: e.target.value }))}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            className="w-full px-3 py-2 border mb-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            value={user.bio}
            onChange={e => setUser(u => ({ ...u, bio: e.target.value }))}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex gap-2 justify-between mt-2">
          <div className='flex gap-2'>
            <button
                    className="text-center px-5 py-2 rounded bg-gradient-to-r from-darkblue to-[#de3b3b] text-white shadow-lg hover:scale-105 transition-all duration-200 border-none"
                    onClick={handleLogout}
                >
                    Logout
            </button>
            <button
              onClick={handleDeleteAccount}
              className="text-center px-5 py-2 rounded bg-gradient-to-r from-[#de3b3b] to-darkblue text-white shadow-lg hover:scale-105 transition-all duration-200 border-none"
            >
              Delete My Account
            </button>
          </div>
          <div className='flex gap-2'>
              <Button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded text-darkblue">Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
