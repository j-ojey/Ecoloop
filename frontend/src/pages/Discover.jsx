import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Link, useSearchParams } from 'react-router-dom';
import { ItemCardSkeleton } from '../components/SkeletonLoaders.jsx';

export default function Discover() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
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
    fetchItems();
  }, [category, priceType, town, sortBy, condition, searchQuery]);

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
      const res = await api.get('/items', { params: { 
        search: searchQuery || undefined,
        category: category || undefined, 
        priceType: priceType || undefined,
        town: town || undefined,
        condition: condition || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy: sortBy || undefined,
        lat: sortBy === 'nearest' && lat ? lat : undefined,
        lng: sortBy === 'nearest' && lng ? lng : undefined,
        radiusKm: sortBy === 'nearest' && radiusKm ? radiusKm : undefined
      } });
      // Filter out sold and exchanged items
      const availableItems = res.data.filter(item => item.status === 'available');
      setItems(availableItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTowns() {
    try {
      const res = await api.get('/items/towns');
      setTowns(res.data || []);
    } catch (e) {
      console.error('Failed to fetch towns', e);
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await api.get('/items/recommendations');
      // Filter out sold and exchanged items from recommendations
      const availableRecs = res.data.filter(item => item.status === 'available');
      setRecommendations(availableRecs);
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Discover Sustainable Treasures
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find amazing items while helping the planet
        </p>
      </div>
        
      {/* Search Bar with Icon */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for anything sustainable..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-green-500/30 focus:border-green-500 shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>
      </div>
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Picked For You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map(item => (
              <Link to={`/items/${item._id}`} key={item._id} className="group card hover:scale-105 transition-transform duration-300">
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 mb-4 rounded-xl overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Recommended
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 dark:text-white line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{item.priceType}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field text-sm py-2.5">
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

          <select value={priceType} onChange={e=>setPriceType(e.target.value)} className="input-field text-sm py-2.5">
            <option value="">Any Type</option>
            <option>Free</option>
            <option>Exchange</option>
            <option>Sell</option>
          </select>

          <select value={town} onChange={e=>setTown(e.target.value)} className="input-field text-sm py-2.5">
            <option value="">All Towns</option>
            {towns.map(townName => (
              <option key={townName} value={townName}>{townName}</option>
            ))}
          </select>

          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="input-field text-sm py-2.5">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>

          <button 
            onClick={()=>{ setCategory(''); setPriceType(''); setTown(''); setSortBy('newest'); setSearchQuery(''); }} 
            className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {items.length > 0 ? `${items.length} Items Available` : 'Browse Items'}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-16">
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No Items Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any items matching your search. Try adjusting your filters or search terms.
            </p>
            <button 
              onClick={()=>{ setCategory(''); setPriceType(''); setTown(''); setSortBy('newest'); setSearchQuery(''); fetchItems(); }} 
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(i => (
              <Link 
                to={`/items/${i._id}`} 
                key={i._id} 
                className={`group card hover:scale-105 transition-all duration-300 ${i.status !== 'available' ? 'opacity-70' : ''}`}
              >
                <div className="relative mb-4">
                  <div className="h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden">
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt={i.title} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {i.status !== 'available' && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                        i.status === 'sold' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {i.status === 'sold' ? 'SOLD' : 'EXCHANGED'}
                      </span>
                    </div>
                  )}
                </div>
                
                <h2 className={`font-bold text-lg mb-2 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors ${i.status !== 'available' ? 'line-through text-gray-500' : ''} line-clamp-1`}>
                  {i.title}
                </h2>
                
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-medium">{i.category}</span>
                  <span>•</span>
                  <span>{i.condition}</span>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                    i.priceType === 'Free' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                    i.priceType === 'Exchange' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  }`}>
                    {i.priceType}
                  </span>
                  {i.priceType === 'Sell' && i.status === 'available' && (
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">${i.price || 0}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
