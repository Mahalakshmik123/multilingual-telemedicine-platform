import { Router } from 'express';
import { getDoctors, getDoctorById, updateAvailability } from '../controllers/doctorController.ts';
import { protect, authorize } from '../middleware/auth.ts';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/availability', protect, authorize('doctor'), updateAvailability);

export default router;
