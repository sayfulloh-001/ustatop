import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Unhandled Error:', err);

  if (err instanceof ZodError) {
    const issues = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: issues[0]?.message || 'Kiritilgan ma\'lumotlarda xatolik bor.',
      errors: issues,
    });
    return;
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'Fayl hajmi 5MB dan oshmasligi kerak.',
      });
      return;
    }
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Serverda ichki xatolik yuz berdi. Qayta urinib ko\'ring.',
  });
};
