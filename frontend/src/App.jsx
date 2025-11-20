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
import Welcome from './pages/Welcome.jsx';
import EditItem from './pages/EditItem.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Profile from './pages/Profile.jsx';
import Cart from './pages/Cart.jsx';
import Favorites from './pages/Favorites.jsx';

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
        const res = await api.get('/messages');
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
      const res = await api.get(`/messages/${user.id}`);
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

  const [searchQuery, setSearchQuery] = useState('');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const avatarRef = React.useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarDropdown(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = (searchQuery || '').trim();
    if (!q) return;
    setSearchQuery('');
    navigate(`/discover?query=${encodeURIComponent(q)}`);
  };

  const markAllRead = async () => {
    try {
      await api.post('/messages/read');
      setUnreadCount(0);
      setRecentUnread([]);
      setShowDropdown(false);
    } catch (e) {
      // ignore
    }
  };
  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <header className="glass-effect sticky top-0 z-50 shadow-xl border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="text-xl sm:text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent flex items-center gap-2 hover:scale-105 transition-transform">
                <span>EcoLoop</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-2 xl:gap-3 items-center">
              {token && <Link to="/discover" className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-all text-sm xl:text-base">Discover</Link>}
              {token && <Link to="/post" className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-all text-sm xl:text-base">Post Item</Link>}
              {token && <Link to="/messages" className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-all text-sm xl:text-base">Messages</Link>}
              {token && <Link to="/chatbot" className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-all text-sm xl:text-base">🤖 EcoBot</Link>}
              {token && <Link to="/leaderboard" className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-all text-sm xl:text-base">Leaderboard</Link>}
              {token && user?.role === 'admin' && <Link to="/admin" className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 font-bold transition-all text-sm xl:text-base">Admin</Link>}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {token && (
                <>
                  {/* Shopping Cart Icon */}
                  <Link
                    to="/cart"
                    className="relative p-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 group"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-bold leading-3 rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center shadow-lg shadow-green-500/50">
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
                      className="relative p-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 group"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold leading-3 rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center shadow-lg shadow-red-500/50 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 z-[60] max-h-96 overflow-hidden animate-slide-up">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                          </span>
                          <button onClick={()=>setShowDropdown(false)} className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-semibold hover:scale-110 transition-transform">✕</button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {recentUnread.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No new messages</p>
                          </div>
                        ) : (
                          recentUnread.map(m => (
                            <button
                              key={m._id}
                              onClick={() => { setShowDropdown(false); navigate('/messages'); }}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0"
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
                <div className="hidden sm:flex gap-3 xl:gap-4 items-center relative" ref={avatarRef}>
                  <button onClick={() => setShowAvatarDropdown(s => !s)} className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">{(user?.name?.[0] || '?').toUpperCase()}</div>
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">View profile</span>
                    </div>
                  </button>

                  {showAvatarDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-[60]">
                      <Link to="/profile" onClick={() => setShowAvatarDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Profile</Link>
                      <Link to="/my" onClick={() => setShowAvatarDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">My Items</Link>
                      <Link to="/favorites" onClick={() => setShowAvatarDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Favorites</Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button onClick={() => { setShowAvatarDropdown(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Logout</button>
                    </div>
                  )}
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
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up overflow-y-auto max-h-[calc(100vh-200px)]">
              <nav className="flex flex-col gap-3">
                <Link to="/discover" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">🔍 Discover</Link>
                <Link to="/post" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">📝 Post Item</Link>
                <Link to="/favorites" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-all py-2 hover:pl-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 px-2">❤️ Favorites</Link>
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in max-w-7xl">{children}</main>
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
            <Route path="/welcome" element={<Private><Welcome /></Private>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/discover" element={<Private><Discover /></Private>} />
            <Route path="/post" element={<Private><PostItem /></Private>} />
            <Route path="/edit/:id" element={<Private><EditItem /></Private>} />
            <Route path="/items/:id" element={<Private><ItemDetails /></Private>} />
            <Route path="/my" element={<Private><MyListings /></Private>} />
            <Route path="/cart" element={<Private><Cart /></Private>} />
            <Route path="/favorites" element={<Private><Favorites /></Private>} />
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
