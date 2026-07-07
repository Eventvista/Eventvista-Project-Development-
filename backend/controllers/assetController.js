import { generate3DAssetFromImage } from '../services/huggingFaceService.js';

/**
 * Route controller for handling 3D asset generation requests
 */
export const create3DAsset = async (req, res) => {
  try {
    // Assuming you use middleware like 'multer' to handle image uploads
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    // Call the service layer
    const glbBuffer = await generate3DAssetFromImage(req.file.buffer);

    // Send the binary 3D file (.glb) back to the client/frontend
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', 'attachment; filename="model.glb"');
    return res.send(glbBuffer);

  } catch (error) {
    console.error('[Asset Controller Error]:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate 3D asset.', 
      error: error.message 
    });
  }
};