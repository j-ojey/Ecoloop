import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import PasswordInput from '../components/PasswordInput.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);

  useEffect(() => {
    // Basic token validation (frontend only)
    if (!token || token.length < 10) {
      setValidToken(false);
    } else {
      setValidToken(true);
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Invalid Link</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <a href="/forgot-password" className="btn-primary">Request New Link</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Reset Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              showStrength={true}
              minLength={8}
            />
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              confirmValue={password}
              minLength={8}
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}