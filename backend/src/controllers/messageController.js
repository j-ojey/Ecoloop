import { Message } from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, itemId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: 'Missing fields' });
    const message = await Message.create({ senderId: req.user.id, receiverId, itemId, content, read: false });
    
    // Populate the message before sending via socket and response
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .populate('itemId', 'title');
    
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('private_message', populatedMessage);
    }
    res.status(201).json(populatedMessage);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getMessagesForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .populate('itemId', 'title');
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({ receiverId: userId, read: { $ne: true } });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    if (!otherUserId) return res.status(400).json({ message: 'Missing otherUserId' });
    await Message.updateMany({ senderId: otherUserId, receiverId: userId, read: { $ne: true } }, { $set: { read: true, readAt: new Date() } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Message.updateMany({ receiverId: userId, read: { $ne: true } }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
