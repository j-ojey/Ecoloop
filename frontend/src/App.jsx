import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
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
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary dark:text-primary flex items-center gap-1">
            {!token && "< "}
            🌿 EcoLoop
          </Link>
          <nav className="flex gap-6 items-center">
            {token && <Link to="/discover" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Discover</Link>}
            {token && <Link to="/post" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Post</Link>}
            {token && <Link to="/messages" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Messages</Link>}
            {token && <Link to="/chatbot" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">EcoBot 🌿</Link>}
            {token && <Link to="/leaderboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Leaderboard</Link>}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1" title="Toggle theme">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            {token ? (
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</span>
                <Link to="/my" className="btn-secondary text-sm">My Items</Link>
                <button onClick={logout} className="btn-ghost text-sm">Logout</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className={`text-sm px-4 py-2 rounded-lg transition ${location.pathname === '/login' ? 'bg-primary text-white font-semibold' : 'btn-ghost hover:bg-primary/10'}`}>Login</Link>
                <Link to="/register" className={`text-sm px-4 py-2 rounded-lg transition ${location.pathname === '/register' ? 'bg-primary text-white font-semibold' : 'bg-primary/20 text-primary dark:text-primary font-medium hover:bg-primary/30'}`}>Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-900 dark:bg-black text-gray-300 text-center py-6 mt-12">
        <p className="text-sm">🌍 SDG 12 — Responsible Consumption and Production | © EcoLoop 2025</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
          <Route path="/messages" element={<Private><Messages /></Private>} />
          <Route path="/chatbot" element={<Private><Chatbot /></Private>} />
          <Route path="/leaderboard" element={<Private><Leaderboard /></Private>} />
          <Route path="/admin" element={<Private><AdminDashboard /></Private>} />
        </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
