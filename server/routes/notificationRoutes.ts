import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
