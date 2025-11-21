  import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { calculateEcoPoints, CARBON_SAVINGS } from '../utils/ecoPoints.js';

// Ensure environment variables are loaded
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// --- EcoPoints helpers ---
// Note: EcoPoints quoting will use the canonical server-side calculation
//   (calculateEcoPoints) and CO₂ savings (CARBON_SAVINGS) so chat replies
//   match exactly what the app actually awards when users post/complete items.

const CATEGORY_KEYWORDS = {
  electronics: ['laptop','phone','tablet','electronics','pc','computer','monitor','camera','printer'],
  furniture: ['sofa','chair','table','bed','desk','couch','furniture','dresser'],
  clothing: ['shirt','jacket','clothes','dress','jeans','clothing','sweater','coat'],
  books: ['book','novel','textbook','magazine','comic'],
  toys: ['toy','lego','doll','action figure','board game'],
  sports: ['bicycle','bike','ball','racket','skateboard','sports','fitness','gym'],
  'home & garden': ['garden','plant','mower','pots','kettle','kitchen','home','appliance']
};

const normalizeText = (s) => (s || '').toLowerCase();

function extractCategoryFromMessage(msg) {
  const text = normalizeText(msg);
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return cat;
    }
  }
  return null;
}

function isPointsQuery(msg) {
  if (!msg) return false;
  const t = normalizeText(msg);
  return /\b(ecopoints|eco points|eco-points|points?)\b/.test(t) || /how many points/.test(t);
}

function capitalize(s) {
  if (!s) return s;
  return s.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function getPointsQuote(category) {
  // If no specific category requested, list the canonical categories and show
  // the points a user would typically get for creating (posting) an item.
  if (!category) {
    const list = Object.keys(CARBON_SAVINGS).map(cat => {
      const pts = calculateEcoPoints(cat, 'create');
      return `• ${cat} → ~${pts} EcoPoints (+~${CARBON_SAVINGS[cat]}kg CO₂ saved)`;
    }).join('\n');

    return `Quick EcoPoints guide (estimates from EcoLoop):\n${list}\n\nAsk with a specific item or category for a tailored quote (e.g. "How many points for a laptop?").`;
  }

  // Find the canonical category key that matches the detected category
  const canonical = Object.keys(CARBON_SAVINGS).find(k => k.toLowerCase() === category.toLowerCase());
  const catLabel = canonical || capitalize(category);
  const createPts = calculateEcoPoints(canonical || catLabel, 'create');
  const completePts = calculateEcoPoints(canonical || catLabel, 'complete');
  const co2 = CARBON_SAVINGS[canonical] ?? CARBON_SAVINGS.Other ?? 5;

  return `Estimate: Posting a ${catLabel} usually earns ~${createPts} EcoPoints (est. ~${co2}kg CO₂ saved). Completing an exchange/sale gives an extra ~${completePts} points. Actual points can vary by condition, completeness, and featured boosts.`;
}


export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    // If the user is asking about EcoPoints (points for posting items), answer directly
    if (isPointsQuery(message)) {
      const category = extractCategoryFromMessage(message);
      const reply = getPointsQuote(category);
      return res.json({ reply });
    }

    if (!genAI) {
      return res.json({ 
        reply: "Hi! I'm EcoBot 🌿. To enable AI features, please add your GEMINI_API_KEY to the backend .env file. You can get a free API key at https://ai.google.dev/" 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are EcoBot 🌿 — EcoLoop's friendly, casual, and knowledgeable sustainability assistant. Think of you as a helpful, chatty guide who explains environmental topics clearly but naturally (like ChatGPT).

  Tone & behaviour:
  - Keep replies warm, conversational and concise by default (1–3 short sentences for greetings or quick questions).
  - For environment or EcoLoop-focused questions, answer with practical, helpful information (roughly 40–120 words). If the user asks for a deeper dive, provide a longer, evidence-informed explanation (up to ~250 words).
  - You can respond to greetings, quick curiosities, and short platform questions in a friendly way. Example: "Hi — I'm EcoBot 🌿. I help with reusing items, sorting categories, and sustainability tips. How can I help today?"
  - If a question is off-topic (politics, medical, legal, or unrelated deep technical subjects), politely decline and redirect to EcoLoop/environmental topics or suggest where they could look.
  - Use emojis sparingly (0–2 per reply) and avoid long monologues unless requested.

  Focus & expertise:
  - Help with item categorization, waste reduction, circular economy, climate and pollution basics, and how EcoLoop's features work.
  - Explain environmental impacts in plain language and connect user actions to real-world benefits (energy, emissions, waste diversion).
  - When relevant, provide specific practical steps users can take and invite them to ask for more detail.

  User message: ${message}

  Produce a friendly, concise, and useful reply focused on EcoLoop and environmental topics. If the user asks you to go deeper, expand with evidence and actionable steps.

  Tone rules for replies:
  - Keep replies short and casual by default. You may add a single, light-hearted or playful sentence at the end (a short joke or friendly quip) but don't be offensive.
  - Immediately after the playful line, add one clear, single sentence that states your main purpose, e.g. "I'm here to help with EcoLoop — reusing items, categorization, eco-tips, and eco-points." Keep that closing sentence factual and offer next steps.
  - If the user asks something off-topic (personal requests, medical, legal, political), politely decline with a short joke or friendly redirection then the same one-line purpose statement.
  - Avoid long-winded, overly technical monologues unless the user explicitly asks for a deep dive.
`;

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
