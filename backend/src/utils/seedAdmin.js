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

    const bcrypt = (await import('bcryptjs')).default;
    const existing = await User.findOne({ role: 'admin' }).select('+password').exec();
    if (existing) {
      let changed = false;
      if (existing.username !== username) {
        existing.username = username;
        changed = true;
      }
      if (!existing.password) {
        existing.password = password;
        changed = true;
      } else {
        try {
          const same = await bcrypt.compare(password, existing.password);
          if (!same) { existing.password = password; changed = true; }
        } catch { existing.password = password; changed = true; }
      }
      if (existing.membershipStatus !== 'active') {
        existing.membershipStatus = 'active';
        changed = true;
      }
      if ((existing.loginAttempts ?? 0) !== 0 || existing.lockUntil) {
        existing.loginAttempts = 0;
        existing.lockUntil = undefined;
        changed = true;
      }
      if (changed) {
        await existing.save();
        console.log(`[Seed] Admin account ensured & unlocked: ${username}`);
      } else {
        console.log(`[Seed] Admin account verified (ready): ${username}`);
      }
      return;
    }

    await User.create({
      username,
      password,
      role: 'admin',
      membershipStatus: 'active',
      loginAttempts: 0,
      lockUntil: undefined,
    });
    console.log(`[Seed] Admin account created: ${username}`);
  } catch (err) {
    console.error('[Seed] Failed to seed admin:', err.message);
  }
}
