import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import masterRoutes from './master.routes';
import productRoutes from './product.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/masters', masterRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/payment', paymentRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
