import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect ALL admin routes with authenticate + requireAdmin
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

// Master applications
router.get('/masters', adminController.getMasterApplications);
router.patch('/masters/:id/approve', adminController.approveMaster);
router.patch('/masters/:id/reject', adminController.rejectMaster);

// Products management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Users management
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

export default router;
