import mongoose, { Schema, Document } from 'mongoose';

export interface IInterpreter extends Document {
  user: mongoose.Types.ObjectId;
  languages: string[];
  availabilityStatus: 'available' | 'busy' | 'offline';
  qualification: string;
  certifications: string[];
  rating: number;
  totalSessionsCompleted: number;
}

const InterpreterSchema = new Schema<IInterpreter>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    languages: [{ type: String, required: true }],
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available'
    },
    qualification: { type: String, default: 'Certified Medical Interpreter (CMI)' },
    certifications: [{ type: String }],
    rating: { type: Number, default: 4.9 },
    totalSessionsCompleted: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Interpreter = mongoose.models.Interpreter || mongoose.model<IInterpreter>('Interpreter', InterpreterSchema);
