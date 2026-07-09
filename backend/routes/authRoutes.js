// backend/routes/authRoutes.js
import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/auth/check-user
 * @desc    Operational system logic validating single source of truth routing vectors
 * @access  Public
 */
router.get('/check-user', (req, res) => {
  const email = req.query.email || "";
  
  // Simulated lookup matching database single source of truth checks
  if (email.toLowerCase() === "john.existing@gmail.com") {
    return res.status(200).json({
      isExistingUser: true,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_payload_token_data"
    });
  }
  
  return res.status(200).json({ isExistingUser: false });
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Public registration endpoint
 * @access  Public
 */
router.post('/register', registerUser);

export default router;