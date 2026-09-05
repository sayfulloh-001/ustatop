import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingleImage } from '../middleware/upload.middleware';

const router = Router();

// Allow authenticated users (for avatars/master application photos) and admins (for products) to upload images
router.post('/image', authenticate, uploadSingleImage, uploadController.uploadImage);

export default router;
