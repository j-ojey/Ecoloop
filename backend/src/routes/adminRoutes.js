import { Router } from 'express';
import { getStats, getUsers, updateUserSuspension, updateUserRole } from '../controllers/adminController.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = Router();
router.get('/stats', authRequired, adminRequired, getStats);
router.get('/users', authRequired, adminRequired, getUsers);
router.patch('/users/:id/suspend', authRequired, adminRequired, updateUserSuspension);
router.patch('/users/:id/role', authRequired, adminRequired, updateUserRole);

export default router;
