import { Router } from 'express';
import { createItem, getItems, getItemById, updateItem, deleteItem, getRecommendations } from '../controllers/itemController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.get('/', getItems);
router.get('/recommendations', authRequired, getRecommendations);
router.get('/:id', getItemById);
router.post('/', authRequired, createItem);
router.put('/:id', authRequired, updateItem);
router.delete('/:id', authRequired, deleteItem);
export default router;
