import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    condition: 'Used',
    priceType: 'Free',
    price: 0,
    imageUrl: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/api/items/${id}`);
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition,
          priceType: data.priceType,
          price: data.price || 0,
          imageUrl: data.imageUrl || ''
        });
        // Set location if exists
        if (data.location?.coordinates) {
          const [lng, lat] = data.location.coordinates;
          setLocation({ latitude: lat, longitude: lng });
        }
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load item');
        navigate('/my');
      }
    };
    fetchItem();
  }, [id, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
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
      await api.put(`/api/items/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Item updated successfully!');
      navigate('/my');
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Edit Item</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Vintage Leather Chair" 
              value={form.title} 
              onChange={e=>setForm({...form, title: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Location (Optional)</label>
            <LocationPicker 
              onLocationSelect={setLocation} 
              initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Description</label>
            <textarea 
              className="input-field h-24 resize-none" 
              placeholder="Tell us about the item..." 
              value={form.description} 
              onChange={e=>setForm({...form, description: e.target.value})} 
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Category</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Condition</label>
              <select className="input-field" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
                <option>New</option>
                <option>Good</option>
                <option>Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Type</label>
              <select className="input-field" value={form.priceType} onChange={e=>setForm({...form, priceType: e.target.value})}>
                <option>Free</option>
                <option>Exchange</option>
                <option>Sell</option>
              </select>
            </div>
          </div>
          {form.priceType === 'Sell' && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Price ($)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0" 
                value={form.price} 
                onChange={e=>setForm({...form, price: e.target.value})} 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Current Image</label>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Current" className="w-32 h-32 object-cover rounded-lg mb-2" />
            )}
            <label className="block text-sm font-medium mb-2 dark:text-gray-200 mt-4">Upload New Photo (optional)</label>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} className="w-full" />
            {file && <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>}
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/my')} 
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary flex-1"
            >
              {saving ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
