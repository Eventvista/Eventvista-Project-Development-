// backend/routes/notificationRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;