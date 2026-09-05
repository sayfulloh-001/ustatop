import rateLimit from 'express-rate-limit';

export const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 OTP requests per 5 minutes per IP
  message: {
    success: false,
    message: 'SMS so\'rovlari soni oshib ketdi. Iltimos, 5 daqiqadan so\'ng qayta urinib ko\'ring.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // max 10 verification attempts per IP
  message: {
    success: false,
    message: 'Ko\'p xato urinishlar qilindi. Iltimos, keyinroq qayta urinib ko\'ring.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
