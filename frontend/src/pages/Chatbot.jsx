import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api.js';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: "Hi! I'm EcoBot 🌿, your sustainability buddy! Ask me about:\n\n- Reducing waste and living sustainably\n- How reusing items helps the planet\n- Tips for categorizing items\n- Understanding the circular economy\n- Anything about EcoLoop!\n\nHow can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.status === 503 
        ? "⚠️ **AI Service Not Configured**\n\nThe chatbot requires a Google Gemini API key to work. Please ask your administrator to add `GEMINI_API_KEY` to the backend `.env` file.\n\nGet a free key at [ai.google.dev](https://ai.google.dev/)" 
        : "Sorry, I'm having trouble connecting right now. Please try again! 😅";
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: errorMsg
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How does reusing items help the environment?",
    "What category should I use for a laptop?",
    "Give me tips for sustainable living",
    "What is the circular economy?"
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-4">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white dark:text-white flex flex-wrap items-center gap-2">
          🌿 EcoBot <span className="text-sm sm:text-base font-normal text-gray-300 dark:text-gray-400">AI Sustainability Assistant</span>
        </h1>
        <p className="text-gray-300 dark:text-gray-400">Get expert advice on sustainability and the circular economy</p>
      </div>

      {/* Quick Prompts */}
      <div className="mb-6 flex flex-wrap gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            className="text-xs sm:text-sm px-3 py-2 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-gray-200 rounded-full transition-all shadow-sm"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 shadow-2xl flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '400px', maxHeight: '600px' }}>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-900/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gray-700 dark:bg-gray-700 text-gray-100 dark:text-gray-100'
              }`}>
                <div className="text-sm whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t-2 border-gray-700 p-4 bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about sustainability..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-primary px-4 sm:px-6" 
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Ask about waste reduction, item categories, or environmental impact!
          </p>
        </form>
      </div>

    </div>
  );
}
