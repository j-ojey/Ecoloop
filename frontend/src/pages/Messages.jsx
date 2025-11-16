import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Messages() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const socket = useMemo(() => io(API_BASE, { auth: { token } }), [token]);
  const endRef = useRef();

  useEffect(() => {
    if (!user?.id) return;
    socket.emit('join', user.id);
    socket.on('private_message', (msg) => setMessages(prev => [msg, ...prev]));
    return () => { socket.disconnect(); };
  }, [socket, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => { (async () => {
    try {
      const res = await api.get(`/api/messages/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (e) { console.error(e); }
  })(); }, [user, token]);

  async function send() {
    if (!to || !content) return;
    const body = { receiverId: to, content };
    const res = await api.post('/api/messages', body, { headers: { Authorization: `Bearer ${token}` } });
    setMessages(prev => [res.data, ...prev]);
    socket.emit('private_message', { to, message: res.data });
    setContent('');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Messages</h1>
      <div className="card">
        <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <input className="input-field flex-1" placeholder="Enter receiver's user ID..." value={to} onChange={e=>setTo(e.target.value)} />
          <button className="btn-ghost text-sm">User Search (Coming soon)</button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6">
          {messages.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No messages yet</p>}
          {messages.map(m => (
            <div key={m._id} className={`p-4 rounded-lg ${m.senderId === user.id ? 'bg-primary/10 dark:bg-primary/20 text-right' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{m.senderId === user.id ? 'You' : 'Them'}</div>
              <div className={`${m.senderId === user.id ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>{m.content}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
          <input className="input-field flex-1" placeholder="Type a message..." value={content} onChange={e=>setContent(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} />
          <button className="btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
