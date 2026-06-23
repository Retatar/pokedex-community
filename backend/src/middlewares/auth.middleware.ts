import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    return;
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }
    next();
  };
}
