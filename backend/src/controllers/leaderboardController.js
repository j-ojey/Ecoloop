import { User } from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().sort({ ecoPoints: -1 }).limit(50).select('name ecoPoints');
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
