import { Request, Response, NextFunction } from 'express';
import { masterService } from '../services/master.service';
import { masterApplicationSchema } from '../schemas';
import { AuthRequest } from '../middleware/auth.middleware';

export class MasterController {
  async getMasters(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, profession, city, minExperience, page, limit } = req.query;
      const result = await masterService.getApprovedMasters({
        query: query ? String(query) : undefined,
        profession: profession ? String(profession) : undefined,
        city: city ? String(city) : undefined,
        minExperience: minExperience ? Number(minExperience) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMasterById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const requesterUserId = req.user?.id;
      const requesterRole = req.user?.role;

      const master = await masterService.getMasterById(id, requesterUserId, requesterRole);

      res.status(200).json({
        success: true,
        master,
      });
    } catch (error) {
      next(error);
    }
  }

  async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = masterApplicationSchema.parse(req.body);
      const masterProfile = await masterService.applyForMaster(req.user!.id, validated);

      res.status(201).json({
        success: true,
        message: 'Arizangiz muvaffaqiyatli qabul qilindi va admin ko\'rib chiqishi uchun yuborildi.',
        masterProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = await masterService.getMyStatus(req.user!.id);
      res.status(200).json({
        success: true,
        ...status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const masterController = new MasterController();
