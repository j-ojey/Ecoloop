import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateProfile);

// Find user by email (for marking transaction recipients)
router.get('/find-by-email/:email', authRequired, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() }).select('_id name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
