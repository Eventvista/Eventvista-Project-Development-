// backend/routes/eventRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * tags:
 *   name: Events
 *   description: CRUD operations for event management. All routes require a Bearer JWT.
 */

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Creates an event owned by the authenticated user (organiser is set automatically from the JWT).
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateRequest'
 *     responses:
 *       201:
 *         description: Event created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Validation failed (e.g. missing title, date, or guestCount).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: List all events owned by the authenticated user
 *     description: Returns every event where organiser matches the authenticated user, with the linked Layout populated.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's events.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 2 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Event' }
 *       401:
 *         description: Missing or invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/').post(createEvent).get(getMyEvents);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get a single event by id
 *     description: Returns one event with its linked Layout and bookedVendors populated. Not restricted to the owner (read access is open to any authenticated user).
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 665f1c2e8a1b2c3d4e5f6a7b
 *     responses:
 *       200:
 *         description: The requested event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: The supplied id is not a valid MongoDB ObjectId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No event found with this id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update an event
 *     description: Updates fields on an event. Only the organiser who created the event may update it.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 665f1c2e8a1b2c3d4e5f6a7b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdateRequest'
 *     responses:
 *       200:
 *         description: Event updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: The supplied id is not a valid MongoDB ObjectId, or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found, or you do not have permission to edit it.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete an event
 *     description: Permanently deletes an event. Only the organiser who created it may delete it.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 665f1c2e8a1b2c3d4e5f6a7b
 *     responses:
 *       200:
 *         description: Event deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Event deleted successfully. }
 *       400:
 *         description: The supplied id is not a valid MongoDB ObjectId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found, or you do not have permission to delete it.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent);

export default router;
