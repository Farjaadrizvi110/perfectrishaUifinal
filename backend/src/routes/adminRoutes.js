import { Router } from "express";
import {
  getRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  getMembers,
  updateMembership,
  getStats,
  getProfileForAdmin,
  updateProfileByAdmin,
  deleteProfileByAdmin,
  updateRegistrationByAdmin,
  deleteRegistrationByAdmin,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ── Registrations ──
router.get("/registrations", getRegistrations);
router.get("/registrations/:id", getRegistrationById);
router.post("/registrations/:id/approve", approveRegistration);
router.post("/registrations/:id/reject", rejectRegistration);
router.patch("/registrations/:id", updateRegistrationByAdmin);
router.delete("/registrations/:id", deleteRegistrationByAdmin);

// ── Members ──
router.get("/members", getMembers);
router.patch("/members/:id/membership", updateMembership);

// ── Stats ──
router.get("/stats", getStats);

// ── Profiles: Admin Edit + Delete (cascade) ──
router.get("/profiles/:id", getProfileForAdmin);
router.patch("/profiles/:id", updateProfileByAdmin);
router.delete("/profiles/:id", deleteProfileByAdmin);

export default router;
