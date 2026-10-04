import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Profile from "../models/Profile.js";

/**
 * POST /api/auth/register
 * Public — submits a matrimonial profile registration form.
 * Status defaults to 'pending'. Admin must approve before login is created.
 * Enforces unique email/phone to prevent duplicate submissions across all statuses.
 */
export async function submitRegistration(req, res, next) {
  try {
    const formData = req.body;
    const email = (formData.email || "").trim().toLowerCase();
    const phone = (formData.phone || "").trim();

    // ── Task 4: Duplicate contact guard ──
    // Same email/phone used again → flat rejection ("one contact number registered by one")
    if (email || phone) {
      const regFilter = { $or: [] };
      if (email) regFilter.$or.push({ email });
      if (phone) regFilter.$or.push({ phone });

      const existingReg = await Registration.findOne(regFilter);
      if (existingReg) {
        return res.status(409).json({ error: "Your request already received" });
      }

      const profFilter = { $or: [] };
      if (email) profFilter.$or.push({ email });
      if (phone) profFilter.$or.push({ phone });
      const existingProfile = await Profile.findOne(profFilter);
      if (existingProfile) {
        return res.status(409).json({ error: "Your request already received" });
      }
    }

    // Prevent duplicate submissions with same gender + age + location within 24h
    const recent = await Registration.findOne({
      gender: formData.gender,
      age: formData.age,
      location: formData.location,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (recent) {
      return res.status(409).json({ error: "Your request already received" });
    }

    const registration = await Registration.create({
      ...formData,
      email,
      phone,
      status: "pending",
      plan: formData.plan || "Free",
    });

    res.status(201).json({
      message:
        "Registration submitted successfully. Our team will review your profile within 48 hours, In Sha Allah.",
      registrationId: registration._id,
      status: "pending",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Public — member login with loginId + password.
 * Returns JWT token. Rate-limited + account lockout after 5 failed attempts.
 */
export async function login(req, res, next) {
  try {
    const { loginId, password } = req.body;

    if (
      typeof loginId !== "string" ||
      typeof password !== "string" ||
      !loginId ||
      !password
    ) {
      return res.status(400).json({ error: "Invalid Login ID or Password" });
    }

    const loginIdRaw = String(loginId).trim();
    const loginIdUpper = loginIdRaw.toUpperCase();

    const user = await User.findOne({
      $or: [{ loginId: loginIdUpper }, { username: loginIdRaw }],
    }).select("+password").exec();

    if (!user) {
      return res.status(401).json({ error: "Invalid Login ID or Password" });
    }

    // Check lock status
    if (user.isLocked) {
      const waitMin = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account temporarily locked. Try again in ${waitMin} minute(s).`,
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: "Invalid Login ID or Password" });
    }

    // Reset attempts on success
    await user.resetLoginAttempts();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        loginId: user.loginId,
        username: user.username,
        role: user.role,
        membershipTier: user.membershipTier,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/admin-login
 * Public — admin login with username + password.
 * Returns JWT token with admin role.
 */
export async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }

    const user = await User.findOne({ username, role: "admin" }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    if (user.isLocked) {
      const waitMin = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Admin account locked. Try again in ${waitMin} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    await user.resetLoginAttempts();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Protected — returns the current authenticated user's profile.
 */
export async function getMe(req, res, next) {
  try {
    const user = req.user;
    // If member, fetch their registration data
    let registration = null;
    let profile = null;
    if (user.role === "member") {
      if (user.registrationId) {
        registration = await Registration.findById(user.registrationId).select(
          "-__v",
        );
      }
      profile = await Profile.findOne({
        userId: user._id,
      }).select("-__v");
      if (!registration && profile?.registrationId) {
        registration = await Registration.findById(
          profile.registrationId,
        ).select("-__v");
      }
    }

    res.json({
      user: {
        id: user._id,
        loginId: user.loginId,
        username: user.username,
        role: user.role,
        membershipTier: user.membershipTier,
        membershipStatus: user.membershipStatus,
        approvedAt: user.approvedAt,
        lastLoginAt: user.lastLoginAt,
      },
      registration,
      profile,
    });
  } catch (err) {
    next(err);
  }
}
