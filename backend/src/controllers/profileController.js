import Profile from '../models/Profile.js';

/**
 * GET /api/profiles
 * Premium members only — browse all active profiles.
 * Supports ?gender=Male filter.
 */
export async function getProfiles(req, res, next) {
  try {
    const { gender } = req.query;
    const filter = { isActive: true };
    if (gender && ['Male', 'Female'].includes(gender)) {
      filter.gender = gender;
    }

    const profiles = await Profile.find(filter)
      .select('-__v -userId')
      .sort({ createdAt: -1 });

    res.json({ count: profiles.length, profiles });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/profiles/:id
 * Premium members only — view a single profile in full detail.
 */
export async function getProfileById(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id).select('-__v -userId');
    if (!profile || !profile.isActive) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}
