import { Message } from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, itemId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: 'Missing fields' });
    const message = await Message.create({ senderId: req.user.id, receiverId, itemId, content });
    const io = req.app.get('io');
    if (io) io.to(receiverId).emit('private_message', message);
    res.status(201).json(message);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getMessagesForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const messages = await Message.find({ $or: [ { senderId: userId }, { receiverId: userId } ] }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
