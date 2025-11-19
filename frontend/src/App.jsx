import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';
import { api } from './services/api.js';
import { Bell, ShoppingCart } from 'lucide-react';
import Discover from './pages/Discover.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PostItem from './pages/PostItem.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import MyListings from './pages/MyListings.jsx';
import Messages from './pages/Messages.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Preview from './pages/Preview.jsx';
import EditItem from './pages/EditItem.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Profile from './pages/Profile.jsx';
import Cart from './pages/Cart.jsx';

function Private({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Home() {
  const { token } = useAuth();
  return token ? <Navigate to="/discover" replace /> : <Preview />;
}

function Layout({ children }) {
  const { token, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentUnread, setRecentUnread] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    const fetchUnread = async () => {
      if (!token) { setUnreadCount(0); return; }
      try {
        const res = await api.get('/api/messages');
        setUnreadCount(res.data?.count || 0);
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
    if (token) {
      timer = setInterval(fetchUnread, 20000);
    }
    return () => timer && clearInterval(timer);
  }, [token]);

  const fetchRecentUnread = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/api/messages/${user.id}`);
      // Only unread where current user is receiver
      const unread = res.data.filter(m => {
        const receiverId = m.receiverId._id || m.receiverId;
        return receiverId === user.id && m.read !== true;
      })
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
      setRecentUnread(unread);
    } catch (e) {
      // ignore
    }
  };

  const toggleNotifications = async () => {
    const next = !showDropdown;
    setShowDropdown(next);
    if (next) await fetchRecentUnread();
  };

  const markAllRead = async () => {
    try {
      await api.post('/api/messages/read');
      setUnreadCount(0);
      setRecentUnread([]);
      setShowDropdown(false);
    } catch (e) {
      // ignore
    }
  };
  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <header className="glass-effect sticky top-0 z-50 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-3 sm:py-4">\n          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="text-lg sm:text-2xl font-bold gradient-text dark:text-transparent dark:bg-gradient-to-r dark:from-green-400 dark:to-emerald-400 dark:bg-clip-text flex items-center gap-1 hover:scale-105 transition-transform">
                {!token && location.pathname !== '/' && "← "}
                🌿 EcoLoop
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-6 xl:gap-8 items-center">
              {token && <Link to="/discover" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">Discover</Link>}
              {token && <Link to="/post" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">Post</Link>}
              {token && <Link to="/messages" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">Messages</Link>}
              {token && <Link to="/chatbot" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">EcoBot 🌿</Link>}
              {token && <Link to="/leaderboard" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">Leaderboard</Link>}
              {token && user?.role === 'admin' && <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all hover:scale-105 text-sm xl:text-base">Admin</Link>}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {token && (
                <>
                  {/* Shopping Cart Icon */}
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-110 active:scale-95"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] leading-3 rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center shadow-lg shadow-green-500/50 animate-pulse">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleNotifications}
                      aria-label="Notifications"
                      className="relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-110 active:scale-95"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] leading-3 rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center shadow-lg shadow-red-500/50 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-effect rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden animate-slide-up">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                        <button onClick={()=>setShowDropdown(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:scale-110 transition-transform">Close</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {recentUnread.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No new messages</div>
                        ) : (
                          recentUnread.map(m => (
                            <button
                              key={m._id}
                              onClick={() => { setShowDropdown(false); navigate('/messages'); }}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                  <span className="text-white text-sm font-bold">{(m.senderId.name?.[0] || '?').toUpperCase()}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-gray-900 dark:text-white truncate"><span className="font-semibold">{m.senderId.name || 'Someone'}</span>: {m.content}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(m.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
                        <button onClick={markAllRead} className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">Mark all as read</button>
                        <Link to="/messages" onClick={()=>setShowDropdown(false)} className="text-sm text-gray-600 dark:text-gray-300 hover:underline font-medium">View all</Link>
                      </div>
                    </div>
                  )}
                </div>
                </>
              )}

              {/* Mobile Menu Button */}
              {token && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-110 active:scale-95"
                  aria-label="Menu"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              )}

              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-blue-900 dark:hover:to-indigo-900 transition-all hover:scale-110 active:scale-95 flex items-center gap-1 text-sm" title="Toggle theme">
                <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
                <span className="hidden sm:inline font-medium">{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>

              {token ? (
                <div className="hidden sm:flex gap-2 xl:gap-3 items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-20 xl:max-w-none">👋 {user?.name}</span>
                  <Link to="/profile" className="btn-secondary text-xs xl:text-sm px-3 xl:px-6 py-2 xl:py-3">Profile</Link>
                  <Link to="/my" className="btn-secondary text-xs xl:text-sm px-3 xl:px-6 py-2 xl:py-3">My Items</Link>
                </div>
              ) : (
                <div className="flex gap-1 sm:gap-2">
                  <Link to="/login" className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all font-semibold ${location.pathname === '/login' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'btn-ghost hover:bg-green-50 dark:hover:bg-gray-700'}`}>Login</Link>
                  <Link to="/register" className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all font-semibold ${location.pathname === '/register' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'}`}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && token && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
              <nav className="flex flex-col gap-3">
                <Link to="/discover" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">🔍 Discover</Link>
                <Link to="/post" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">📝 Post Item</Link>
                <Link to="/messages" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">💬 Messages</Link>
                <Link to="/chatbot" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">🤖 EcoBot</Link>
                <Link to="/leaderboard" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">🏆 Leaderboard</Link>
                {user?.role === 'admin' && <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">👑 Admin</Link>}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">👋 {user?.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="btn-secondary text-sm flex-1 text-center">Profile</Link>
                    <Link to="/my" onClick={() => setShowMobileMenu(false)} className="btn-secondary text-sm flex-1 text-center">My Items</Link>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">{children}</main>
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-gray-300 text-center py-6 sm:py-8 mt-8 sm:mt-12 border-t border-gray-700">
        <p className="text-xs sm:text-sm font-medium">🌍 SDG 12 — Responsible Consumption and Production | © EcoLoop 2025</p>
        <p className="text-xs text-gray-500 mt-2">Building a sustainable future, one item at a time 🌿</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5a4',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/discover" element={<Private><Discover /></Private>} />
            <Route path="/post" element={<Private><PostItem /></Private>} />
            <Route path="/edit/:id" element={<Private><EditItem /></Private>} />
            <Route path="/items/:id" element={<Private><ItemDetails /></Private>} />
            <Route path="/my" element={<Private><MyListings /></Private>} />
            <Route path="/cart" element={<Private><Cart /></Private>} />
            <Route path="/messages" element={<Private><Messages /></Private>} />
            <Route path="/chatbot" element={<Private><Chatbot /></Private>} />
            <Route path="/leaderboard" element={<Private><Leaderboard /></Private>} />
            <Route path="/profile" element={<Private><Profile /></Private>} />
            <Route path="/admin" element={<Private><AdminDashboard /></Private>} />
          </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
