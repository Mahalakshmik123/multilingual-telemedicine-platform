import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'patient' | 'doctor' | 'interpreter' | 'admin';
  phone?: string;
  status: 'active' | 'inactive';
  preferredLanguage?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'interpreter', 'admin'],
      default: 'patient'
    },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    preferredLanguage: { type: String, default: 'en' },
    avatarUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
