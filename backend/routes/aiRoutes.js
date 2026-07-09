// backend/routes/aiRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { generateLayoutFromPhoto, generateOnboardingSuggestions } from '../controllers/aiController.js';

const router = express.Router();

// 1. Photo layout parsing secured via standard session/auth protection
router.post('/generate-layout', protect, generateLayoutFromPhoto);

// 2. Onboarding context parsing secured via direct Firebase ID token verification
router.post('/onboarding-advisor', verifyFirebaseToken, generateOnboardingSuggestions);

export default router;