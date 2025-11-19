import { User } from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get top 20 users
    const topUsers = await User.find().sort({ ecoPoints: -1 }).limit(20).select('name ecoPoints');
    
    // Find current user's position if they're logged in
    let currentUserPosition = null;
    if (userId) {
      const currentUser = await User.findById(userId).select('name ecoPoints');
      if (currentUser) {
        // Count how many users have more points
        const rank = await User.countDocuments({ ecoPoints: { $gt: currentUser.ecoPoints } }) + 1;
        
        // Check if user is already in top 20
        const inTop20 = topUsers.some(u => u._id.toString() === userId);
        
        if (!inTop20) {
          currentUserPosition = {
            rank,
            user: currentUser
          };
        }
      }
    }
    
    res.json({ topUsers, currentUserPosition });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
