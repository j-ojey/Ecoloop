import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Calendar, Award, Settings, LogOut, Edit, Shield, HelpCircle, Save, X, Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const { user, logout, token } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setUserStats(response.data);
      setEditForm({
        name: response.data.name || '',
        phone: response.data.phone || ''
      });
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast.success('Logged out successfully');
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: userStats?.name || '',
      phone: userStats?.phone || ''
    });
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/api/auth/profile', {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null
      });

      setUserStats(prev => ({
        ...prev,
        name: response.data.user.name,
        phone: response.data.user.phone
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your account and view your EcoLoop activity
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: Award },
              { id: 'account', label: 'Account', icon: Settings },
              { id: 'contact', label: 'Contact Us', icon: HelpCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                      {userStats?.ecoPoints || user?.ecoPoints || 0}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Eco Points Earned</div>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                      {userStats?.itemsListed || 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Items Listed</div>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                      {userStats?.itemsExchanged || 0}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-500">Items Exchanged</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Recent Activity
              </h2>

              {userStats?.recentActivity && userStats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {userStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900 dark:text-white">{activity.description}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">No recent activity</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start by listing an item or making an exchange to see your activity here.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Account Information */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Account Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-gray-900 dark:text-white">{userStats?.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-gray-900 dark:text-white">
                        {userStats?.phone || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">{userStats?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {userStats?.createdAt ? new Date(userStats.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Status
                  </label>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleEditProfile}
                  className="btn-secondary flex items-center gap-2 justify-center"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="btn-secondary flex items-center gap-2 justify-center"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Contact Us
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Get help with your account</p>
                    <a href="mailto:support@ecoloop.com" className="text-primary hover:underline">
                      support@ecoloop.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Mon-Fri, 9AM-6PM EST</p>
                    <a href="tel:+1-555-ECO-LOOP" className="text-primary hover:underline">
                      +1 (555) ECO-LOOP
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Office Address</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      123 Green Street<br />
                      Eco City, EC 12345<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Help Center</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Find answers to common questions</p>
                    <a href="#" className="text-primary hover:underline">
                      Visit Help Center
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Support</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    For urgent account issues or security concerns
                  </p>
                  <a href="mailto:emergency@ecoloop.com" className="text-red-600 hover:underline text-sm font-medium">
                    emergency@ecoloop.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Follow Us</h2>
              <div className="flex gap-4">
                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <span>📘</span>
                  Facebook
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <span>🐦</span>
                  Twitter
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  <span>📷</span>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Profile Visibility</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your profile information is kept private and only visible to you.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Data Security</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    We use industry-standard encryption to protect your personal information.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Contact Information</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Phone numbers are optional and used only for account verification and important notifications.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Data Retention</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Your data is retained only as long as your account is active. You can request deletion at any time.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
                <button className="flex-1 btn-primary">
                  Manage Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}