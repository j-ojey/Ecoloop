import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Welcome() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [availableInterests] = useState([
    'Clothes', 'Electronics', 'Furniture', 'Books', 'Toys', 'Sports', 'Home & Garden', 'Other'
  ]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        setInterests(res.data.interests || []);
      } catch (e) {
        // ignore - user might not have interests set yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggle = (i) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put('/api/auth/profile', { interests });
      navigate('/discover');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">Welcome{user?.name ? `, ${user.name}` : ''} 👋</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Tell us what you're interested in so we can recommend items for you.</p>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What are you interested in? (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableInterests.map(i => (
                    <label key={i} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={interests.includes(i)} onChange={() => toggle(i)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{i}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We'll use this to recommend items you might like</p>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save and continue'}</button>
                <button onClick={() => navigate('/discover')} className="btn-secondary">Skip</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
