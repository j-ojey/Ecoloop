import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Get API base URL with production fallback
const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://ecoloop-backend-ed9e.onrender.com';
  }
  return 'http://localhost:4000';
};

const API_BASE = getApiBase();

// Carbon savings estimates in kg CO2 per item category
const CARBON_SAVINGS = {
  Electronics: 50,
  Furniture: 30,
  Clothing: 5,
  Clothes: 5,
  Books: 2,
  Toys: 3,
  'Home & Garden': 10,
  Sports: 8,
  Other: 5
};

// Calculate eco-points based on CO2 savings
const calculateEcoPoints = (category, action = 'create') => {
  const co2Saved = CARBON_SAVINGS[category] || 5;

  if (action === 'create') {
    return Math.max(1, Math.floor(co2Saved / 2));
  } else if (action === 'complete') {
    return Math.max(5, co2Saved);
  }

  return 0;
};

async function getUploadSignature() {
  const res = await fetch(`${API_BASE}/api/uploads/signature`, { method: 'POST' });
  return res.json();
}

async function uploadToCloudinary(file) {
  const { timestamp, signature, apiKey, folder } = await getUploadSignature();
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  if (folder) form.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: form });
  return res.json();
}

export default function PostItem() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', condition: 'Used', priceType: 'Free', price: 0, town: '' });
  const [towns, setTowns] = useState([]);
  const [customTown, setCustomTown] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => { fetchTowns(); }, []);

  async function fetchTowns() {
    try {
      const res = await api.get('/items/towns');
      setTowns(res.data || []);
    } catch (e) {
      // ignore
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!form.town || form.town.trim() === '') {
      toast.error('Please select a town');
      return;
    }
    
    if (form.town === 'Other' && (!customTown || customTown.trim() === '')) {
      toast.error('Please enter a town name');
      return;
    }
    
    setSaving(true);
    try {
      let imageUrl;
      if (file) {
        const up = await uploadToCloudinary(file);
        imageUrl = up.secure_url;
      }
      
      const townValue = form.town === 'Other' ? customTown.trim() : form.town;
      
      const body = { 
        ...form, 
        town: townValue,
        price: Number(form.price || 0), 
        imageUrl 
      };
      
      await api.post('/items', body);
      const ecoPointsEarned = calculateEcoPoints(form.category, 'create');
      toast.success(`Item posted successfully! +${ecoPointsEarned} eco-points earned for saving ~${CARBON_SAVINGS[form.category] || 5}kg CO₂! 🌱`);
      window.location.href = '/discover';
    } catch (e) {
      console.error('Post item error:', e);
      toast.error(e.response?.data?.message || 'Failed to post item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">📝 List a New Item</h1>
        <p className="text-gray-600 dark:text-gray-400">Share your items and earn eco-points 🌿</p>
      </div>
      <div className="card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">✏️ Title</label>
            <input type="text" className="input-field" placeholder="e.g., Vintage Leather Chair" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">📝 Description</label>
            <textarea className="input-field h-24 resize-none" placeholder="Tell us about the item..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">📋 Category</label>
              <select className="input-field" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                <option>Clothes</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Books</option>
                <option>Toys</option>
                <option>Sports</option>
                <option>Home & Garden</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">⭐ Condition</label>
              <select className="input-field" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
                <option>New</option>
                <option>Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">🏷️ Type</label>
              <select className="input-field" value={form.priceType} onChange={e=>setForm({...form, priceType: e.target.value})}>
                <option>Free</option>
                <option>Exchange</option>
                <option>Sell</option>
              </select>
            </div>
          </div>
          
          {/* Eco Points Preview */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/10 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 shadow-lg shadow-green-100 dark:shadow-green-900/20">
            <h3 className="font-bold text-lg text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
              🌱 Environmental Impact Preview
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <p className="text-green-700 dark:text-green-300 font-medium mb-2">CO₂ Saved</p>
                <p className="text-3xl font-extrabold gradient-text">
                  ~{CARBON_SAVINGS[form.category] || 5}kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-700 dark:text-green-300 font-medium mb-2">Eco Points Earned</p>
                <p className="text-3xl font-extrabold gradient-text">
                  +{calculateEcoPoints(form.category, 'create')}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-700">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium text-center">
                ✨ Complete exchange/sale to earn +{calculateEcoPoints(form.category, 'complete')} more points!
              </p>
            </div>
          </div>
          {form.priceType === 'Sell' && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">💵 Price ($)</label>
              <input type="number" className="input-field" placeholder="0" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">📍 Town <span className="text-red-500">*</span></label>
            <div className="flex gap-2 items-center">
              <select 
                value={form.town} 
                onChange={e=>setForm({...form, town: e.target.value})} 
                className="input-field max-w-xs"
                required
              >
                <option value="">Select town</option>
                {towns.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {form.town === 'Other' && (
                <input 
                  value={customTown} 
                  onChange={e=>setCustomTown(e.target.value)} 
                  placeholder="Enter town name" 
                  className="input-field"
                  required
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">📸 Upload Photo</label>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer" />
            {file && <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">✓ {file.name}</p>}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full text-lg mt-4">{saving ? '📤 Publishing...' : '🚀 Publish Item'}</button>
        </form>
      </div>
    </div>
  );
}
