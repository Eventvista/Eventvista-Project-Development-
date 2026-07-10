// backend/routes/adminRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getSystemMetrics } from '../controllers/adminController.js';

const router = express.Router();

// Enforce admin boundary on all routes within this registry
router.use(protect, authorize('admin'));

router.get('/metrics', getSystemMetrics);

export default router;