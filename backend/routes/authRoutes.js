// backend/routes/authRoutes.js
/**
 * @file backend/routes/authRoutes.js
 * @description Authentication Router Registry for Eventvista.
 * Governs identity check-ins, native registration flows, and user sign-in endpoints.
 * Operates as the entry gateway for the platform's Single Source of Truth (SSOT) auth handshake[cite: 1].
 */

import express from 'express';

// =========================================================================
// SECTION 1: SECURITY MIDDLEWARE IMPORTS
// =========================================================================

// Decodes and validates cryptographically signed Firebase ID tokens[cite: 1, 5]
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';

// =========================================================================
// SECTION 2: AUTH CONTROLLER ACTIONS IMPORTS
// =========================================================================
import {
  verifyTokenHandler,
  registerUser, // FIX: Imported to handle traditional email/password profile onboarding[cite: 1].
  loginUser,    // FIX: Imported to allow native password evaluation against MongoDB hash records[cite: 1].
} from '../controllers/authController.js';

const router = express.Router();

// =========================================================================
// SECTION 3: ROUTE DEFINITIONS & SECURITY POLICIES
// =========================================================================

/**
 * @route   POST /api/v1/auth/session-verify
 * @desc    SSOT Identity Bridge[cite: 1]. Exchanges a validated Firebase ID token for either an 
 *          internal app-level JWT + local user details, or an onboarding indicator (`isNewUser: true`) 
 *          directing the client to complete their profile setup[cite: 1].
 * @access  Private (Regulated via External Firebase ID Token)[cite: 1, 5]
 * @security verifyFirebaseToken
 */
router.post('/session-verify', verifyFirebaseToken, verifyTokenHandler);

/**
 * @route   POST /api/v1/auth/register
 * @desc    FIX: Resolves Bug #3 by opening a dedicated routing path for native signups[cite: 1].
 *          Saves user info to MongoDB and provisions an identity duplicate inside Firebase Admin[cite: 1].
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    FIX: Resolves Bug #3 by exposing a route for traditional native credential checks[cite: 1].
 *          Queries MongoDB user entries and returns an internal app-level JWT on password confirmation[cite: 1].
 * @access  Public
 */
router.post('/login', loginUser);

export default router;