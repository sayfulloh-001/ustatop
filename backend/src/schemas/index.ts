import { z } from 'zod';

export const phoneRegex = /^\+998[0-9]{9}$/;

export const requestOtpSchema = z.object({
  phone: z
    .string({ required_error: 'Telefon raqamini kiritish shart' })
    .regex(phoneRegex, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string({ required_error: 'Telefon raqamini kiritish shart' })
    .regex(phoneRegex, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'),
  code: z
    .string({ required_error: 'SMS kodni kiritish shart' })
    .length(6, 'SMS kod 6 xonali raqam bo\'lishi kerak'),
});

export const adminLoginSchema = z.object({
  phone: z.string().optional(),
  secretKey: z.string({ required_error: 'Admin paroli yoki kaliti kiritilishi shart' }),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak').optional().nullable(),
  lastName: z.string().min(2, 'Familiya kamida 2 ta harfdan iborat bo\'lishi kerak').optional().nullable(),
  age: z.number().int().min(14, 'Yosh kamida 14 bo\'lishi kerak').max(100).optional().nullable(),
  avatarUrl: z.string().url().or(z.string().startsWith('/uploads/')).optional().nullable(),
});

export const masterApplicationSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta harfdan iborat bo\'lishi kerak'),
  profession: z.string().min(2, 'Kasb / mutaxassislik kiritilishi shart'),
  experienceYears: z.number().int().min(0, 'Tajriba 0 yoki undan katta bo\'lishi kerak'),
  age: z.number().int().min(18, 'Usta yoshi kamida 18 bo\'lishi kerak'),
  description: z.string().min(10, 'O\'zingiz va xizmatlaringiz haqida kamida 10 ta belgi yozing'),
  city: z.string().min(2, 'Shahar yoki viloyat kiritilishi shart'),
  district: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Mahsulot nomi kiritilishi shart'),
  description: z.string().min(5, 'Mahsulot tavsifi kiritilishi shart'),
  price: z.number().positive('Narx musbat son bo\'lishi kerak'),
  category: z.string().min(2, 'Kategoriya tanlanishi shart'),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  stock: z.number().int().min(0).default(100),
});

export const updateProductSchema = createProductSchema.partial();
