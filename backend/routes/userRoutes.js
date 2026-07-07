// backend/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User registration, login, and session identity endpoints.
 */

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: >
 *       Creates a new user account. The password is hashed with bcrypt before
 *       storage (see models/User.js pre-save hook) and a signed JWT is
 *       returned immediately so the client can authenticate subsequent
 *       requests without a separate login call.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ada Lovelace
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@eventvista.test
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SuperSecure123
 *               role:
 *                 type: string
 *                 enum: [organiser, vendor, admin]
 *                 default: organiser
 *     responses:
 *       201:
 *         description: User created successfully; returns the public user profile and a JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       409:
 *         description: A user with this email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation failed (e.g. password too short, invalid email format).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerUser);

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Authenticate an existing user
 *     description: >
 *       Verifies the supplied email/password against the stored bcrypt hash
 *       and, on success, returns a signed JWT valid for the duration set by
 *       JWT_EXPIRES_IN (default 7 days).
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@eventvista.test
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SuperSecure123
 *     responses:
 *       200:
 *         description: Login successful; returns the public user profile and a fresh JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginUser);

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     description: >
 *       Returns the profile of the user identified by the Bearer JWT sent in
 *       the Authorization header. Used by clients to verify a stored token
 *       is still valid and to hydrate the logged-in user's session state.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user's profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/UserPublic' }
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', protect, getCurrentUser);

export default router;
