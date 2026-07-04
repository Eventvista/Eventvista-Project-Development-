import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import validateLayout from '../middleware/validateLayout.js';
import {
  createLayout,
  getLayoutByEvent,
  updateLayout,
  deleteLayout,
} from '../controllers/layoutController.js';

const router = express.Router();

router.use(protect);

router.post('/', validateLayout, createLayout);
router.get('/:eventId', getLayoutByEvent);
router.put('/:id', validateLayout, updateLayout);
router.delete('/:id', deleteLayout);

export default router;
