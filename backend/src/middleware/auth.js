import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes — verifies JWT from Authorization header.
 * Attaches `req.user` (full User document) on success.
 */
export async function protect(req, res, next) {
  try {
    let token;

    // Prefer Bearer token from header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorised — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Not authorised — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorised — invalid or expired token' });
    }
    next(err);
  }
}

/**
 * Admin-only guard — must be used after `protect`.
 */
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }
  next();
}

/**
 * Premium-member guard — must be used after `protect`.
 * Only allows members with active Silver/Gold/Platinum membership.
 */
export function premiumOnly(req, res, next) {
  const validTiers = ['silver', 'gold', 'platinum'];
  if (!validTiers.includes(req.user?.membershipTier) || req.user?.membershipStatus !== 'active') {
    return res.status(403).json({ error: 'Premium membership required to view profiles' });
  }
  next();
}
