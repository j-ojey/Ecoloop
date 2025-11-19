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
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const availableInterests = [
    'Clothes', 'Electronics', 'Furniture', 'Books', 'Toys', 'Sports', 'Home & Garden', 'Other'
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/discover', { replace: true });
    }
  }, [token, navigate]);

  const handleInterestChange = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, interests });
      login(res.data.token, res.data.user);
      navigate('/discover');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What are you interested in? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableInterests.map(interest => (
                  <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interests.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{interest}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll use this to recommend items you might like
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            <button type="submit" className="btn-primary w-full">Create account</button>
          </form>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
