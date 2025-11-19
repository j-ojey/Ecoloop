import { Router } from 'express';
import { sendMessage, getMessagesForUser, getUnreadCount, markConversationRead, markAllRead } from '../controllers/messageController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/', authRequired, sendMessage);
router.get('/:userId', authRequired, getMessagesForUser);
router.get('/', authRequired, getUnreadCount); // GET /api/messages -> { count }
router.post('/read/:otherUserId', authRequired, markConversationRead);
router.post('/read', authRequired, markAllRead);
export default router;
