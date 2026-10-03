import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, createAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointmentStatus);

export default router;
