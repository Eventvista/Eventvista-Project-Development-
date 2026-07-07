// backend/routes/assetRoutes.js
import express from 'express';
import multer from 'multer';
import { create3DAsset } from '../controllers/assetController.js';

const router = express.Router();
const upload = multer(); // Keeps file in memory buffers (req.file.buffer)

// POST /api/assets/generate-3d
router.post('/generate-3d', upload.single('image'), create3DAsset);

export default router;