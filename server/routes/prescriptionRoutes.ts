import { Router } from 'express';
import { createPrescription, getPrescriptions, getPrescriptionById } from '../controllers/prescriptionController.ts';
import { protect, authorize } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/', protect, getPrescriptions);
router.get('/:id', protect, getPrescriptionById);

export default router;
