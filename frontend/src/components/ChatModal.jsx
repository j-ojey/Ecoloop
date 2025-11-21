import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MessageCircle, Send, X, User, Check, CheckCheck } from 'lucide-react';

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://ecoloop-backend-ed9e.onrender.com';
  }
  return 'http://localhost:4000';
};

export default function ChatModal({ isOpen, onClose, recipientId, recipientName, itemId, itemTitle }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
  }, [messages, typingUsers]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Initialize socket connection
      const newSocket = io(getSocketUrl(), { auth: { token } });
      newSocket.emit('join', user.id);
      newSocket.on('private_message', (msg) => {
        const senderId = msg.senderId._id || msg.senderId;
        const receiverId = msg.receiverId._id || msg.receiverId;
        if ((senderId === recipientId && receiverId === user.id) ||
            (senderId === user.id && receiverId === recipientId)) {
          setMessages(prev => [...prev, msg]);
        }
      });
      newSocket.on('typing', (data) => {
        if (data.userId === recipientId && data.recipientId === user.id) {
          setTypingUsers(prev => new Set(prev).add(data.userId));
        }
      });
      newSocket.on('stop_typing', (data) => {
        if (data.userId === recipientId && data.recipientId === user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });
      setSocket(newSocket);

      // Load existing messages
      await loadMessages();
      // Mark conversation as read on open
      try {
        await api.post(`/messages/read/${recipientId}`);
      } catch (err) {
        console.error('Failed to mark conversation read', err);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${user.id}`);
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

      const response = await api.post('/messages', messageData);

      // Add message to local state immediately
      setMessages(prev => [...prev, response.data]);

      // Emit via socket
      if (socket) {
        socket.emit('private_message', { to: recipientId, message: response.data });
      }

      setNewMessage('');
      // Stop typing indicator
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || isTyping) return;
    
    setIsTyping(true);
    socket.emit('typing', { recipientId, userId: user.id });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!socket || !isTyping) return;
    
    setIsTyping(false);
    socket.emit('stop_typing', { recipientId, userId: user.id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId._id === user.id || message.senderId === user.id) {
      if (message.readAt) {
        return { icon: CheckCheck, color: 'text-blue-500', label: 'Read' };
      } else if (message.read) {
        return { icon: CheckCheck, color: 'text-gray-400', label: 'Delivered' };
      } else {
        return { icon: Check, color: 'text-gray-400', label: 'Sent' };
      }
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl min-h-[400px] max-h-[90vh] my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{recipientName}</h3>
              {itemTitle && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Re: {itemTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No messages yet</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwnMessage = message.senderId._id === user.id || message.senderId === user.id;
                const status = getMessageStatus(message);
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm sm:text-base">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        isOwnMessage
                          ? 'text-primary-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {status && (
                          <div className={`flex items-center gap-1 ${status.color}`}>
                            <status.icon className="w-3 h-3" />
                            <span className="sr-only">{status.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Typing Indicator */}
              {typingUsers.has(recipientId) && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 rounded-lg max-w-[85%] sm:max-w-xs">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{recipientName} is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}