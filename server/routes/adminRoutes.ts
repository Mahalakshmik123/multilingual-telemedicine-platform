import { Router } from 'express';
import { getAdminStats, getAllUsers, toggleUserStatus } from '../controllers/adminController.ts';
import { protect, authorize } from '../middleware/auth.ts';

const router = Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

export default router;
