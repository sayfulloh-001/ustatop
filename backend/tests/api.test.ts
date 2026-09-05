import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';
import { signToken } from '../src/utils/jwt';

const app = createApp();

describe('UstaTop Full-Stack API Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let createdMasterId: string;
  let createdProductId: string;

  const testPhone = '+998901112233';
  const adminPhone = '+998901234567';

  beforeAll(async () => {
    // Clear test data
    await prisma.otpCode.deleteMany();
    await prisma.product.deleteMany();
    await prisma.masterProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication Flow', () => {
    it('should request an OTP for user phone', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ phone: testPhone });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.devOtp).toBeDefined();
    });

    it('should authenticate admin via secret key', async () => {
      const adminRes = await request(app)
        .post('/api/auth/admin-login')
        .send({
          secretKey: 'sayfulloh orzusi sayfulloh google',
          phone: adminPhone,
        });

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);
      expect(adminRes.body.token).toBeDefined();
      expect(adminRes.body.user.role).toBe('ADMIN');
      adminToken = adminRes.body.token;
    });

    it('should authenticate user and get profile', async () => {
      const user = await prisma.user.create({
        data: {
          phone: '+998939998877',
          firstName: 'Bekzod',
          lastName: 'Aliyev',
          role: 'USER',
        },
      });

      userToken = signToken({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.phone).toBe('+998939998877');
    });
  });

  describe('2. User Profile Rules', () => {
    it('should update profile but NEVER modify phone number', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Bekzodjon',
          lastName: 'Aliyev Updated',
          age: 30,
          phone: '+998900000000', // Attempt to modify phone
        });

      expect(res.status).toBe(200);
      expect(res.body.user.firstName).toBe('Bekzodjon');
      // Phone MUST remain unchanged:
      expect(res.body.user.phone).toBe('+998939998877');
    });
  });

  describe('3. Master Application & Visibility Rules', () => {
    it('should allow user to submit master application (status = PENDING)', async () => {
      const res = await request(app)
        .post('/api/masters/apply')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Bekzod',
          lastName: 'Aliyev',
          profession: 'Elektrik',
          experienceYears: 6,
          age: 30,
          description: 'Tajribali usta, barcha turdagi elektr montaj ishlari.',
          city: 'Toshkent shahri',
          district: 'Chilonzor',
        });

      expect(res.status).toBe(201);
      expect(res.body.masterProfile.status).toBe('PENDING');
      createdMasterId = res.body.masterProfile.id;
    });

    it('PENDING master must NOT appear in public master listing', async () => {
      const res = await request(app).get('/api/masters');
      expect(res.status).toBe(200);
      const found = res.body.masters.find((m: any) => m.id === createdMasterId);
      expect(found).toBeUndefined();
    });

    it('Non-admin user cannot access admin approval endpoint (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/admin/masters/${createdMasterId}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('Admin can approve master, making them visible in public listing', async () => {
      const approveRes = await request(app)
        .patch(`/api/admin/masters/${createdMasterId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.master.status).toBe('APPROVED');

      // Now verify public visibility
      const publicRes = await request(app).get('/api/masters');
      expect(publicRes.status).toBe(200);
      const found = publicRes.body.masters.find((m: any) => m.id === createdMasterId);
      expect(found).toBeDefined();
      expect(found.firstName).toBe('Bekzod');
    });
  });

  describe('4. Marketplace & Admin Product CRUD', () => {
    it('Non-admin cannot create product (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Perforator Bosch',
          description: 'Professional perforator 800W',
          price: 850000,
          category: 'Asbob-uskunalar',
        });

      expect(res.status).toBe(403);
    });

    it('Admin can create product', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Perforator Bosch 800W',
          description: 'Yuqori sifatli professional perforator.',
          price: 850000,
          category: 'Asbob-uskunalar',
          stock: 15,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.product.name).toBe('Perforator Bosch 800W');
      createdProductId = res.body.product.id;
    });

    it('Product appears in public marketplace', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      const found = res.body.products.find((p: any) => p.id === createdProductId);
      expect(found).toBeDefined();
      expect(found.price).toBe(850000);
    });

    it('Admin can edit product', async () => {
      const res = await request(app)
        .patch(`/api/admin/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 900000,
        });

      expect(res.status).toBe(200);
      expect(res.body.product.price).toBe(900000);
    });

    it('Admin can delete product', async () => {
      const res = await request(app)
        .delete(`/api/admin/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app).get('/api/products');
      const found = checkRes.body.products.find((p: any) => p.id === createdProductId);
      expect(found).toBeUndefined();
    });
  });

  describe('5. Admin Dashboard Metrics', () => {
    it('should return real aggregated database counts', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(1);
      expect(res.body.stats.approvedMasters).toBeGreaterThanOrEqual(1);
    });
  });
});
