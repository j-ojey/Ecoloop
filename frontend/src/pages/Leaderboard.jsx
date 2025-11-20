import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/leaderboard', { timeout: 10000 });
      setUsers(res.data.topUsers || res.data);
      setCurrentUserPosition(res.data.currentUserPosition || null);
    } catch (e) {
      console.error(e);
      setError('Failed to load leaderboard. Please try again.');
    }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
          Eco-Champions Leaderboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Celebrating our top 20 sustainability heroes
        </p>
      </div>
      
      <div className="card bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-emerald-900/10">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading champions...</p>
          </div>
        )}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-6 text-lg font-semibold">{error}</p>
            <button onClick={fetchUsers} className="btn-primary">Try Again</button>
          </div>
        )}
        {!loading && !error && (
          <>
            <ol className="space-y-2">
              {users.map((u, idx) => {
                const isCurrentUser = user?.id === u._id;
                const isTopThree = idx < 3;
                return (
                  <li 
                    key={u._id} 
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-400 dark:border-green-500 shadow-lg scale-105' 
                        : isTopThree
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:shadow-md'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className={`flex-shrink-0 font-black w-12 text-center ${
                      isTopThree ? 'text-4xl' : 'text-2xl text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        isCurrentUser 
                          ? 'text-green-800 dark:text-green-300' 
                          : isTopThree
                            ? 'text-amber-800 dark:text-amber-300'
                            : 'text-gray-900 dark:text-white'
                      }`}>
                        {u.name} 
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-semibold">
                            YOU
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-2xl ${
                        isTopThree 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {u.ecoPoints}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">ECO POINTS</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {/* Current User Position if not in top 20 */}
      {currentUserPosition && !loading && !error && (
        <div className="card bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold dark:text-white">Your Position</h2>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <span className="flex-shrink-0 text-4xl font-black text-blue-600 dark:text-blue-400 w-16 text-center">
              #{currentUserPosition.rank}
            </span>
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">{currentUserPosition.user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep earning points to climb higher!
              </p>
            </div>
            <div className="text-right">
              <p className="font-black text-3xl text-blue-600 dark:text-blue-400">{currentUserPosition.user.ecoPoints}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">ECO POINTS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
