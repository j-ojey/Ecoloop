import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get('/api/leaderboard');
      setUsers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Eco-Points Leaderboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Top contributors building a sustainable community.</p>
      <div className="card">
        {loading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</p>}
        <ol className="space-y-3">
          {users.map((u, idx) => (
            <li key={u._id} className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="flex-shrink-0 text-2xl font-bold text-primary w-8 text-center">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">{u.ecoPoints}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
