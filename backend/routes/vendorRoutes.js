// backend/routes/vendorRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createVendor, listVendors, getVendorById } from '../controllers/vendorController.js';

const router = express.Router();

router.get('/', listVendors);
router.get('/:id', getVendorById);
router.post('/', protect, createVendor);

export default router;
