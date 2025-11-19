import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { signUpload } from './utils/cloudinary.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.post('/api/uploads/signature', (req, res) => {
  try {
    const data = signUpload();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'Cloudinary error', error: e.message });
  }
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  socket.on('private_message', ({ to, message }) => {
    io.to(to).emit('private_message', message);
  });
  socket.on('typing', ({ recipientId, userId }) => {
    socket.to(recipientId).emit('typing', { userId, recipientId });
  });
  socket.on('stop_typing', ({ recipientId, userId }) => {
    socket.to(recipientId).emit('stop_typing', { userId, recipientId });
  });
});

app.set('io', io);

// If the URI points to a cluster or uses SRV without a default DB path, append '/ecoloop' so we don't connect to the 'test' DB by accident.
let mongoUriToUse = config.mongoUri;
try {
  const uri = new URL(config.mongoUri.includes('mongodb+srv://') ? config.mongoUri.replace('mongodb+srv://', 'http://') : config.mongoUri.replace('mongodb://', 'http://'));
  const path = uri.pathname && uri.pathname !== '/' ? uri.pathname : '';
  if (!path) {
    console.warn('⚠️ MONGO_URI does not specify a DB name — defaulting to use /ecoloop to avoid writing to the `test` DB.');
    // Append 'ecoloop' DB name — use the original scheme prefix (+srv) if provided.
    const prefix = config.mongoUri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
    const suffix = config.mongoUri.split(prefix)[1];
    // If there are any query params, put them after '/ecoloop'
    const parts = suffix.split('?');
    mongoUriToUse = `${prefix}${parts[0]}/ecoloop${parts[1] ? `?${parts[1]}` : ''}`;
  }
} catch (e) {
  // If parsing fails, don't modify the URI — just use what's provided.
  mongoUriToUse = config.mongoUri;
}

mongoose.connect(mongoUriToUse).then(() => {
  httpServer.listen(config.port, () => {
    console.log(`server running on port ${config.port}`);
    try {
      const dbName = new URL(mongoUriToUse.includes('mongodb+srv://') ? mongoUriToUse.replace('mongodb+srv://', 'http://') : mongoUriToUse.replace('mongodb://', 'http://')).pathname.replace('/', '') || 'ecoloop';
      console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (e) {
      // ignore
    }
  });
}).catch(err => {
  console.error('Mongo connection error'