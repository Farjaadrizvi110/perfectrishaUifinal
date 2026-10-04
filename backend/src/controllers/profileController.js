import Profile from '../models/Profile.js';

/**
 * GET /api/profiles
 * Premium members only — browse all active profiles.
 * Supports ?gender=Male filter.
 * IMPORTANT SAFETY: The current member's OWN profile is excluded here (backend-level)
 * so a user can never accidentally send themselves a proposal / contact inquiry —
 * not even if frontend filtering is bypassed.
 */
export async function getProfiles(req, res, next) {
  try {
    const { gender } = req.query;
    const filter = { isActive: true };
    if (gender && ['Male', 'Female'].includes(gender)) {
      filter.gender = gender;
    }

    // Belt-and-suspenders: exclude member's own profile via userId match
    if (req.user && req.user.role === 'member' && req.user._id) {
      filter.userId = { $ne: req.user._id };
    }

    // Note: -userId remains removed from response (private) — it's only used for the exclusion above.
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
 * Blocks self-profile access at the backend for defense-in-depth.
 */
export async function getProfileById(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id).select('-__v -userId');
    if (!profile || !profile.isActive) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (req.user && req.user.role === 'member') {
      const own = await Profile.findOne({ userId: req.user._id }).select('_id').lean().exec();
      if (own && String(own._id) === String(profile._id)) {
        return res.status(403).json({ error: 'You cannot access your own profile via proposals' });
      }
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}
