import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { storageService } from '../services/storage.service';

export class UploadController {
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Hech qanday rasm yuklanmadi.',
        });
        return;
      }

      const folderType = (req.body.type || 'avatars') as 'avatars' | 'masters' | 'products';
      const fileUrl = await storageService.uploadImage(req.file, folderType);

      res.status(200).json({
        success: true,
        message: 'Rasm muvaffaqiyatli yuklandi.',
        url: fileUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
