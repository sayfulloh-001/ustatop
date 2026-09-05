import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, category, sortBy, page, limit } = req.query;
      const result = await productService.getPublicProducts({
        query: query ? String(query) : undefined,
        category: category ? String(category) : undefined,
        sortBy: sortBy as any,
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

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.getProductById(id);

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
