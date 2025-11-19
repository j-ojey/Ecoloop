import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Trash2 } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/api/favorites');
      setFavorites(response.data);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (itemId) => {
    try {
      await api.delete(`/api/favorites/${itemId}`);
      setFavorites(favorites.filter(item => item._id !== itemId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading favorites...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
          My Favorites
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Items you've saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">No favorites yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding items to your favorites to see them here
          </p>
          <Link to="/discover" className="btn-primary inline-block">
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div key={item._id} className="card group hover:shadow-xl transition-all duration-300">
              <Link to={`/items/${item._id}`}>
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-4 flex items-center justify-center rounded-xl overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 dark:text-white group-hover:text-primary transition-colors">{item.title}</h3>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                    {item.condition}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.priceType === 'Free'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : item.priceType === 'Exchange'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                  }`}>
                    {item.priceType}
                  </span>
                </div>
                {item.priceType === 'Sell' && (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                    ${item.price || 0}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {item.description}
                </p>
              </Link>
              <button
                onClick={() => removeFavorite(item._id)}
                className="w-full btn-secondary flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
