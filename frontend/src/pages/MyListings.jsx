import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function MyListings() {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => { (async () => {
    try {
      const res = await api.get('/api/items');
      // ownerId may be populated ({ _id }) or just an id string — handle both
      const list = res.data.filter(i => {
        const owner = i.ownerId?._id || i.ownerId;
        return String(owner) === String(user?.id);
      });
      setItems(list);
    } catch (e) { console.error(e); }
  })(); }, [user]);

  const handleStatusChange = async (itemId, newStatus, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If marking as sold or exchanged, ask for recipient
    if (newStatus === 'sold' || newStatus === 'exchanged') {
      setSelectedItem(itemId);
      setSelectedStatus(newStatus);
      setShowRecipientModal(true);
      return;
    }
    
    // For marking back to available, no recipient needed
    try {
      await api.patch(`/api/items/${itemId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Item marked as ${newStatus}`);
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update item status');
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!recipientEmail || !recipientEmail.trim()) {
      toast.error('Please enter the recipient\'s email');
      return;
    }

    try {
      // Find the recipient user by email
      const recipientRes = await api.get(`/api/auth/find-by-email/${encodeURIComponent(recipientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const recipient = recipientRes.data;

      if (recipient._id === user?.id) {
        toast.error('You cannot mark yourself as the recipient');
        return;
      }

      // Update item status with recipient
      await api.patch(`/api/items/${selectedItem}/status`, { 
        status: selectedStatus,
        recipientId: recipient._id 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Item marked as ${selectedStatus}! Both you and ${recipient.name} earned eco-points! 🎉`);
      setItems(items.map(item => 
        item._id === selectedItem ? { ...item, status: selectedStatus, recipientId: recipient._id } : item
      ));
      
      // Reset modal
      setShowRecipientModal(false);
      setRecipientEmail('');
      setSelectedItem(null);
      setSelectedStatus(null);
    } catch (error) {
      console.error('Status update error:', error);
      if (error.response?.status === 404) {
        toast.error('User with this email not found. They must be registered on EcoLoop.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update item status');
      }
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
      
      {/* Recipient Modal */}
      {showRecipientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-md w-full my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Who received this item?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter the email address of the person who received this item. They'll also earn eco-points for participating in the sustainable exchange! 🌱
            </p>
            <input
              type="email"
              placeholder="Recipient's email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={handleConfirmStatusChange}
                className="btn-primary flex-1"
              >
                Confirm
              </button>
              <button 
                onClick={() => {
                  setShowRecipientModal(false);
                  setRecipientEmail('');
                  setSelectedItem(null);
                  setSelectedStatus(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No items listed yet</p>
          <Link to="/post" className="btn-primary">Post Your First Item</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i._id} className="card hover:shadow-lg group relative overflow-hidden flex flex-col">
              {i.status !== 'available' && (
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    i.status === 'sold'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {i.status === 'sold' ? 'SOLD' : 'EXCHANGED'}
                  </span>
                </div>
              )}

              <Link to={`/items/${i._id}`} className="block">
                <div className="overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 group-hover:scale-105 transition-transform">
                  {i.imageUrl ? <img src={i.imageUrl} alt={i.title} className="object-cover h-48 w-full" /> : <div className="h-48 flex items-center justify-center text-gray-400">No image</div>}
                </div>
                <div className="p-4">
                  <h2 className={`font-bold text-lg mb-1 dark:text-white ${i.status !== 'available' ? 'line-through text-gray-500 dark:text-gray-600' : ''}`}>{i.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{i.category} • {i.condition}</p>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      i.status === 'sold'
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : i.status === 'exchanged'
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                          : i.priceType === 'Free'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : i.priceType === 'Exchange'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                    }`}>
                      {i.status === 'available' ? i.priceType : i.status.toUpperCase()}
                    </span>
                    {i.priceType === 'Sell' && i.status === 'available' && (
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">${i.price || 0}</span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="p-4 pt-0 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {i.status === 'available' && (
                    <>
                      <button 
                        onClick={(e) => handleStatusChange(i._id, 'sold', e)} 
                        className="btn-secondary flex-auto min-w-[10rem] text-center text-sm"
                      >
                        Mark Sold
                      </button>
                      <button 
                        onClick={(e) => handleStatusChange(i._id, 'exchanged', e)} 
                        className="btn-secondary flex-auto min-w-[10rem] text-center text-sm"
                      >
                        Mark Exchanged
                      </button>
                    </>
                  )}
                  {i.status !== 'available' && (
                    <button 
                      onClick={(e) => handleStatusChange(i._id, 'available', e)} 
                      className="btn-secondary flex-auto min-w-[10rem] text-center text-sm"
                    >
                      Mark Available
                    </button>
                  )}
                  <Link 
                    to={`/edit/${i._id}`} 
                    className="btn-secondary flex-auto min-w-[8rem] text-center text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✏️ Edit
                  </Link>
                  <button 
                    onClick={(e) => handleDelete(i._id, e)} 
                    className="btn-ghost flex-auto min-w-[8rem] text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
