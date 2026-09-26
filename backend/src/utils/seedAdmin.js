import User from '../models/User.js';

/**
 * Seeds the admin account on server boot if it doesn't exist.
 * Credentials come from .env (ADMIN_USERNAME / ADMIN_PASSWORD).
 * ADMIN_PASSWORD may be quoted in dotenv → strip surrounding quotes.
 */
export async function seedAdmin() {
  let username = process.env.ADMIN_USERNAME || 'FarjaadRizvi110';
  let password = process.env.ADMIN_PASSWORD || 'Superadmin#721105';

  if (typeof username === 'string') {
    username = username.replace(/^['"]|['"]$/g, '').trim();
  }
  if (typeof password === 'string') {
    password = password.replace(/^['"]|['"]$/g, '').trim();
  }

  try {
    if (!username || !password) {
      console.error('[Seed] Skip seed admin: ADMIN_USERNAME / ADMIN_PASSWORD missing');
      return;
    }

    const existing = await User.findOne({ username, role: 'admin' });
    if (existing) {
      const bcrypt = (await import('bcryptjs')).default;
      // existing.password could be missing due to select: false — force refetch
      const withPw = await User.findById(existing._id).select('+password').exec();
      if (!withPw) { return; }
      try {
        const isSame = await bcrypt.compare(password, withPw.password);
        if (!isSame) {
          withPw.password = password;
          await withPw.save();
          console.log(`[Seed] Admin password updated for ${username}`);
        }
      } catch {
        try {
          withPw.password = password;
          await withPw.save();
          console.log(`[Seed] Admin password re-saved for ${username}`);
        } catch (e2) {
          console.error('[Seed] Admin password update failed:', e2.message);
        }
      }
      return;
    }

    await User.create({
      username,
      password,
      role: 'admin',
      membershipStatus: 'active',
    });
    console.log(`[Seed] Admin account created: ${username}`);
  } catch (err) {
    console.error('[Seed] Failed to seed admin:', err.message);
  }
}
