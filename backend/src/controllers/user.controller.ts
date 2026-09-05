import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../schemas';
import { prisma } from '../db/prisma';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          masterProfile: true,
          favorites: {
            include: {
              master: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
        return;
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);

      // Explicitly protect phone number - never allow phone update via profile endpoint
      const updateData: any = {};
      if (validated.firstName !== undefined) updateData.firstName = validated.firstName;
      if (validated.lastName !== undefined) updateData.lastName = validated.lastName;
      if (validated.age !== undefined) updateData.age = validated.age;
      if (validated.avatarUrl !== undefined) updateData.avatarUrl = validated.avatarUrl;

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        include: {
          masterProfile: true,
        },
      });

      // If user has a master profile, keep first/last name and profile image in sync
      if (updatedUser.masterProfile) {
        await prisma.masterProfile.update({
          where: { id: updatedUser.masterProfile.id },
          data: {
            firstName: validated.firstName || updatedUser.masterProfile.firstName,
            lastName: validated.lastName || updatedUser.masterProfile.lastName,
            profileImageUrl: validated.avatarUrl || updatedUser.masterProfile.profileImageUrl,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profil muvaffaqiyatli yangilandi.',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const masterId = req.params.masterId as string;
      const userId = req.user!.id;

      const existing = await prisma.favorite.findUnique({
        where: {
          userId_masterId: {
            userId,
            masterId,
          },
        },
      });

      if (existing) {
        await prisma.favorite.delete({
          where: { id: existing.id },
        });
        res.status(200).json({ success: true, isFavorite: false, message: 'Saqlanganlardan o\'chirildi.' });
      } else {
        await prisma.favorite.create({
          data: {
            userId,
            masterId,
          },
        });
        res.status(200).json({ success: true, isFavorite: true, message: 'Saqlanganlarga qo\'shildi.' });
      }
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          master: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        favorites: favorites.map((f) => f.master),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
