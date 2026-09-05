import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'ustatop-jwt-secure-secret-key-2026-uzbekistan',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  sms: {
    provider: (process.env.SMS_PROVIDER || 'mock') as 'mock' | 'eskiz',
    eskizEmail: process.env.ESKIZ_EMAIL || '',
    eskizPassword: process.env.ESKIZ_PASSWORD || '',
  },
  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 'cloudinary' | 's3',
    uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  },
  admin: {
    phone: process.env.ADMIN_PHONE || '+998901234567',
    secretKey: process.env.ADMIN_SECRET_KEY || 'sayfulloh orzusi sayfulloh google',
  },
  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),
  },
  payme: {
    merchantId:   process.env.PAYME_MERCHANT_ID   || '',
    secretKey:    process.env.PAYME_SECRET_KEY     || '',  // Payme cashier key (production)
    testSecretKey:process.env.PAYME_TEST_SECRET_KEY|| '',  // Payme test key
    isTest:       (process.env.PAYME_TEST_MODE || 'true') === 'true',
    registrationAmount: parseInt(process.env.PAYME_REGISTRATION_AMOUNT || '29000', 10),
    // Payme yoqilgan bo'lsa — merchant_id va secret_key to'ldirilgan bo'lishi kerak
    get isEnabled() {
      return !!(
        process.env.PAYME_MERCHANT_ID &&
        (process.env.PAYME_SECRET_KEY || process.env.PAYME_TEST_SECRET_KEY)
      );
    },
    get activeSecretKey() {
      const isTest = (process.env.PAYME_TEST_MODE || 'true') === 'true';
      return isTest
        ? (process.env.PAYME_TEST_SECRET_KEY || '')
        : (process.env.PAYME_SECRET_KEY || '');
    },
  },
};
