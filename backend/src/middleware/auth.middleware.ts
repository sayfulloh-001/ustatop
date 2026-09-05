import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../db/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

const getToken = (req: Request): string | null => {
  // 1. HTTP-only cookie (primary — server-side storage)
  if (req.cookies?.ustatop_token) {
    return req.cookies.ustatop_token;
  }
  // 2. Authorization header fallback (for backward compat / API tools)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = getToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring.",
      });
      return;
    }

    const decoded: JwtPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, phone: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Yaroqsiz yoki muddati o'tgan sessiya.",
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = getToken(req);
    if (token) {
      const decoded: JwtPayload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, phone: true, role: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};
