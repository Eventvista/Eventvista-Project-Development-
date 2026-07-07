// backend/routes/aiRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateLayoutFromPhoto } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);
router.post('/generate-layout', generateLayoutFromPhoto);

export default router;
