import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function MyListings() {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => { (async () => {
    try { const res = await api.get('/api/items'); setItems(res.data.filter(i => i.ownerId?._id === user?.id)); } catch (e) { console.error(e); }
  })(); }, [user]);

  const handleDelete = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deleted successfully');
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">My Listings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Items you've posted. Manage and track interest.</p>
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No items listed yet</p>
          <Link to="/post" className="btn-primary">Post Your First Item</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i._id} className="card hover:shadow-lg group relative">
              <Link to={`/items/${i._id}`}>
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 mb-4 flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                  {i.imageUrl ? <img src={i.imageUrl} alt={i.title} className="object-cover h-40 w-full" /> : <span className="text-gray-400">No image</span>}
                </div>
                <h2 className="font-bold text-lg mb-1 dark:text-white">{i.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{i.category} • {i.condition}</p>
              </Link>
              <div className="flex gap-2 mt-4">
                <Link 
                  to={`/edit/${i._id}`} 
                  className="btn-secondary flex-1 text-center text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  ✏️ Edit
                </Link>
                <button 
                  onClick={(e) => handleDelete(i._id, e)} 
                  className="btn-ghost flex-1 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
