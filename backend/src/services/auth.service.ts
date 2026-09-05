import { prisma } from '../db/prisma';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/otp';
import { signToken } from '../utils/jwt';
import { smsService } from './sms.service';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AuthService {
  async requestOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    // Check if an active OTP was requested less than 60 seconds ago (cooldown)
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - recentOtp.createdAt.getTime())) / 1000);
      throw new Error(`Iltimos, yangi SMS so'rashdan oldin ${waitSeconds} soniya kuting.`);
    }

    // Invalidate previous active OTPs for this phone
    await prisma.otpCode.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true },
    });

    // Generate 6 digit OTP
    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes validity

    await prisma.otpCode.create({
      data: {
        phone,
        codeHash,
        expiresAt,
        attempts: 0,
        isUsed: false,
      },
    });

    // Dispatch SMS via provider
    await smsService.sendOtp(phone, otp);

    const result: { success: boolean; message: string; devOtp?: string } = {
      success: true,
      message: 'Tasdiqlash kodi telefoningizga yuborildi.',
    };

    // Include devOtp in development and test mode for easy verification
    if (config.isDev || process.env.NODE_ENV === 'test') {
      result.devOtp = otp;
    }

    return result;
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: any }> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('Tasdiqlash kodi topilmadi yoki muddati o\'tgan. Iltimos, qayta kod so\'rang.');
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new Error('Tasdiqlash kodining muddati tugagan. Iltimos, yangi kod so\'rang.');
    }

    if (otpRecord.attempts >= 5) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new Error('Noto\'g\'ri urinishlar soni ko\'payib ketdi. Yangi kod so\'rang.');
    }

    const isValid = verifyOtpHash(code, otpRecord.codeHash);
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      const remaining = 5 - (otpRecord.attempts + 1);
      throw new Error(`Noto'g'ri kod! Qolgan urinishlar: ${remaining}`);
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Determine initial role: Check if phone matches ADMIN_PHONE
    const isConfigAdmin = phone === config.admin.phone;
    const roleToAssign = isConfigAdmin ? 'ADMIN' : 'USER';

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        masterProfile: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: roleToAssign,
        },
        include: {
          masterProfile: true,
        },
      });
      logger.info(`New user registered: ${phone} (${user.role})`);
    } else if (isConfigAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        include: {
          masterProfile: true,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    return { token, user };
  }

  async adminLogin(secretKey: string, phone?: string): Promise<{ token: string; user: any }> {
    if (secretKey.trim() !== config.admin.secretKey.trim()) {
      throw new Error('Noto\'g\'ri admin maxfiy kaliti yoki paroli.');
    }

    const targetPhone = phone || config.admin.phone;

    let user = await prisma.user.findUnique({
      where: { phone: targetPhone },
      include: { masterProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: targetPhone,
          firstName: 'Admin',
          lastName: 'Sayfulloh',
          role: 'ADMIN',
        },
        include: { masterProfile: true },
      });
    } else if (user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        include: { masterProfile: true },
      });
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: 'ADMIN',
    });

    return { token, user };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        masterProfile: true,
        favorites: {
          select: {
            masterId: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Foydalanuvchi topilmadi.');
    }

    return user;
  }
}

export const authService = new AuthService();
