import React, { useState } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import backendApiService from '../../services/backendApiService';

const SignUpForm = ({ onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await backendApiService.post('/auth/signup', { email, password });
      if (response && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (onSignUpSuccess) onSignUpSuccess(response.data);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 text-darkblue font-bold rounded">
      <p className='text-2xl mb-3'>Sign Up</p>
      <div className='flex flex-col px-4 py-2 rounded'>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className='bg-white px-4 py-2 rounded border-2 border-darkblue'/>
      </div>
      <div className='flex flex-col px-4 py-2 rounded'>
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className='bg-white px-4 py-2 rounded border-2 border-darkblue'/>
      </div>
      <div className='flex flex-col px-4 py-2 rounded mb-4'>
        <label>Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className='bg-white px-4 py-2 rounded border-2 border-darkblue'/>
      </div>
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={loading}>{loading ? <LoadingSpinner /> : 'Sign Up'}</Button>
    </form>
  );
};

export default SignUpForm;
