import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/request-otp', otpRequestLimiter, authController.requestOtp);
router.post('/verify-otp', otpVerifyLimiter, authController.verifyOtp);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

export default router;
