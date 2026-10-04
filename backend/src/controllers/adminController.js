import crypto from "crypto";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Profile from "../models/Profile.js";

/**
 * GET /api/admin/registrations?status=pending
 * Admin — list all registrations, filterable by status.
 */
export async function getRegistrations(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const registrations = await Registration.find(filter).sort({
      createdAt: -1,
    });
    res.json({ count: registrations.length, registrations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/registrations/:id
 * Admin — get a single registration by ID.
 */
export async function getRegistrationById(req, res, next) {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }
    res.json({ registration });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/registrations/:id/approve
 * Admin — approve a pending registration.
 * Accepts optional body { loginId, password } so admin can MANUALLY set
 * credentials exactly how he wants. If either is missing, auto-generate a
 * safe random value as a fallback.
 * Creates a User account, creates a Profile (visible to premium members),
 * and returns credentials (both the final ones actually used).
 */
export async function approveRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const rawBody = req.body || {};

    const bodyLoginId =
      typeof rawBody.loginId === "string"
        ? rawBody.loginId.trim()
        : typeof rawBody.loginid === "string"
          ? rawBody.loginid.trim()
          : "";
    const bodyPassword =
      typeof rawBody.password === "string"
        ? rawBody.password.trim()
        : typeof rawBody.Password === "string"
          ? rawBody.Password.trim()
          : "";

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.status === "approved") {
      return res.status(400).json({ error: "Registration already approved" });
    }

    // ── Admin manual input validations ──
    // loginId: if provided, must be unique in the whole Users collection,
    //          max 32 chars, letters/digits and - _ only (no spaces).
    let loginId;
    if (bodyLoginId) {
      if (!/^[A-Za-z0-9_\-]{3,32}$/.test(bodyLoginId)) {
        return res.status(400).json({
          error:
            "Invalid custom Login ID. Use 3-32 letters, digits, hyphen or underscore (no spaces).",
        });
      }
      const collision = await User.findOne({
        loginId: new RegExp(
          "^" + bodyLoginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          "i",
        ),
      });
      if (collision) {
        return res.status(409).json({
          error: "This Login ID is already in use. Please choose another.",
        });
      }
      loginId = bodyLoginId;
    } else {
      // auto fallback (admin did not provide → keep previous auto PR-XXXX pattern)
      let tries = 0;
      while (tries < 20) {
        const candidate = "PR-" + crypto.randomInt(1000, 9999);
        const exists = await User.findOne({ loginId: candidate });
        if (!exists) {
          loginId = candidate;
          break;
        }
        tries++;
      }
      if (!loginId) loginId = "PR-" + crypto.randomInt(100000, 999999);
    }

    // password: min 6 chars, max 64, if not provided auto-generate 8-hex
    let password = bodyPassword;
    if (!password) {
      password = crypto.randomBytes(4).toString("hex");
    } else if (password.length < 6 || password.length > 64) {
      return res
        .status(400)
        .json({ error: "Password must be between 6 and 64 characters long." });
    }

    // Create user account
    const user = await User.create({
      loginId,
      password,
      role: "member",
      registrationId: registration._id,
      membershipTier: (registration.plan || "free").toLowerCase(),
      membershipStatus: "active",
      approvedAt: new Date(),
      approvedBy: (req.user && (req.user._id || req.user.id)) || null,
    });

    // Create profile visible to premium members
    const profile = await Profile.create({
      registrationId: registration._id,
      userId: user._id,
      email: registration.email,
      phone: registration.phone,
      firstName: registration.firstName,
      lastName: registration.lastName,
      gender: registration.gender,
      age: registration.age,
      height: registration.height,
      location: registration.location,
      nationality: registration.nationality,
      ethnicity: registration.ethnicity,
      languages: registration.languages,
      disability: registration.disability,
      sect: registration.sect,
      hijabi: registration.hijabi,
      beardStyle: registration.beardStyle,
      religiousExpectations: registration.religiousExpectations,
      education: registration.education,
      occupation: registration.occupation,
      annualIncome: registration.annualIncome,
      smoker: registration.smoker,
      drivingLicence: registration.drivingLicence,
      willingToRelocate: registration.willingToRelocate,
      hobbies: registration.hobbies,
      maritalStatus: registration.maritalStatus,
      secondWife: registration.secondWife,
      aboutMe: registration.aboutMe,
      partnerEducation: registration.partnerEducation,
      partnerOccupation: registration.partnerOccupation,
      partnerSect: registration.partnerSect,
      partnerReligiousPractice: registration.partnerReligiousPractice,
      partnerIslamicValues: registration.partnerIslamicValues,
      partnerAgeRange: registration.partnerAgeRange,
      partnerEthnicity: registration.partnerEthnicity,
      partnerLivingArrangement: registration.partnerLivingArrangement,
      partnerWillingRelocate: registration.partnerWillingRelocate,
      openToDivorcee: registration.openToDivorcee,
      openToWidow: registration.openToWidow,
      acceptChildren: registration.acceptChildren,
      partnerDescription: registration.partnerDescription,
      otherInfo: registration.otherInfo,
      plan: registration.plan,
      isPaid: true,
      isActive: true,
    });

    // Update registration status
    registration.status = "approved";
    registration.reviewedBy =
      (req.user && (req.user._id || req.user.id)) || null;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({
      message: "Registration approved successfully",
      credentials: { loginId, password },
      userId: user._id,
      profileId: profile._id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/registrations/:id/reject
 * Admin — reject a pending registration with optional reason.
 */
export async function rejectRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.status === "approved") {
      return res
        .status(400)
        .json({ error: "Cannot reject an already-approved registration" });
    }

    registration.status = "rejected";
    registration.rejectionReason = reason || "";
    registration.reviewedBy =
      (req.user && (req.user._id || req.user.id)) || null;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({ message: "Registration rejected", registrationId: id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/members
 * Admin — list all approved members (users with role 'member').
 * NOW ALSO returns profileId on each row so frontend Admin Dashboard Edit/Delete
 * buttons can call the new admin/profiles/:id endpoints.
 */
export async function getMembers(req, res, next) {
  try {
    const users = await User.find({ role: "member" })
      .populate(
        "registrationId",
        "gender age location plan status firstName lastName email phone createdAt education occupation",
      )
      .sort({ approvedAt: -1 });

    const members = [];
    for (const m of users) {
      const profile = await Profile.findOne({
        $or: [
          { userId: m._id },
          { registrationId: m.registrationId?._id || m.registrationId },
        ],
      })
        .select("_id")
        .lean();
      members.push({
        id: m._id,
        loginId: m.loginId,
        membershipTier: m.membershipTier,
        membershipStatus: m.membershipStatus,
        approvedAt: m.approvedAt,
        lastLoginAt: m.lastLoginAt,
        registration: m.registrationId,
        profileId: profile ? profile._id : null,
      });
    }

    res.json({ count: members.length, members });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/members/:id/membership
 * Admin — update a member's membership tier or status.
 */
export async function updateMembership(req, res, next) {
  try {
    const { id } = req.params;
    const { tier, status } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "member") {
      return res.status(404).json({ error: "Member not found" });
    }

    if (tier) user.membershipTier = tier;
    if (status) user.membershipStatus = status;
    await user.save();

    res.json({
      message: "Membership updated",
      user: {
        id: user._id,
        membershipTier: user.membershipTier,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stats
 * Admin — dashboard summary statistics.
 */
export async function getStats(req, res, next) {
  try {
    const [pending, approved, rejected, members, profiles] = await Promise.all([
      Registration.countDocuments({ status: "pending" }),
      Registration.countDocuments({ status: "approved" }),
      Registration.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "member" }),
      Profile.countDocuments({ isActive: true }),
    ]);

    res.json({ pending, approved, rejected, members, profiles });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/profiles/:id
 * Admin — get combined { profile, registration, user } for an approved member
 * so the Edit Profile modal can be pre-filled with ALL current values.
 */
export async function getProfileForAdmin(req, res, next) {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id).select("-__v");
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const registration = profile.registrationId
      ? await Registration.findById(profile.registrationId).select("-__v")
      : null;

    const user = profile.userId
      ? await User.findById(profile.userId).select("-password -__v")
      : null;

    res.json({ profile, registration, user });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/profiles/:id
 * Admin — EDIT any field on an approved member's profile/registration in-place.
 * Accepts { firstName, lastName, gender, age, height, location, nationality,
 * ethnicity, languages, disability, maritalStatus, sect, hijabi, beardStyle,
 * religiousExpectations, education, occupation, annualIncome, smoker,
 * drivingLicence, willingToRelocate, hobbies, secondWife, aboutMe,
 * partnerEducation, partnerOccupation, partnerSect, partnerReligiousPractice,
 * partnerIslamicValues, partnerAgeRange, partnerEthnicity,
 * partnerLivingArrangement, partnerWillingRelocate, openToDivorcee,
 * openToWidow, acceptChildren, partnerDescription, otherInfo, email, phone,
 * plan, isPaid, isActive, loginId, password, membershipTier, membershipStatus }
 *
 * UPDATES ARE APPLIED IN PARALLEL TO BOTH PROFILE + REGISTRATION (when exists)
 * so data stays consistent with our dual-source Dashboard fallback pattern.
 *
 * Changes loginId/password on the User if provided, with uniqueness + regex
 * validations identical to approveRegistration (so admin can safely "fix" a
 * typo in a member's Login ID he typed earlier).
 */
export async function updateProfileByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const patch = req.body || {};

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // ─────────────────── 1. Login ID change validation ───────────────────
    if (typeof patch.loginId === "string" && patch.loginId.trim().length) {
      const newLoginId = patch.loginId.trim();
      if (!/^[A-Za-z0-9_\-]{3,32}$/.test(newLoginId)) {
        return res.status(400).json({
          error:
            "Invalid Login ID. Use 3-32 letters, digits, hyphen or underscore (no spaces).",
        });
      }
      const collision = await User.findOne({
        _id: { $ne: profile.userId },
        loginId: new RegExp(
          "^" + newLoginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          "i",
        ),
      });
      if (collision) {
        return res.status(409).json({
          error: "This Login ID is already in use by another member.",
        });
      }
    }

    // ─────────────────── 2. Password change validation ───────────────────
    const newPassword =
      typeof patch.password === "string" && patch.password.length
        ? patch.password
        : null;
    if (
      newPassword !== null &&
      (newPassword.length < 6 || newPassword.length > 64)
    ) {
      return res.status(400).json({
        error: "Password must be between 6 and 64 characters long.",
      });
    }

    // ─────────────────── 3. Profile fields whitelist ───────────────────
    const profileFields = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "height",
      "location",
      "nationality",
      "ethnicity",
      "languages",
      "disability",
      "maritalStatus",
      "sect",
      "hijabi",
      "beardStyle",
      "religiousExpectations",
      "education",
      "occupation",
      "annualIncome",
      "smoker",
      "drivingLicence",
      "willingToRelocate",
      "hobbies",
      "secondWife",
      "aboutMe",
      "partnerEducation",
      "partnerOccupation",
      "partnerSect",
      "partnerReligiousPractice",
      "partnerIslamicValues",
      "partnerAgeRange",
      "partnerEthnicity",
      "partnerLivingArrangement",
      "partnerWillingRelocate",
      "openToDivorcee",
      "openToWidow",
      "acceptChildren",
      "partnerDescription",
      "otherInfo",
      "email",
      "phone",
      "plan",
      "isPaid",
      "isActive",
    ];
    for (const k of profileFields) {
      if (patch[k] !== undefined) profile[k] = patch[k];
    }
    profile.updatedBy = (req.user && (req.user._id || req.user.id)) || null;
    profile.updatedAt = new Date();
    await profile.save();

    // ─────────────────── 4. Sync same edits → Registration doc ──────────
    if (profile.registrationId) {
      const registration = await Registration.findById(profile.registrationId);
      if (registration) {
        for (const k of profileFields) {
          if (patch[k] !== undefined) registration[k] = patch[k];
        }
        await registration.save();
      }
    }

    // ─────────────────── 5. Sync User doc (loginId / password / tier / status)
    if (profile.userId) {
      const user = await User.findById(profile.userId);
      if (user) {
        if (typeof patch.loginId === "string" && patch.loginId.trim().length) {
          user.loginId = patch.loginId.trim();
        }
        if (newPassword) user.password = newPassword;
        if (patch.membershipTier) user.membershipTier = patch.membershipTier;
        if (patch.membershipStatus)
          user.membershipStatus = patch.membershipStatus;
        await user.save();
      }
    }

    res.json({
      message: "Profile updated successfully",
      profileId: profile._id,
      updatedFields: profileFields.filter((k) => patch[k] !== undefined),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/profiles/:id
 * Admin — DELETE (hard cascade) an approved member profile.
 *
 * Removes in order:
 *   1. Profile      → what premium members see in proposals
 *   2. User         → member login account (can no longer sign in)
 *   3. Registration → admin-queue record (won't appear in Approved/Rejected tabs)
 *
 * Returns a list of what was deleted so UI can show a confirmation banner.
 * Admin accounts CANNOT be deleted through this endpoint.
 */
export async function deleteProfileByAdmin(req, res, next) {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Load related docs BEFORE deleting them (so we can confirm)
    const userId = profile.userId;
    const registrationId = profile.registrationId;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (user && user.role === "admin") {
        return res.status(400).json({
          error:
            "Admin accounts cannot be deleted from the profile delete endpoint.",
        });
      }
    }

    let deleted = { profile: false, user: false, registration: false };

    await Profile.deleteOne({ _id: id });
    deleted.profile = true;

    if (userId) {
      const r = await User.deleteOne({ _id: userId });
      deleted.user = r.deletedCount > 0;
    }
    if (registrationId) {
      const r = await Registration.deleteOne({ _id: registrationId });
      deleted.registration = r.deletedCount > 0;
    }

    res.json({
      message: "Profile and related accounts deleted permanently",
      deleted,
      loginIdRemoved: user ? user.loginId : null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/registrations/:id
 * Admin — EDIT any field on a pending/rejected registration BEFORE approval
 * (after approval → use updateProfileByAdmin endpoint on /admin/profiles/:id instead).
 *
 * Applies whitelist identical to updateProfileByAdmin so admin can fix typos in
 * applicant-submitted data without having to reject and re-register the person.
 *
 * EDGE-CASE SAFETY: If an approved profile is sometimes opened through this endpoint
 * (front-end fallback path when Profile._id cannot be resolved), also) —
 * additionally syncs loginId/password/membershipTier/membershipStatus onto the User
 * document so credential changes actually work for logins).
 */
export async function updateRegistrationByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const patch = req.body || {};

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // ─────────────────── 1. Login ID change validation (if this registration
    // is already approved → unique loginId is enforced on User — just in case
    // admin opened this endpoint via fallback).
    let newLoginId = null;
    if (typeof patch.loginId === "string" && patch.loginId.trim().length) {
      newLoginId = patch.loginId.trim();
      if (!/^[A-Za-z0-9_\-]{3,32}$/.test(newLoginId)) {
        return res.status(400).json({
          error:
            "Invalid Login ID. Use 3-32 letters, digits, hyphen or underscore (no spaces).",
        });
      }
      const existingUser = await User.findOne({
        registrationId: { $ne: registration._id },
        loginId: new RegExp(
          "^" + newLoginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          "i",
        ),
      });
      if (existingUser) {
        return res.status(409).json({
          error: "This Login ID is already in use by another member.",
        });
      }
    }

    // ─────────────────── 2. Password change validation & hashing
    const newPassword =
      typeof patch.password === "string" && patch.password.length
        ? patch.password
        : null;
    if (
      newPassword !== null &&
      (newPassword.length < 6 || newPassword.length > 64)
    ) {
      return res.status(400).json({
        error: "Password must be between 6 and 64 characters long.",
      });
    }

    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "gender",
      "age",
      "height",
      "location",
      "nationality",
      "ethnicity",
      "languages",
      "disability",
      "maritalStatus",
      "sect",
      "hijabi",
      "beardStyle",
      "religiousExpectations",
      "education",
      "occupation",
      "annualIncome",
      "smoker",
      "drivingLicence",
      "willingToRelocate",
      "hobbies",
      "secondWife",
      "aboutMe",
      "partnerEducation",
      "partnerOccupation",
      "partnerSect",
      "partnerReligiousPractice",
      "partnerIslamicValues",
      "partnerAgeRange",
      "partnerEthnicity",
      "partnerLivingArrangement",
      "partnerWillingRelocate",
      "openToDivorcee",
      "openToWidow",
      "acceptChildren",
      "partnerDescription",
      "otherInfo",
      "plan",
      "isPaid",
      "isActive",
    ];
    for (const k of fields) {
      if (patch[k] !== undefined) registration[k] = patch[k];
    }
    registration.updatedBy =
      (req.user && (req.user._id || req.user.id)) || null;
    registration.updatedAt = new Date();
    await registration.save();

    // ─────────────────── 3. If already approved → also sync to Profile + User docs.
    // This mirrors updateProfileByAdmin so edits apply via fallback path also.
    if (registration.status === "approved") {
      // ── Profile doc (dual-source Dashboard fallback → keep in sync)
      const profile = await Profile.findOne({
        registrationId: registration._id,
      });
      if (profile) {
        for (const k of fields) {
          if (patch[k] !== undefined) profile[k] = patch[k];
        }
        profile.updatedBy = registration.updatedBy;
        profile.updatedAt = registration.updatedAt;
        await profile.save();
      }

      // ── User doc (loginId, password, tier, status). Password field has
      // select:false on the schema but we can SET directly on document and
      // call save() — Mongoose stores it normally, next login compare works.
      const user = await User.findOne({ registrationId: registration._id });
      if (user) {
        if (newLoginId) user.loginId = newLoginId;
        if (newPassword) user.password = newPassword;
        if (patch.membershipTier) user.membershipTier = patch.membershipTier;
        if (patch.membershipStatus)
          user.membershipStatus = patch.membershipStatus;
        await user.save();
      }
    }

    const updatedFields = fields.filter((k) => patch[k] !== undefined);
    if (newLoginId) updatedFields.push("loginId");
    if (newPassword) updatedFields.push("password");
    if (patch.membershipTier) updatedFields.push("membershipTier");
    if (patch.membershipStatus) updatedFields.push("membershipStatus");

    res.json({
      message: "Registration updated successfully",
      registrationId: registration._id,
      updatedFields,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/registrations/:id
 * Admin — DELETE a pending/rejected registration (no profile/user yet exists).
 *
 * SAFETY GUARD: If this registration has already been approved (and Profile +
 * User docs exist), refuse with 400 and tell admin to use /admin/profiles/:id
 * delete endpoint instead (the cascade version that also removes Profile + User
 * + their proposal visibility + login account cleanly in one step).
 */
export async function deleteRegistrationByAdmin(req, res, next) {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }
    if (registration.status === "approved") {
      return res.status(400).json({
        error:
          "This registration is already approved. Delete via the Profile menu (DELETE /admin/profiles/) to remove login + profile + registration together.",
      });
    }

    const email = registration.email;
    const name = [registration.firstName, registration.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    await Registration.deleteOne({ _id: id });

    res.json({
      message: "Registration deleted permanently",
      registrationId: registration._id,
      name,
      email,
      statusBeforeDelete: registration.status,
    });
  } catch (err) {
    next(err);
  }
}
