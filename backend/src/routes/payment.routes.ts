import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Foydalanuvchi to'lov holati (login talab)
router.get('/status', authenticate, paymentController.getStatus);

// Payme JSON-RPC webhook (Payme serveri chaqiradi — ochiq endpoint)
router.post('/payme', paymentController.paymeWebhook);

export default router;
