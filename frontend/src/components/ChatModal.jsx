import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MessageCircle, Send, X, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function ChatModal({ isOpen, onClose, recipientId, recipientName, itemId, itemTitle }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && recipientId) {
      initializeChat();
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isOpen, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Initialize socket connection
      const newSocket = io(API_BASE, { auth: { token } });
      newSocket.emit('join', user.id);
      newSocket.on('private_message', (msg) => {
        const senderId = msg.senderId._id || msg.senderId;
        const receiverId = msg.receiverId._id || msg.receiverId;
        if ((senderId === recipientId && receiverId === user.id) ||
            (senderId === user.id && receiverId === recipientId)) {
          setMessages(prev => [...prev, msg]);
        }
      });
      setSocket(newSocket);

      // Load existing messages
      await loadMessages();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/api/messages/${user.id}`);
      // Filter messages for this conversation
      const conversationMessages = response.data.filter(msg => {
        const senderId = msg.senderId._id || msg.senderId;
        const receiverId = msg.receiverId._id || msg.receiverId;
        return (senderId === recipientId && receiverId === user.id) ||
               (senderId === user.id && receiverId === recipientId);
      });
      setMessages(conversationMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        receiverId: recipientId,
        content: newMessage.trim(),
        itemId: itemId
      };

      const response = await api.post('/api/messages', messageData);

      // Add message to local state immediately
      setMessages(prev => [...prev, response.data]);

      // Emit via socket
      if (socket) {
        socket.emit('private_message', { to: recipientId, message: response.data });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{recipientName}</h3>
              {itemTitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Re: {itemTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderId._id === user.id || message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId._id === user.id || message.senderId === user.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId._id === user.id || message.senderId === user.id
                      ? 'text-primary-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}