// backend/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  verifyTokenHandler, 
  completeProfile 
} from '../controllers/authController.js';

const router = express.Router();

// Real-time integration hooks
router.post('/verify', verifyFirebaseToken, verifyTokenHandler);
router.post('/complete-profile', verifyFirebaseToken, completeProfile);

// Core infrastructure methods
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

export default router;