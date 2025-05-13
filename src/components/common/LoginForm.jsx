import React, { useState } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import backendApiService from '../../services/backendApiService';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await backendApiService.post('/auth/login', { email, password });
      if (response && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (onLoginSuccess) onLoginSuccess(response.data);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 text-darkblue font-bold rounded">
      <p className='text-2xl mb-3'>Login</p>
      <div className='flex flex-col px-4 py-2 rounded'>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className='bg-white px-4 py-2 rounded border-2 border-darkblue'/>
      </div>
      <div className='flex flex-col px-4 py-2 rounded mb-4'>
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className='bg-white px-4 py-2 rounded border-2 border-darkblue'/>
      </div>
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={loading}>{loading ? <LoadingSpinner /> : 'Login'}</Button>
    </form>
  );
};

export default LoginForm;
