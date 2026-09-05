import { prisma } from '../db/prisma';

export class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalMasters,
      pendingMasters,
      approvedMasters,
      rejectedMasters,
      totalProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.masterProfile.count(),
      prisma.masterProfile.count({ where: { status: 'PENDING' } }),
      prisma.masterProfile.count({ where: { status: 'APPROVED' } }),
      prisma.masterProfile.count({ where: { status: 'REJECTED' } }),
      prisma.product.count(),
    ]);

    return {
      totalUsers,
      totalMasters,
      pendingMasters,
      approvedMasters,
      rejectedMasters,
      totalProducts,
    };
  }

  async getMasterApplications(status?: string, page: number = 1, limit: number = 20) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [masters, total] = await Promise.all([
      prisma.masterProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.masterProfile.count({ where }),
    ]);

    return {
      masters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveMaster(id: string) {
    const master = await prisma.masterProfile.findUnique({ where: { id } });
    if (!master) {
      throw new Error('Usta arizasi topilmadi.');
    }

    return prisma.masterProfile.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async rejectMaster(id: string) {
    const master = await prisma.masterProfile.findUnique({ where: { id } });
    if (!master) {
      throw new Error('Usta arizasi topilmadi.');
    }

    return prisma.masterProfile.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async getAdminProducts(query?: string, category?: string, page: number = 1, limit: number = 20) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};

    if (category && category !== 'Barchasi') {
      where.category = category;
    }

    if (query && query.trim() !== '') {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    stock?: number;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        stock: data.stock !== undefined ? data.stock : 100,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Mahsulot topilmadi.');
    }

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Mahsulot topilmadi.');
    }

    await prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async getAdminUsers(page: number = 1, limit: number = 20) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          masterProfile: {
            select: {
              id: true,
              profession: true,
              status: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteUser(userId: string) {
    // Cannot delete ADMIN accounts
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Foydalanuvchi topilmadi.');
    if (user.role === 'ADMIN') throw new Error('Admin hisobini o\'chirib bo\'lmaydi.');
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}

export const adminService = new AdminService();
