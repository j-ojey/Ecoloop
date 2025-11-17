import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import FormInput from '../components/FormInput.jsx';

export default function Register() {
  const [name, setName] = useState('');
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
      const res = await api.post('/api/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/discover');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Join the movement</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
              validation={{ type: 'name' }}
            />
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              validation={{ type: 'email' }}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              showStrength={true}
              minLength={8}
            />
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            <button type="submit" className="btn-primary w-full">Create account</button>
          </form>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
