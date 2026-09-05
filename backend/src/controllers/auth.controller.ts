import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { requestOtpSchema, verifyOtpSchema, adminLoginSchema } from '../schemas';
import { AuthRequest } from '../middleware/auth.middleware';

const COOKIE_NAME = 'ustatop_token';
const COOKIE_OPTIONS = {
  httpOnly: true,       // JS cannot access — XSS safe
  sameSite: 'lax' as const,
  secure: false,        // true in production (HTTPS)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

export class AuthController {
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = requestOtpSchema.parse(req.body);
      const result = await authService.requestOtp(validated.phone);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = verifyOtpSchema.parse(req.body);
      const { token, user } = await authService.verifyOtp(validated.phone, validated.code);

      // Set JWT as HTTP-only cookie
      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Muvaffaqiyatli tizimga kirdingiz!',
        user,
        // token is NOT sent in body anymore — it lives in the cookie
      });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = adminLoginSchema.parse(req.body);
      const { token, user } = await authService.adminLogin(validated.secretKey, validated.phone);

      // Set JWT as HTTP-only cookie
      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Admin tizimiga muvaffaqiyatli kirdingiz!',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Avtorizatsiyadan o'tilmagan." });
        return;
      }
      const user = await authService.getMe(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    // Clear the cookie
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.status(200).json({
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqildi.',
    });
  }
}

export const authController = new AuthController();
