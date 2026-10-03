import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalTerm extends Document {
  term: string;
  category: string;
  translations: {
    english?: string;
    tamil?: string;
    hindi?: string;
    telugu?: string;
    malayalam?: string;
    kannada?: string;
    [key: string]: string | undefined;
  };
  definition: string;
  simplifiedExplanation?: string;
  symptoms?: string[];
  commonMistranslations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicalTermSchema = new Schema<IMedicalTerm>(
  {
    term: { type: String, required: true, unique: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      default: 'General Medicine',
      index: true
    },
    translations: {
      english: { type: String, default: '' },
      tamil: { type: String, default: '' },
      hindi: { type: String, default: '' },
      telugu: { type: String, default: '' },
      malayalam: { type: String, default: '' },
      kannada: { type: String, default: '' }
    },
    definition: { type: String, default: '' },
    simplifiedExplanation: { type: String, default: '' },
    symptoms: [{ type: String }],
    commonMistranslations: [{ type: String }]
  },
  { timestamps: true }
);

export const MedicalTerm = mongoose.models.MedicalTerm || mongoose.model<IMedicalTerm>('MedicalTerm', MedicalTermSchema);
