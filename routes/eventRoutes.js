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
router.route('/').post(createEvent).get(getMyEvents);
router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent);

export default router;
