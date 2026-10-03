import { Router } from 'express';
import {
  createInterpreterRequest,
  getInterpreterRequests,
  updateInterpreterRequestStatus
} from '../controllers/interpreterController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, createInterpreterRequest);
router.get('/', protect, getInterpreterRequests);
router.put('/:id', protect, updateInterpreterRequestStatus);

export default router;
