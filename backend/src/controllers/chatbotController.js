  import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!genAI) {
      return res.json({ 
        reply: "Hi! I'm EcoBot 🌿. To enable AI features, please add your GEMINI_API_KEY to the backend .env file. You can get a free API key at https://ai.google.dev/" 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are EcoBot 🌿, a friendly and knowledgeable sustainability expert helping users with the EcoLoop platform - a circular economy app for reusing and sharing items.

Your role is to:
- Give practical tips on sustainable living and waste reduction
- Explain how reusing items helps the environment and reduces carbon emissions
- Help categorize items (Electronics, Furniture, Clothing, Books, Toys, Sports, Home & Garden, etc.)
- Answer questions about the circular economy and SDG 12 (Responsible Consumption and Production)
- Encourage users to post items, reuse instead of buying new, and earn eco-points
- Be encouraging, positive, and occasionally use emojis

Keep responses under 150 words, be concise and actionable.

User message: ${message}

Your response:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: "Sorry, I'm having trouble thinking right now 😅 Please try again in a moment!"
    });
  }
};
