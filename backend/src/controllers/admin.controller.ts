import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { createProductSchema, updateProductSchema } from '../schemas';

export class AdminController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({ success: true, stats });
    } catch (error) {
      next(error);
    }
  }

  async getMasterApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await adminService.getMasterApplications(
        status ? String(status) : undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async approveMaster(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await adminService.approveMaster(id);
      res.status(200).json({
        success: true,
        message: 'Usta arizasi muvaffaqiyatli tasdiqlandi!',
        master: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectMaster(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await adminService.rejectMaster(id);
      res.status(200).json({
        success: true,
        message: 'Usta arizasi rad etildi.',
        master: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, category, page, limit } = req.query;
      const result = await adminService.getAdminProducts(
        query ? String(query) : undefined,
        category ? String(category) : undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await adminService.createProduct(validated);
      res.status(201).json({
        success: true,
        message: 'Mahsulot muvaffaqiyatli yaratildi!',
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateProductSchema.parse(req.body);
      const product = await adminService.updateProduct(id, validated);
      res.status(200).json({
        success: true,
        message: 'Mahsulot muvaffaqiyatli yangilandi!',
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await adminService.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: 'Mahsulot muvaffaqiyatli o\'chirildi!',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAdminUsers(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await adminService.deleteUser(id);
      res.status(200).json({ success: true, message: 'Foydalanuvchi o\'chirildi.' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
