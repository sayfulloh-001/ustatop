import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);
router.get('/favorites', authenticate, userController.getFavorites);
router.post('/favorites/:masterId', authenticate, userController.toggleFavorite);

export default router;
