import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView.jsx';

export default function Discover() {
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [priceType, setPriceType] = useState('');

  useEffect(() => { 
    fetchItems(); 
    fetchRecommendations();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get('/api/items', { params: { category: category || undefined, priceType: priceType || undefined } });
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await api.get('/api/items/recommendations');
      setRecommendations(res.data);
    } catch (e) {
      console.error('Failed to fetch recommendations:', e);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Discover Items</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Find items being shared in your community. Filter by category and type.</p>
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
            🎯 Recommended for You
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Based on your interests</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {recommendations.slice(0, 3).map(item => (
              <Link to={`/items/${item._id}`} key={item._id} className="card hover:shadow-lg group bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 border-2 border-primary/20">
                <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-3 flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="object-cover h-32 w-full" /> : <span className="text-gray-400 text-sm">No image</span>}
                </div>
                <h3 className="font-bold text-base mb-1 dark:text-white">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.category} • {item.priceType}</p>
                <span className="text-xs text-primary font-semibold mt-2 inline-block">✨ Perfect match</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mb-6">
        <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field max-w-xs">
          <option value="">All Categories</option>
          <option>Clothes</option>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Books</option>
          <option>Toys</option>
          <option>Sports</option>
          <option>Home & Garden</option>
          <option>Other</option>
        </select>
        <select value={priceType} onChange={e=>setPriceType(e.target.value)} className="input-field max-w-xs">
          <option value="">Any Type</option>
          <option>Free</option>
          <option>Exchange</option>
          <option>Sell</option>
        </select>
        <button onClick={fetchItems} className="btn-primary">Filter</button>
      </div>

      {loading && <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading items...</div>}

      <div className="mb-6">
        <MapView items={items} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(i => (
          <Link to={`/items/${i._id}`} key={i._id} className={`card hover:shadow-lg group ${i.status !== 'available' ? 'opacity-75' : ''}`}>
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 mb-4 flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                {i.imageUrl ? <img src={i.imageUrl} alt={i.title} className="object-cover h-48 w-full" /> : <span className="text-gray-400">No image</span>}
              </div>
              {i.status !== 'available' && (
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    i.status === 'sold'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {i.status === 'sold' ? 'SOLD' : 'EXCHANGED'}
                  </span>
                </div>
              )}
            </div>
            <h2 className={`font-bold text-lg mb-1 ${i.status !== 'available' ? 'line-through text-gray-500' : ''}`}>{i.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{i.category} • {i.condition}</p>
            <div className="flex justify-between items-center">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                i.status !== 'available'
                  ? 'bg-gray-200 text-gray-500'
                  : i.priceType === 'Free'
                    ? 'bg-green-100 text-green-700'
                    : i.priceType === 'Exchange'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-accent/10 text-accent'
              }`}>
                {i.status !== 'available' ? 'UNAVAILABLE' : i.priceType}
              </span>
              {i.priceType === 'Sell' && i.status === 'available' && <span className="font-bold">${i.price}</span>}
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
