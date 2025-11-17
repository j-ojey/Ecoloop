import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', condition: 'Used', priceType: 'Free', price: 0 });
  const [location, setLocation] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl;
      if (file) {
        const up = await uploadToCloudinary(file);
        imageUrl = up.secure_url;
      }
      const body = { ...form, price: Number(form.price || 0), imageUrl };
      // Add location if provided
      if (location) {
        body.location = {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        };
      }
      await api.post('/api/items', body, { headers: { Authorization: `Bearer ${token}` } });
      const ecoPointsEarned = calculateEcoPoints(form.category, 'create');
      toast.success(`Item posted successfully! +${ecoPointsEarned} eco-points earned for saving ~${CARBON_SAVINGS[form.category] || 5}kg CO₂! 🌱`);
      window.location.href = '/discover';
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">List a New Item</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input type="text" className="input-field" placeholder="e.g., Vintage Leather Chair" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea className="input-field h-24 resize-none" placeholder="Tell us about the item..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="input-field" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                <option>Clothes</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <select className="input-field" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
                <option>New</option>
                <option>Good</option>
                <option>Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select className="input-field" value={form.priceType} onChange={e=>setForm({...form, priceType: e.target.value})}>
                <option>Free</option>
                <option>Exchange</option>
                <option>Sell</option>
              </select>
            </div>
          </div>
          
          {/* Eco Points Preview */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              🌱 Environmental Impact Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700 dark:text-green-300">CO₂ Saved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ~{CARBON_SAVINGS[form.category] || 5}kg
                </p>
              </div>
              <div>
                <p className="text-green-700 dark:text-green-300">Eco Points Earned</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{calculateEcoPoints(form.category, 'create')}
                </p>
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Complete exchange/sale to earn +{calculateEcoPoints(form.category, 'complete')} more points!
            </p>
          </div>
          {form.priceType === 'Sell' && (
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input type="number" className="input-field" placeholder="0" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Select Location (Optional)</label>
            <LocationPicker onLocationSelect={setLocation} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Upload Photo</label>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} className="w-full" />
            {file && <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Publishing...' : 'Publish Item'}</button>
        </form>
      </div>
    </div>
  );
}
