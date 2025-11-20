import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, token } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/discover', { replace: true });
    }
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/discover');
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to continue your eco-journey 🌿</p>
        </div>
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">{error}</div>}
            <button type="submit" className="btn-primary w-full text-lg">Sign In →</button>
          </form>
          <div className="text-center mt-6">
            <Link to="/forgot-password" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">Forgot your password?</Link>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">Don't have an account? <Link to="/register" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
