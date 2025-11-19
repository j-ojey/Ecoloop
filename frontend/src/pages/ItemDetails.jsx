import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import ChatModal from '../components/ChatModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import { Heart, Share2 } from 'lucide-react';
import { ItemDetailsSkeleton } from '../components/SkeletonLoaders.jsx';

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
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [item, setItem] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);

  useEffect(() => { (async () => {
    try { 
      const res = await api.get(`/api/items/${id}`); 
      setItem(res.data);
      // Check if favorited (only if user is authenticated)
      if (user) {
        try {
          const favRes = await api.get(`/api/favorites/check/${id}`);
          setIsFavorited(favRes.data.isFavorited);
        } catch (favError) {
          console.error('Favorites check error:', favError);
          // If favorites check fails, just set to false
          setIsFavorited(false);
        }
      }
      // Fetch related items
      if (res.data.category) {
        const relatedRes = await api.get('/api/items', {
          params: { category: res.data.category }
        });
        const filtered = relatedRes.data.filter(i => i._id !== id).slice(0, 3);
        setRelatedItems(filtered);
      }
    } catch (e) { console.error(e); }
  })(); }, [id, user]);

  const handleShowInterest = () => {
    setShowChat(true);
    toast.success('Message the seller to show your interest!');
  };

  const handleAddToCart = () => {
    if (item) {
      addToCart(item);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }
    
    try {
      console.log('Toggling favorite for item:', id, 'isFavorited:', isFavorited);
      if (isFavorited) {
        const response = await api.delete(`/api/favorites/${id}`);
        console.log('Remove favorite response:', response.data);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        const response = await api.post(`/api/favorites/${id}`);
        console.log('Add favorite response:', response.data);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this item on EcoLoop: ${item.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  if (!item) return <ItemDetailsSkeleton />;
  
  const carbonSaved = CARBON_SAVINGS[item.category] || 5;
  const ecoPointsEarned = calculateEcoPoints(item.category, 'create');
  const ecoPointsPotential = calculateEcoPoints(item.category, 'complete');
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-6 flex items-center justify-center rounded-xl overflow-hidden">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="object-cover h-full w-full" /> : <span className="text-gray-400">No image</span>}
        </div>
        <h1 className="text-3xl font-bold mb-2 dark:text-white flex items-center justify-between">
          <span>{item.title}</span>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Share item"
            >
              <Share2 className="w-6 h-6" />
            </button>
            {item.ownerId?._id !== user?.id && (
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-all ${
                  isFavorited 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </h1>
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">{item.category}</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{item.condition}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            item.status === 'sold'
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              : item.status === 'exchanged'
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                : item.priceType === 'Free'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : item.priceType === 'Exchange'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
          }`}>
            {item.status === 'available' ? item.priceType : item.status.toUpperCase()}
          </span>
          {item.town && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              📍 {item.town}
            </span>
          )}
        </div>

        {/* Price Display - Prominent for Sell items */}
        {item.priceType === 'Sell' && item.status === 'available' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">${item.price || 0}</p>
              </div>
              <div className="text-right">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary px-6 py-3 text-base"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
        
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl">{item.ownerId?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg dark:text-white">{item.ownerId?.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Seller</p>
            </div>
          </div>
          
          {item.status === 'available' && item.ownerId?._id !== user?.id && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleShowInterest}
                className="btn-primary flex-1"
              >
                💬 Show Interest
              </button>
              {item.priceType === 'Sell' && (
                <button
                  onClick={handleAddToCart}
                  className="btn-secondary flex-1"
                >
                  🛒 Add to Cart
                </button>
              )}
            </div>
          )}
          
          {item.status !== 'available' && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
              <span className="text-base text-gray-600 dark:text-gray-400">
                This item has been {item.status === 'sold' ? 'sold' : 'exchanged'}
              </span>
            </div>
          )}
          
          {item.ownerId?._id === user?.id && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                📌 This is your listing
              </span>
            </div>
          )}
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

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Similar Items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedItems.map((relItem) => (
              <a
                key={relItem._id}
                href={`/items/${relItem._id}`}
                className="card hover:shadow-lg transition-all group"
              >
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-3 flex items-center justify-center rounded-lg overflow-hidden">
                  {relItem.imageUrl ? (
                    <img src={relItem.imageUrl} alt={relItem.title} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-2 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                  {relItem.title}
                </h3>
                <div className="flex gap-1 flex-wrap mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    {relItem.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    relItem.priceType === 'Free' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                    relItem.priceType === 'Exchange' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                    'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                  }`}>
                    {relItem.priceType}
                  </span>
                </div>
                {relItem.priceType === 'Sell' && (
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${relItem.price || 0}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
