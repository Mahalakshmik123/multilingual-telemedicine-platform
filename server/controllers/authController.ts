import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.ts';
import { Patient } from '../models/Patient.ts';
import { Doctor } from '../models/Doctor.ts';
import { Interpreter } from '../models/Interpreter.ts';
import { memoryStore } from '../models/store.ts';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.ts';

// Helper to find user by email from Mongo or fallback store
async function findUserByEmail(email: string) {
  try {
    const u = await User.findOne({ email: email.toLowerCase() });
    if (u) return u;
  } catch {}
  return memoryStore.users.findOne({ email: email.toLowerCase() });
}

// Helper to save user
async function saveUser(userData: any) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  try {
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    const saved = await user.save();
    return saved;
  } catch {
    return memoryStore.users.create({
      ...userData,
      password: hashedPassword
    });
  }
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'patient', phone, preferredLanguage = 'en' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email and password' });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    // Role specific validation & creation
    const validRoles = ['patient', 'doctor', 'interpreter', 'admin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const newUser = await saveUser({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
      preferredLanguage,
      status: 'active'
    });

    const userId = newUser._id || newUser.id;

    // Create role-specific records
    if (role === 'patient') {
      const { age, gender, medicalHistory, allergies, emergencyContact } = req.body;
      const patientData = {
        user: userId,
        age: age ? Number(age) : 28,
        gender: gender || 'other',
        preferredLanguage: preferredLanguage || 'ta',
        medicalHistory: medicalHistory ? (Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory]) : [],
        allergies: allergies ? (Array.isArray(allergies) ? allergies : [allergies]) : [],
        emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' }
      };

      try {
        await Patient.create(patientData);
      } catch {
        await memoryStore.patients.create(patientData);
      }
    } else if (role === 'doctor') {
      const {
        specialization,
        qualification,
        experience,
        languagesSpoken,
        licenseNumber,
        profileDescription,
        consultationFee
      } = req.body;

      const doctorData = {
        user: userId,
        specialization: specialization || 'General Physician',
        qualification: qualification || 'MBBS, MD',
        experience: experience ? Number(experience) : 5,
        languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : ['en', 'ta'],
        licenseNumber: licenseNumber || `MED-${Math.floor(100000 + Math.random() * 900000)}`,
        profileDescription: profileDescription || 'Dedicated healthcare specialist committed to accessible patient care.',
        consultationFee: consultationFee ? Number(consultationFee) : 500,
        rating: 4.9,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '02:00 PM - 02:30 PM', '04:00 PM - 04:30 PM'],
        isAvailableToday: true
      };

      try {
        await Doctor.create(doctorData);
      } catch {
        await memoryStore.doctors.create(doctorData);
      }
    } else if (role === 'interpreter') {
      const { languages, qualification, certifications } = req.body;

      const interpreterData = {
        user: userId,
        languages: Array.isArray(languages) ? languages : ['ta', 'en', 'hi'],
        qualification: qualification || 'Certified Medical Interpreter (CMI)',
        certifications: Array.isArray(certifications) ? certifications : ['National Board of Certification for Medical Interpreters (NBCMI)'],
        availabilityStatus: 'available',
        rating: 4.9,
        totalSessionsCompleted: 0
      };

      try {
        await Interpreter.create(interpreterData);
      } catch {
        await memoryStore.interpreters.create(interpreterData);
      }
    }

    const token = generateToken(String(userId), role, email);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: String(userId),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        preferredLanguage: newUser.preferredLanguage
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ success: false, message: 'Your account is deactivated. Contact admin.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const userId = user._id ? String(user._id) : String(user.id);
    const token = generateToken(userId, user.role, user.email);

    // Fetch role details
    let roleDetails = null;
    if (user.role === 'patient') {
      roleDetails = await memoryStore.patients.findOne({ user: userId });
      if (!roleDetails) {
        try { roleDetails = await Patient.findOne({ user: userId }); } catch {}
      }
    } else if (user.role === 'doctor') {
      roleDetails = await memoryStore.doctors.findOne({ user: userId });
      if (!roleDetails) {
        try { roleDetails = await Doctor.findOne({ user: userId }); } catch {}
      }
    } else if (user.role === 'interpreter') {
      roleDetails = await memoryStore.interpreters.findOne({ user: userId });
      if (!roleDetails) {
        try { roleDetails = await Interpreter.findOne({ user: userId }); } catch {}
      }
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        preferredLanguage: user.preferredLanguage || 'en',
        roleDetails
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let user: any = null;
    try {
      user = await User.findById(req.user.id).select('-password');
    } catch {}

    if (!user) {
      user = await memoryStore.users.findById(req.user.id);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let roleDetails = null;
    if (user.role === 'patient') {
      try { roleDetails = await Patient.findOne({ user: req.user.id }); } catch {}
      if (!roleDetails) roleDetails = await memoryStore.patients.findOne({ user: req.user.id });
    } else if (user.role === 'doctor') {
      try { roleDetails = await Doctor.findOne({ user: req.user.id }); } catch {}
      if (!roleDetails) roleDetails = await memoryStore.doctors.findOne({ user: req.user.id });
    } else if (user.role === 'interpreter') {
      try { roleDetails = await Interpreter.findOne({ user: req.user.id }); } catch {}
      if (!roleDetails) roleDetails = await memoryStore.interpreters.findOne({ user: req.user.id });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        roleDetails
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, phone, preferredLanguage, roleSpecificData } = req.body;

    let updatedUser: any = null;
    try {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name, phone, preferredLanguage } },
        { new: true }
      ).select('-password');
    } catch {}

    if (!updatedUser) {
      updatedUser = await memoryStore.users.findByIdAndUpdate(req.user.id, {
        name,
        phone,
        preferredLanguage
      });
    }

    // Update role specific data if provided
    if (roleSpecificData && req.user.role === 'patient') {
      try { await Patient.findOneAndUpdate({ user: req.user.id }, { $set: roleSpecificData }); } catch {}
      const p = await memoryStore.patients.findOne({ user: req.user.id });
      if (p) await memoryStore.patients.findByIdAndUpdate(p.id, roleSpecificData);
    } else if (roleSpecificData && req.user.role === 'doctor') {
      try { await Doctor.findOneAndUpdate({ user: req.user.id }, { $set: roleSpecificData }); } catch {}
      const d = await memoryStore.doctors.findOne({ user: req.user.id });
      if (d) await memoryStore.doctors.findByIdAndUpdate(d.id, roleSpecificData);
    } else if (roleSpecificData && req.user.role === 'interpreter') {
      try { await Interpreter.findOneAndUpdate({ user: req.user.id }, { $set: roleSpecificData }); } catch {}
      const i = await memoryStore.interpreters.findOne({ user: req.user.id });
      if (i) await memoryStore.interpreters.findByIdAndUpdate(i.id, roleSpecificData);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Provide current and new password' });
      return;
    }

    let user: any = null;
    try {
      user = await User.findById(req.user?.id);
    } catch {}
    if (!user) {
      user = await memoryStore.users.findById(req.user?.id || '');
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    try {
      await User.findByIdAndUpdate(user._id, { password: hashed });
    } catch {}
    await memoryStore.users.findByIdAndUpdate(user._id || user.id, { password: hashed });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};
