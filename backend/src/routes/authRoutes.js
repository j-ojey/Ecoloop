import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateProfile);

export default router;
