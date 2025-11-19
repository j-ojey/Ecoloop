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

    const systemPrompt = `You are EcoBot 🌿, a concise sustainability assistant for EcoLoop - a platform for reusing and sharing items.

Guidelines:
- Keep responses under 80 words, be direct and actionable
- Use bullet points for lists (max 3 items)
- Answer in 1-2 short paragraphs maximum
- Skip pleasantries, get straight to the answer
- Use minimal emojis (max 2 per response)
- Focus on practical, specific advice

Topics you help with:
- Item categorization (Electronics, Furniture, Clothing, Books, Toys, Sports, Home & Garden)
- Waste reduction and sustainability tips
- How reusing helps the environment
- Circular economy basics
- EcoLoop platform features

User: ${message}

Brief, direct response:`;

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
