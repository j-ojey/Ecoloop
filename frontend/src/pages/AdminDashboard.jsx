import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load user list');
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleSuspend = async (userId, suspend) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/suspend`, { suspended: suspend });
      setUsers(prev => prev.map(u => (u._id === userId ? data : u)));
      toast.success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
    } catch (error) {
      console.error('Failed to update suspension:', error);
      toast.error('Failed to update user');
    }
  };

  const changeRole = async (userId, role) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => (u._id === userId ? data : u)));
      toast.success('Role updated');
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading analytics...</div>;
  if (!stats) return <div className="text-center py-12 text-red-500">Failed to load statistics</div>;

  const categoryData = {
    labels: stats.itemsByCategory.map(c => c._id),
    datasets: [{
      label: 'Items by Category',
      data: stats.itemsByCategory.map(c => c.count),
      backgroundColor: [
        'rgba(14, 165, 164, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: [
        'rgb(14, 165, 164)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(236, 72, 153)',
      ],
      borderWidth: 2,
    }]
  };

  const priceTypeData = {
    labels: stats.itemsByPriceType.map(p => p._id),
    datasets: [{
      label: 'Distribution',
      data: stats.itemsByPriceType.map(p => p.count),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(59, 130, 246)',
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Platform analytics and statistics</p>
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
          <h3 className="text-4xl font-bold text-primary mb-2">{stats.totalUsers}</h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Total Users</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
          <h3 className="text-4xl font-bold text-accent mb-2">{stats.totalItems}</h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Items Posted</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20">
          <h3 className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">{stats.totalMessages}</h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Messages Sent</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20">
          <h3 className="text-4xl font-bold text-purple-600 dark:text-purple-500 mb-2">{Math.round(stats.ecoPointsStats.total)}</h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Total Eco-Points</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-bold text-xl mb-4 dark:text-white">📊 Items by Category</h2>
          <Bar data={categoryData} options={chartOptions} />
        </div>
        <div className="card">
          <h2 className="font-bold text-xl mb-4 dark:text-white">💰 Price Type Distribution</h2>
          <Pie data={priceTypeData} options={chartOptions} />
        </div>
      </div>

      {/* Top Contributors */}
      <div className="card">
        <h2 className="font-bold text-xl mb-4 dark:text-white">🏆 Top Contributors</h2>
        <div className="space-y-3">
          {stats.topContributors.map((user, idx) => (
            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                </span>
                <div>
                  <p className="font-semibold dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rank #{idx + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{user.ecoPoints}</p>
                <p className="text-xs text-gray-500">eco-points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div className="card mt-6">
        <h2 className="font-bold text-xl mb-4 dark:text-white">👥 User Management</h2>
        {usersLoading ? (
          <div className="p-6 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Eco Points</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">{u.ecoPoints}</td>
                    <td className="px-4 py-3">{u.suspended ? 'Suspended' : 'Active'}</td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button onClick={() => toggleSuspend(u._id, !u.suspended)} className={`px-2 py-1 rounded text-sm ${u.suspended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <select className="input-field" value={u.role} onChange={e => changeRole(u._id, e.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

