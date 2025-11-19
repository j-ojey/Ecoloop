import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatModal from '../components/ChatModal.jsx';
import { MessageCircle, Search, User, Check, CheckCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Messages() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const socket = useMemo(() => io(API_BASE, { auth: { token } }), [token]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit('join', user.id);
    socket.on('private_message', (msg) => {
      setMessages(prev => [msg, ...prev]);
    });
    return () => { socket.disconnect(); };
  }, [socket, user]);

  useEffect(() => {
    loadMessages();
  }, [user, token]);

  useEffect(() => {
    // Group messages into conversations
    const conversationMap = new Map();

    messages.forEach(message => {
      const senderId = message.senderId._id || message.senderId;
      const receiverId = message.receiverId._id || message.receiverId;
      const otherUserId = senderId === user.id ? receiverId : senderId;
      const otherUserName = senderId === user.id ? (message.receiverId.name || 'Recipient') : (message.senderId.name || 'Sender');

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUserName,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }

      const conversation = conversationMap.get(otherUserId);
      conversation.messages.push(message);

      // Count unread messages based on server-side read flag
      if (receiverId === user.id && message.read !== true) {
        conversation.unreadCount++;
      }

      // Update last message if this is more recent
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }
    });

    const conversationList = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    setConversations(conversationList);
  }, [messages, user.id]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/api/messages/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
    // Mark messages as read on server and reset local count
    api.post(`/api/messages/read/${conversation.userId}`)
      .catch(() => {})
      .finally(() => {
        conversation.unreadCount = 0;
        // Optimistically update local messages read flag
        setMessages(prev => prev.map(m => {
          const senderId = m.senderId._id || m.senderId;
          const receiverId = m.receiverId._id || m.receiverId;
          if (senderId === conversation.userId && receiverId === user.id) {
            return { ...m, read: true, readAt: new Date() };
          }
          return m;
        }));
      });
  };

  const getMessageStatus = (message) => {
    if (message.senderId._id === user.id || message.senderId === user.id) {
      if (message.readAt) {
        return { icon: CheckCheck, color: 'text-blue-500' };
      } else if (message.read) {
        return { icon: CheckCheck, color: 'text-gray-400' };
      } else {
        return { icon: Check, color: 'text-gray-400' };
      }
    }
    return null;
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 dark:text-white">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[500px] sm:h-[600px] lg:h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 card order-2 lg:order-1">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No conversations yet</p>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Start chatting with item owners!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const status = getMessageStatus(conversation.lastMessage);
                return (
                  <div
                    key={conversation.userId}
                    onClick={() => openConversation(conversation)}
                    className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedConversation?.userId === conversation.userId ? 'bg-primary/10 dark:bg-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                            {conversation.userName}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                            </span>
                            {status && <status.icon className={`w-3 h-3 ${status.color}`} />}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-2">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded-full flex-shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when no conversation selected */}
        <div className={`lg:col-span-2 order-1 lg:order-2 ${!selectedConversation ? 'hidden lg:block' : 'block'}`}>
          {selectedConversation ? (
            <ChatModal
              isOpen={showChat}
              onClose={() => {
                setShowChat(false);
                setSelectedConversation(null);
              }}
              recipientId={selectedConversation.userId}
              recipientName={selectedConversation.userName}
              itemId={null}
              itemTitle={null}
            />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center px-4">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
