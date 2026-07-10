// backend/routes/aiRoutes.js
/**
 * @file backend/routes/aiRoutes.js
 * @description AI Pipeline Routing Registry for Eventvista. 
 * Orchestrates endpoints for 3D layout conversion, conversational onboarding parsing, 
 * and automated advisory plan compilation. Uses a deliberate dual-layer authentication topology[cite: 1, 4].
 */

import express from 'express';

// =========================================================================
// SECTION 1: SECURITY MIDDLEWARE IMPORTS
// =========================================================================

// Standard Session Guard: Verifies the application's internal JWT. Used for active, onboarded users[cite: 1, 4].
import { protect } from '../middleware/authMiddleware.js';

// Identity Provider Guard: Decodes raw Firebase ID tokens directly. Used for users lacking a MongoDB record[cite: 1, 4].
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';

// =========================================================================
// SECTION 2: CONTROLLER ACTIONS IMPORTS
// =========================================================================
import {
  generateLayoutFromPhoto,
  generateOnboardingSuggestions,
  generateAdvisoryPlan, // FIX: Newly imported to handle real multi-variant LLM prompt generation[cite: 1].
} from '../controllers/aiController.js';

const router = express.Router();

// =========================================================================
// SECTION 3: ROUTE DEFINITIONS & ACCESS POLICIES
// =========================================================================

/**
 * @route   POST /api/v1/ai/generate-layout
 * @desc    Ingests a floorplan image and processes it through the Trellis 3D mesh engine and Groq spatial parser[cite: 4].
 * @access  Private (Regulated via Internal App JWT)
 * @security protect
 * @rationale Operates directly on an existing event instance linked to an onboarded account.
 *            The application JWT ensures tenant isolation and ownership matching[cite: 1].
 */
router.post('/generate-layout', protect, generateLayoutFromPhoto);

/**
 * @route   POST /api/v1/ai/onboarding-advisor
 * @desc    Converts open-ended conversational terminal statements into formal schema initialization data[cite: 4].
 * @access  Private (Regulated via External Firebase ID Token)
 * @security verifyFirebaseToken
 * @rationale This endpoint runs *before* a profile entry exists in MongoDB during first-time social sign-in[cite: 1].
 *            Using verifyFirebaseToken allows un-onboarded identities to securely call the AI engine[cite: 1].
 */
router.post('/onboarding-advisor', verifyFirebaseToken, generateOnboardingSuggestions);

/**
 * @route   POST /api/v1/ai/advisor-plan
 * @desc    FIX: Resolves Bug #13 by establishing a live endpoint for the Designer and Reports panels[cite: 1].
 *          Generates comprehensive Markdown plans based on event metrics and saves them to MongoDB[cite: 1].
 * @access  Private (Regulated via Internal App JWT)
 * @security protect
 * @rationale Evaluates live, sensitive database values (budgets, counts) tied to an established event ID[cite: 1].
 */
router.post('/advisor-plan', protect, generateAdvisoryPlan);

export default router;