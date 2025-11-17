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

  const handleStatusChange = async (itemId, newStatus, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.patch(`/api/items/${itemId}/status`, { status: newStatus });
      toast.success(`Item marked as ${newStatus}`);
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      toast.error('Failed to update item status');
    }
  };

  const handleDelete = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      await api.delete(`/api/items/${itemId}`);
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
              {i.status !== 'available' && (
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    i.status === 'sold'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {i.status === 'sold' ? 'SOLD' : 'EXCHANGED'}
                  </span>
                </div>
              )}
              <Link to={`/items/${i._id}`}>
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 mb-4 flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                  {i.imageUrl ? <img src={i.imageUrl} alt={i.title} className="object-cover h-40 w-full" /> : <span className="text-gray-400">No image</span>}
                </div>
                <h2 className={`font-bold text-lg mb-1 dark:text-white ${i.status !== 'available' ? 'line-through text-gray-500' : ''}`}>{i.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{i.category} • {i.condition}</p>
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    i.status === 'sold'
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : i.status === 'exchanged'
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        : 'bg-accent/10 dark:bg-accent/20 text-accent'
                  }`}>
                    {i.status === 'available' ? i.priceType : i.status.toUpperCase()}
                  </span>
                </div>
              </Link>
              <div className="flex gap-2 mt-4">
                {i.status === 'available' && (
                  <>
                    <button 
                      onClick={(e) => handleStatusChange(i._id, 'sold', e)} 
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      Mark Sold
                    </button>
                    <button 
                      onClick={(e) => handleStatusChange(i._id, 'exchanged', e)} 
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      Mark Exchanged
                    </button>
                  </>
                )}
                {i.status !== 'available' && (
                  <button 
                    onClick={(e) => handleStatusChange(i._id, 'available', e)} 
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    Mark Available
                  </button>
                )}
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
