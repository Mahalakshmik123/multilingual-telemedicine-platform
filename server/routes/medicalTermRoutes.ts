import { Router } from 'express';
import {
  getMedicalTerms,
  getMedicalTermById,
  createMedicalTerm,
  updateMedicalTerm,
  deleteMedicalTerm
} from '../controllers/medicalTermController.ts';
import { protect, authorize } from '../middleware/auth.ts';

const router = Router();

router.get('/', getMedicalTerms);
router.get('/:id', getMedicalTermById);
router.post('/', protect, authorize('doctor', 'admin'), createMedicalTerm);
router.put('/:id', protect, authorize('doctor', 'admin'), updateMedicalTerm);
router.delete('/:id', protect, authorize('admin'), deleteMedicalTerm);

export default router;
