import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class PaymentController {
  /**
   * GET /api/payment/status
   * Foydalanuvchining to'lov holati va Payme URL
   */
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = await paymentService.getPaymentStatus(req.user!.id);
      res.status(200).json({ success: true, ...status });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/payme
   * Payme serveri chaqiradi — JSON-RPC webhook
   * Basic Auth: "Paycom:<SECRET_KEY>"
   */
  async paymeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const result = await paymentService.handlePaymeRequest(req.body, authHeader);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
