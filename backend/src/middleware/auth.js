import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const authRequired = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = verifyToken(token);
    req.user = payload;
    try {
      const u = await User.findById(payload.id).select('suspended');
      if (u && u.suspended) {
        return res.status(403).json({ message: 'Account suspended' });
      }
    } catch (e) {
      // ignore DB errors here and continue
    }
    return next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminRequired = (req, res, next) => {
  // Must have auth first (authRequired should be applied before this), but we'll also check defensively
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};
