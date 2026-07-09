// backend/routes/authRoutes.js
import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { verifyTokenHandler } from '../controllers/authController.js';

const router = express.Router();

// Enforce SSOT validation using the unified identity hook
router.post('/session-verify', verifyFirebaseToken, verifyTokenHandler);

export default router;