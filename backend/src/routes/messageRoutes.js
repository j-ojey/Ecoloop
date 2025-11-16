import { Router } from 'express';
import { sendMessage, getMessagesForUser } from '../controllers/messageController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/', authRequired, sendMessage);
router.get('/:userId', authRequired, getMessagesForUser);
export default router;
