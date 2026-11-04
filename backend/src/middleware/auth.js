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

/**
 * Profile-browsing permission guard — must be used after `protect`.
 *
 * This is the ADMIN-CONTROLLED switch: even an active paying member cannot
 * browse other members' profiles until an admin explicitly grants
 * `canViewProfiles` on their account. Members can always view their OWN
 * profile/dashboard — this guard only protects the browse endpoints
 * (GET /api/profiles, GET /api/profiles/:id).
 *
 * Admins bypass the flag so they can review any profile from the dashboard.
 */
export function canBrowseProfiles(req, res, next) {
  if (req.user?.role === 'admin') return next();
  if (req.user?.canViewProfiles !== true) {
    return res.status(403).json({
      error:
        'Profile browsing access has not been granted on your account yet. Please contact our team.',
      code: 'PROFILE_ACCESS_NOT_GRANTED',
    });
  }
  next();
}
