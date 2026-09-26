import { Router } from "express";
import { body } from "express-validator";
import {
  submitRegistration,
  login,
  adminLogin,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  authLimiter,
  registerLimiter,
  slowDownMiddleware,
} from "../middleware/rateLimiter.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

// ── POST /api/auth/register — submit matrimonial profile form ──
router.post(
  "/register",
  registerLimiter,
  slowDownMiddleware,
  [
    body("gender").isIn(["Male", "Female"]).withMessage("Gender is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("maritalStatus").notEmpty().withMessage("Marital status is required"),
    body("confirmInfo")
      .custom((v) => v === true)
      .withMessage("You must confirm your information is correct"),
  ],
  handleValidationErrors,
  submitRegistration,
);

// ── POST /api/auth/login — member login ──
router.post(
  "/login",
  authLimiter,
  slowDownMiddleware,
  [
    body("loginId").notEmpty().withMessage("Login ID is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleValidationErrors,
  login,
);

// ── POST /api/auth/admin-login — admin login ──
router.post(
  "/admin-login",
  authLimiter,
  slowDownMiddleware,
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  adminLogin,
);

// ── GET /api/auth/me — current authenticated user ──
router.get("/me", protect, getMe);

export default router;
