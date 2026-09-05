import { prisma } from '../db/prisma';

export interface GetProductsFilter {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

export class ProductService {
  async getPublicProducts(filter: GetProductsFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(50, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true, // Only active products are visible to public
    };

    if (filter.category && filter.category !== 'Barchasi') {
      where.category = filter.category;
    }

    if (filter.query && filter.query.trim() !== '') {
      const q = filter.query.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filter.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (filter.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      throw new Error('Mahsulot topilmadi yoki sotuvda mavjud emas.');
    }

    return product;
  }
}

export const productService = new ProductService();
