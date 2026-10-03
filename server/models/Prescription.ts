import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicineItem {
  name: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "Twice daily after food"
  duration: string; // e.g. "3 days"
  instructions: string; // e.g. "Take with plenty of warm water"
}

export interface IPrescription extends Document {
  consultation: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  medicines: IMedicineItem[];
  diagnosis: string;
  generalAdvice?: string;
  dietaryRestrictions?: string;
  translatedInstructions?: {
    language: string;
    text: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MedicineItemSchema = new Schema<IMedicineItem>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: '' }
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    consultation: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [MedicineItemSchema],
    diagnosis: { type: String, required: true },
    generalAdvice: { type: String, default: 'Drink plenty of water and rest well.' },
    dietaryRestrictions: { type: String, default: 'Avoid spicy and oily foods.' },
    translatedInstructions: {
      language: { type: String },
      text: { type: String }
    }
  },
  { timestamps: true }
);

export const Prescription = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
