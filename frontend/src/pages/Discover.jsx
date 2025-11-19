import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Link } from 'react-router-dom';

export default function Discover() {
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [priceType, setPriceType] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [town, setTown] = useState('');
  const [townSearch, setTownSearch] = useState('');
  const [towns, setTowns] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => { 
    fetchItems(); 
    fetchRecommendations();
    fetchTowns();
  }, []);

  useEffect(() => {
    if (sortBy === 'nearest' && (!lat || !lng)) {
      // Auto-request location when user selects nearest
      requestGeolocation();
    }
  }, [sortBy]);

  useEffect(() => {
    if (sortBy === 'nearest' && lat && lng) {
      fetchItems();
    }
  }, [lat, lng, radiusKm]);

  useEffect(() => {
    if (priceType !== 'Sell') {
      setMinPrice('');
      setMaxPrice('');
    }
  }, [priceType]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get('/api/items', { params: { 
        category: category || undefined, 
        priceType: priceType || undefined,
        town: town || undefined,
        condition: condition || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined
        ,sortBy: sortBy || undefined,
        lat: sortBy === 'nearest' && lat ? lat : undefined,
        lng: sortBy === 'nearest' && lng ? lng : undefined,
        radiusKm: sortBy === 'nearest' && radiusKm ? radiusKm : undefined
      } });
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTowns() {
    try {
      const res = await api.get('/api/items/towns');
      setTowns(res.data || []);
    } catch (e) {
      console.error('Failed to fetch towns', e);
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

  function requestGeolocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGeoLoading(false);
      },
      (err) => {
        setGeoError('Permission denied or geolocation unavailable');
        setGeoLoading(false);
      }
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center sm:text-left animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">🌍 Discover Items</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Find sustainable items being shared in your community</p>
      </div>
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">🎯 Recommended for You</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Based on your interests</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {recommendations.slice(0, 3).map(item => (
              <Link to={`/items/${item._id}`} key={item._id} className="card hover:shadow-2xl hover:scale-105 group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/10 border-2 border-green-300 dark:border-green-700 transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-4 flex items-center justify-center rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="object-cover h-40 w-full" /> : <span className="text-gray-400 text-sm">No image</span>}
                </div>
                <h3 className="font-bold text-base mb-2 dark:text-white line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.category} • {item.priceType}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">✨ Perfect match</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters Section */}
      <div className="card mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <h3 className="font-bold text-xl mb-4 gradient-text flex items-center gap-2">🔍 Filter & Sort</h3>
        <div className="space-y-4">
          {/* Row 1: Category, Type, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field text-sm w-full">
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
              <select value={priceType} onChange={e=>setPriceType(e.target.value)} className="input-field text-sm w-full">
                <option value="">Any Type</option>
                <option>Free</option>
                <option>Exchange</option>
                <option>Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Condition</label>
              <select value={condition} onChange={e=>setCondition(e.target.value)} className="input-field text-sm w-full">
                <option value="">Any Condition</option>
                <option>New</option>
                <option>Used</option>
              </select>
            </div>
          </div>
          
          {/* Price Range (conditional) */}
          {priceType === 'Sell' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Min Price</label>
                <input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="0" className="input-field text-sm w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Price</label>
                <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Any" className="input-field text-sm w-full" />
              </div>
            </div>
          )}

          {/* Row 2: Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search Town</label>
              <input 
                type="text" 
                placeholder="Type to search..." 
                value={townSearch} 
                onChange={e=>setTownSearch(e.target.value)} 
                className="input-field text-sm w-full" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Town</label>
              <select value={town} onChange={e=>setTown(e.target.value)} className="input-field text-sm w-full">
                <option value="">All Towns</option>
                {towns.filter(t=>t.toLowerCase().includes(townSearch.toLowerCase())).map(townName => (
                  <option key={townName} value={townName}>{townName}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Row 3: Sort */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sort By</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="input-field text-sm flex-1">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nearest">Nearest to Me</option>
              </select>
              {sortBy === 'nearest' && (
                <>
                  <select value={radiusKm} onChange={e=>setRadiusKm(Number(e.target.value))} className="input-field text-sm w-full sm:w-40">
                    <option value={3}>Within 3 km</option>
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                  </select>
                  <button onClick={requestGeolocation} className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 text-blue-700 dark:text-blue-300 font-medium py-2.5 px-4 rounded-xl transition-all whitespace-nowrap text-sm border-2 border-blue-200 dark:border-blue-700 hover:scale-105 active:scale-95 shadow-md">
                    {geoLoading ? '📍 Locating...' : '📍 Use My Location'}
                  </button>
                </>
              )}
            </div>
            {geoError && <p className="text-xs text-red-500 mt-2">{geoError}</p>}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={()=>fetchItems()} className="btn-primary text-sm">
              🔍 Apply Filters
            </button>
            <button onClick={()=>{ setCategory(''); setPriceType(''); setCondition(''); setMinPrice(''); setMaxPrice(''); setTown(''); setTownSearch(''); setSortBy('newest'); fetchItems(); }} className="btn-secondary text-sm">
              ↺ Reset All
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 animate-pulse">
          <div className="inline-block w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading sustainable items...</p>
        </div>
      )}

      {/* Map removed - list view with town filters now in place */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map(i => (
          <Link to={`/items/${i._id}`} key={i._id} className={`card hover:shadow-2xl hover:scale-105 group transition-all duration-300 ${i.status !== 'available' ? 'opacity-60' : ''}`}>
            <div className="relative">
              <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 mb-3 sm:mb-4 flex items-center justify-center rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {i.imageUrl ? <img src={i.imageUrl} alt={i.title} className="object-cover h-40 sm:h-48 w-full" /> : <span className="text-gray-400 text-sm font-medium">No image</span>}
              </div>
              {i.status !== 'available' && (
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                    i.status === 'sold'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  }`}>
                    {i.status === 'sold' ? 'SOLD' : 'EXCHANGED'}
                  </span>
                </div>
              )}
            </div>
            <h2 className={`font-bold text-base sm:text-lg mb-1 dark:text-white ${i.status !== 'available' ? 'line-through text-gray-500 dark:text-gray-600' : ''} line-clamp-2`}>{i.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{i.category} • {i.condition}</p>
            
            <div className="flex justify-between items-center gap-2">
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                i.status !== 'available'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  : i.priceType === 'Free'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : i.priceType === 'Exchange'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}>
                {i.status !== 'available' ? 'UNAVAILABLE' : i.priceType}
              </span>
              {i.priceType === 'Sell' && i.status === 'available' && (
                <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${i.price || 0}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12 animate-fade-in">
          <div className="glass-effect rounded-3xl p-8 sm:p-12 max-w-lg mx-auto border-2 border-gray-200 dark:border-gray-700">
            <div className="text-6xl sm:text-7xl mb-6 animate-bounce-slow">🔍</div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 gradient-text">No Items Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base sm:text-lg">
              {town ? `No items available in ${town}` : 
               category ? `No ${category.toLowerCase()} items found` :
               'No items match your current filters'}
            </p>
            <button 
              onClick={()=>{ setCategory(''); setPriceType(''); setCondition(''); setMinPrice(''); setMaxPrice(''); setTown(''); setTownSearch(''); setSortBy('newest'); }} 
              className="btn-primary"
            >
              ↺ Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
