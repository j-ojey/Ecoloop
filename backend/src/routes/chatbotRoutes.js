import { Router } from 'express';
import { chat } from '../controllers/chatbotController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/chat', authRequired, chat);

export default router;
