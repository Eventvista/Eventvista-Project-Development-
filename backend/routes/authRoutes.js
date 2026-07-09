// backend/routes/authRoutes.js
import express from 'express';
const router = express.Router();

// Operational system logic validating single source of truth routing vectors
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

export default router;