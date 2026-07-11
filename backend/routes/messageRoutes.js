// backend/routes/messageRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMessagesByEvent, sendMessage } from '../controllers/messageController.js';

const router = express.Router();
router.use(protect);

router.get('/:eventId', getMessagesByEvent);
router.post('/', sendMessage);

export default router;