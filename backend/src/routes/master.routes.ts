import { Router } from 'express';
import { masterController } from '../controllers/master.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', masterController.getMasters);
router.get('/my-status', authenticate, masterController.getMyStatus);
router.get('/:id', optionalAuth, masterController.getMasterById);
router.post('/apply', authenticate, masterController.apply);

export default router;
