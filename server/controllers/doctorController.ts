import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor.ts';
import { User } from '../models/User.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, specialization, language, availableToday } = req.query;

    let doctorsList: any[] = [];
    try {
      doctorsList = await Doctor.find().populate('user', 'name email phone avatarUrl preferredLanguage');
    } catch {}

    if (!doctorsList || doctorsList.length === 0) {
      const memoryDoctors = await memoryStore.doctors.find();
      const populated = await Promise.all(
        memoryDoctors.map(async doc => {
          const user = await memoryStore.users.findById(String(doc.user));
          return {
            ...doc,
            user: user
              ? {
                  _id: user._id || user.id,
                  id: user._id || user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  avatarUrl: user.avatarUrl,
                  preferredLanguage: user.preferredLanguage
                }
              : null
          };
        })
      );
      doctorsList = populated;
    }

    // Apply filtering
    let results = doctorsList.filter(d => d.user !== null);

    if (search) {
      const term = String(search).toLowerCase();
      results = results.filter(
        d =>
          d.user?.name?.toLowerCase().includes(term) ||
          d.specialization?.toLowerCase().includes(term) ||
          d.profileDescription?.toLowerCase().includes(term)
      );
    }

    if (specialization && specialization !== 'All') {
      const spec = String(specialization).toLowerCase();
      results = results.filter(d => d.specialization?.toLowerCase() === spec);
    }

    if (language && language !== 'All') {
      const lang = String(language).toLowerCase();
      results = results.filter(
        d => Array.isArray(d.languagesSpoken) && d.languagesSpoken.some((l: string) => l.toLowerCase() === lang)
      );
    }

    if (availableToday === 'true') {
      results = results.filter(d => d.isAvailableToday === true);
    }

    res.json({
      success: true,
      count: results.length,
      doctors: results.map(d => ({
        id: d._id || d.id,
        doctorId: d._id || d.id,
        userId: d.user?._id || d.user?.id,
        name: d.user?.name || 'Dr. Specialist',
        email: d.user?.email,
        avatarUrl: d.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(d.user?.name || 'Doctor')}`,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        languagesSpoken: d.languagesSpoken || ['en'],
        licenseNumber: d.licenseNumber,
        profileDescription: d.profileDescription,
        consultationFee: d.consultationFee,
        rating: d.rating || 4.9,
        availableDays: d.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: d.availableTimeSlots || ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '02:00 PM - 02:30 PM', '04:00 PM - 04:30 PM'],
        isAvailableToday: d.isAvailableToday ?? true
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors', error: error.message });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let doctor: any = null;
    try {
      doctor = await Doctor.findById(id).populate('user', 'name email phone avatarUrl');
      if (!doctor) {
        // Might be searched by user ID
        doctor = await Doctor.findOne({ user: id }).populate('user', 'name email phone avatarUrl');
      }
    } catch {}

    if (!doctor) {
      doctor = await memoryStore.doctors.findById(id);
      if (!doctor) {
        doctor = await memoryStore.doctors.findOne({ user: id });
      }
      if (doctor) {
        const user = await memoryStore.users.findById(String(doctor.user));
        doctor.user = user;
      }
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    res.json({
      success: true,
      doctor: {
        id: doctor._id || doctor.id,
        doctorId: doctor._id || doctor.id,
        userId: doctor.user?._id || doctor.user?.id,
        name: doctor.user?.name,
        email: doctor.user?.email,
        phone: doctor.user?.phone,
        avatarUrl: doctor.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(doctor.user?.name || 'Doctor')}`,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        languagesSpoken: doctor.languagesSpoken,
        licenseNumber: doctor.licenseNumber,
        profileDescription: doctor.profileDescription,
        consultationFee: doctor.consultationFee,
        rating: doctor.rating,
        availableDays: doctor.availableDays,
        availableTimeSlots: doctor.availableTimeSlots,
        isAvailableToday: doctor.isAvailableToday
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctor details', error: error.message });
  }
};

export const updateAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only doctors can update availability' });
      return;
    }

    const { availableDays, availableTimeSlots, isAvailableToday } = req.body;

    let updated: any = null;
    try {
      updated = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        { $set: { availableDays, availableTimeSlots, isAvailableToday } },
        { new: true }
      );
    } catch {}

    if (!updated) {
      const doc = await memoryStore.doctors.findOne({ user: req.user.id });
      if (doc) {
        updated = await memoryStore.doctors.findByIdAndUpdate(doc._id || doc.id, {
          availableDays,
          availableTimeSlots,
          isAvailableToday
        });
      }
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: {
        availableDays: updated?.availableDays,
        availableTimeSlots: updated?.availableTimeSlots,
        isAvailableToday: updated?.isAvailableToday
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update availability', error: error.message });
  }
};
