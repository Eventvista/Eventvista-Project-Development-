// backend/routes/userRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { 
  getCurrentUser, 
  getAllUsers,
  updateUserRole 
} from '../controllers/userController.js';
import { completeProfile } from '../controllers/authController.js';

const router = express.Router();

// Profile completion hook tied to Firebase Auth state
router.post('/complete-profile', verifyFirebaseToken, completeProfile);

// Core infrastructure methods
router.get('/me', protect, getCurrentUser);

// Admin-restricted routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/role', protect, authorize('admin'), updateUserRole);

export default router;