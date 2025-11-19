import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';

const router = Router();

// Add item to favorites
router.post('/:itemId', authRequired, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.favorites.includes(itemId)) {
      return res.status(400).json({ message: 'Item already in favorites' });
    }

    user.favorites.push(itemId);
    await user.save();

    res.json({ message: 'Item added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from favorites
router.delete('/:itemId', authRequired, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter(id => id.toString() !== itemId);
    await user.save();

    res.json({ message: 'Item removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's favorite items
router.get('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'favorites',
      populate: { path: 'ownerId', select: 'name' }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if item is favorited
router.get('/check/:itemId', authRequired, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFavorited = user.favorites.includes(itemId);
    res.json({ isFavorited });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
