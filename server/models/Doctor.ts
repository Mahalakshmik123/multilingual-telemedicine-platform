import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  specialization: string;
  qualification: string;
  experience: number;
  languagesSpoken: string[];
  licenseNumber: string;
  profileDescription: string;
  consultationFee: number;
  rating: number;
  availableDays: string[];
  availableTimeSlots: string[];
  isAvailableToday: boolean;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, default: 'General Physician' },
    qualification: { type: String, required: true, default: 'MBBS, MD' },
    experience: { type: Number, required: true, default: 5 },
    languagesSpoken: [{ type: String, default: 'en' }],
    licenseNumber: { type: String, required: true },
    profileDescription: { type: String, default: '' },
    consultationFee: { type: Number, default: 500 },
    rating: { type: Number, default: 4.8 },
    availableDays: [{ type: String }],
    availableTimeSlots: [{ type: String }],
    isAvailableToday: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
