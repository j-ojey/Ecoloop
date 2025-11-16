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
