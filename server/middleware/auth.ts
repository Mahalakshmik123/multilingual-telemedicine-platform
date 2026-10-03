import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';
import { memoryStore } from '../models/store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'medical_telemedicine_super_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id: string;
    email: string;
    name: string;
    role: 'patient' | 'doctor' | 'interpreter' | 'admin';
    preferredLanguage?: string;
  };
}

export const generateToken = (userId: string, role: string, email: string): string => {
  return jwt.sign({ id: userId, role, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
    
    // Check in Mongoose first if connected, or fallback store
    let user: any = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch {
      // ignore
    }

    if (!user) {
      user = await memoryStore.users.findById(decoded.id);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or token invalid' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
      return;
    }

    req.user = {
      id: user._id ? String(user._id) : String(user.id),
      _id: user._id ? String(user._id) : String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      preferredLanguage: user.preferredLanguage || 'en'
    };

    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed', error: error.message });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route.`
      });
      return;
    }
    next();
  };
};
