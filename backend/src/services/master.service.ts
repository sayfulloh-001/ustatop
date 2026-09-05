import { prisma } from '../db/prisma';
import { paymentService } from './payment.service';

export interface GetMastersFilter {
  query?: string;
  profession?: string;
  city?: string;
  minExperience?: number;
  page?: number;
  limit?: number;
}

export class MasterService {
  async getApprovedMasters(filter: GetMastersFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(50, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
    };

    if (filter.profession && filter.profession !== 'Barchasi') {
      where.profession = {
        contains: filter.profession,
      };
    }

    if (filter.city && filter.city !== 'Barchasi') {
      where.city = {
        contains: filter.city,
      };
    }

    if (filter.minExperience) {
      where.experienceYears = {
        gte: Number(filter.minExperience),
      };
    }

    if (filter.query && filter.query.trim() !== '') {
      const q = filter.query.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { profession: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { district: { contains: q } },
      ];
    }

    const [masters, total] = await Promise.all([
      prisma.masterProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
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

  async getMasterById(id: string, requesterUserId?: string, requesterRole?: string) {
    const master = await prisma.masterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!master) {
      throw new Error('Usta topilmadi.');
    }

    // Security & Visibility check:
    // If master is not APPROVED, only the master owner or ADMIN can view it
    if (master.status !== 'APPROVED') {
      const isOwner = requesterUserId && master.userId === requesterUserId;
      const isAdmin = requesterRole === 'ADMIN';
      if (!isOwner && !isAdmin) {
        throw new Error('Ushbu usta profili hali tasdiqlanmagan yoki faol emas.');
      }
    }

    return master;
  }

  async applyForMaster(userId: string, data: {
    firstName: string;
    lastName: string;
    profession: string;
    experienceYears: number;
    age: number;
    description: string;
    city: string;
    district?: string | null;
    telegramUsername?: string | null;
    profileImageUrl?: string | null;
  }) {
    // ── To'lov tekshiruvi ──
    // Agar Payme .env da to'liq sozlangan bo'lsa VA foydalanuvchi hali to'lamagan bo'lsa — xato
    // Agar Payme sozlanmagan bo'lsa — hasPaid() true qaytaradi, to'lovsiz o'tadi
    const alreadyHasMaster = await prisma.masterProfile.findUnique({ where: { userId } });
    if (!alreadyHasMaster) {
      const hasPaid = await paymentService.hasPaid(userId);
      if (!hasPaid) {
        throw new Error(
          "Usta bo'lish uchun avval to'lov qilishingiz zarur. Iltimos, to'lov sahifasiga o'ting."
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { masterProfile: true },
    });

    if (!user) {
      throw new Error('Foydalanuvchi topilmadi.');
    }

    const phone = user.phone;
    let masterProfile;

    if (user.masterProfile) {
      masterProfile = await prisma.masterProfile.update({
        where: { id: user.masterProfile.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          profession: data.profession,
          experienceYears: data.experienceYears,
          age: data.age,
          description: data.description,
          city: data.city,
          district: data.district,
          telegramUsername: data.telegramUsername || null,
          profileImageUrl: data.profileImageUrl || user.masterProfile.profileImageUrl || user.avatarUrl,
          phone,
          status: 'APPROVED',
        },
      });
    } else {
      masterProfile = await prisma.masterProfile.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          profession: data.profession,
          experienceYears: data.experienceYears,
          age: data.age,
          description: data.description,
          city: data.city,
          district: data.district,
          telegramUsername: data.telegramUsername || null,
          profileImageUrl: data.profileImageUrl || user.avatarUrl,
          phone,
          status: 'APPROVED',
        },
      });
    }

    // Also sync user's firstName/lastName/avatar if empty
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: user.firstName || data.firstName,
        lastName: user.lastName || data.lastName,
        avatarUrl: user.avatarUrl || data.profileImageUrl,
      },
    });

    return masterProfile;
  }

  async getMyStatus(userId: string) {
    const profile = await prisma.masterProfile.findUnique({
      where: { userId },
    });

    return {
      hasApplied: !!profile,
      status: profile ? profile.status : 'NONE',
      profile,
    };
  }
}

export const masterService = new MasterService();

