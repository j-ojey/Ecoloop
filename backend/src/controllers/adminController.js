import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Message } from '../models/Message.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalMessages = await Message.countDocuments();
    
    // Items by category
    const itemsByCategory = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Items by price type
    const itemsByPriceType = await Item.aggregate([
      { $group: { _id: '$priceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Total eco-points distributed
    const ecoPointsStats = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$ecoPoints' }, avg: { $avg: '$ecoPoints' } } }
    ]);
    
    // Top contributors
    const topContributors = await User.find()
      .sort({ ecoPoints: -1 })
      .limit(5)
      .select('name ecoPoints');
    
    res.json({
      totalUsers,
      totalItems,
      totalMessages,
      itemsByCategory,
      itemsByPriceType,
      ecoPointsStats: ecoPointsStats[0] || { total: 0, avg: 0 },
      topContributors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role ecoPoints suspended createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const updateUserSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    if (typeof suspended !== 'boolean') return res.status(400).json({ message: 'Invalid payload' });
    if (req.user.id === id) return res.status(400).json({ message: 'You cannot modify your own suspension' });
    const targetUser = await User.findById(id).select('role');
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (targetUser.role === 'admin') return res.status(400).json({ message: 'Cannot suspend another admin' });
    const user = await User.findByIdAndUpdate(id, { suspended }, { new: true }).select('name email role ecoPoints suspended createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (req.user.id === id) return res.status(400).json({ message: 'You cannot change your own role' });
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('name email role ecoPoints suspended createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
