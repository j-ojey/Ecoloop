import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatModal from '../components/ChatModal.jsx';
import { MessageCircle, Search, User } from 'lucide-react';

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

      // Count unread messages
      if (receiverId === user.id && senderId !== user.id) {
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
    // Mark messages as read
    conversation.unreadCount = 0;
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Start chatting with item owners!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => openConversation(conversation)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?.userId === conversation.userId ? 'bg-primary/10 dark:bg-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.userName}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-block mt-1 px-2 py-1 bg-primary text-white text-xs rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when no conversation selected */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : 'block'}`}>
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
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
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
