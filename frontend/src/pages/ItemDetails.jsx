import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import ChatModal from '../components/ChatModal.jsx';

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

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => { (async () => {
    try { const res = await api.get(`/api/items/${id}`); setItem(res.data); } catch (e) { console.error(e); }
  })(); }, [id]);

  if (!item) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  
  const carbonSaved = CARBON_SAVINGS[item.category] || 5;
  const ecoPointsEarned = calculateEcoPoints(item.category, 'create');
  const ecoPointsPotential = calculateEcoPoints(item.category, 'complete');
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-6 flex items-center justify-center rounded-xl overflow-hidden">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="object-cover h-96 w-full" /> : <span className="text-gray-400">No image</span>}
        </div>
        <h1 className="text-3xl font-bold mb-2 dark:text-white">{item.title}</h1>
        <div className="flex gap-3 mb-6 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">{item.category}</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{item.condition}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            item.status === 'sold'
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              : item.status === 'exchanged'
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                : 'bg-accent/10 dark:bg-accent/20 text-accent'
          }`}>
            {item.status === 'available' ? item.priceType : item.status.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{item.description}</p>
        
        {/* Carbon Savings Section */}
        <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-500 mb-6">
          <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
            🌍 Environmental Impact
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300 mb-2">
            ~{carbonSaved}kg CO₂ Saved
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            By reusing this {item.category.toLowerCase()} instead of buying new, you're helping reduce carbon emissions equivalent to driving {Math.round(carbonSaved * 3.5)} km in a car! 🚗
          </p>
          
          {/* Eco Points Section */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">Eco Points Earned</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">For listing this item</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{ecoPointsEarned}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
              </div>
            </div>
            {item.status === 'available' && (
              <div className="mt-2 pt-2 border-t border-green-300 dark:border-green-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Complete the exchange/sale to earn <strong>+{ecoPointsPotential}</strong> more points!
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ♻️ Every reused item keeps waste out of landfills and reduces the demand for new production.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-lg mb-4 dark:text-white">Posted by</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">{item.ownerId?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold">{item.ownerId?.name || 'Anonymous'}</p>
              {item.status === 'available' ? (
                <button
                  onClick={() => setShowChat(true)}
                  className="btn-secondary text-sm mt-2"
                >
                  Send Message
                </button>
              ) : (
                <span className="text-sm text-gray-500 mt-2 inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  Item {item.status === 'sold' ? 'Sold' : 'Exchanged'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        recipientId={item?.ownerId?._id}
        recipientName={item?.ownerId?.name}
        itemId={item?._id}
        itemTitle={item?.title}
      />
    </div>
  );
}
