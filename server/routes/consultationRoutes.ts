import { Router } from 'express';
import {
  getConsultationById,
  startConsultation,
  postMessage,
  endConsultationAndSummarize,
  getConsultationHistory
} from '../controllers/consultationController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.get('/history', protect, getConsultationHistory);
router.get('/:id', protect, getConsultationById);
router.put('/:id/start', protect, startConsultation);
router.post('/:id/messages', protect, postMessage);
router.put('/:id/complete', protect, endConsultationAndSummarize);

export default router;
