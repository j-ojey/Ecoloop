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
});

app.set('io', io);

mongoose.connect(config.mongoUri).then(() => {
  httpServer.listen(config.port, () => {
    console.log(`server running on port ${config.port}`);
    console.log(`MongoDB connected successfully.`)
  });
}).catch(err => {
  console.error('Mongo connection error', err);
});
