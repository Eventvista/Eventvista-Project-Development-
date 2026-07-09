// backend/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { 
  getCurrentUser, 
  completeProfile 
} from '../controllers/authController.js';

const router = express.Router();

// Profile completion hook tied to Firebase Auth state
router.post('/complete-profile', verifyFirebaseToken, completeProfile);

// Core infrastructure methods
router.get('/me', protect, getCurrentUser);

export default router;