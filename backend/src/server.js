import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";
import compression from "compression";
import { mongoSanitize } from "./middleware/sanitize.js";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/database.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const app = express();

// ── Security & core middleware ──
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize);
app.use(hpp());
app.use(compression());
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Rate limit all API routes ──
app.use("/api", apiLimiter);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Route mounting ──
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profiles", profileRoutes);

// ── 404 + error handler (must be last) ──
app.use(notFound);
app.use(errorHandler);

// ── Boot (skip auto-start when imported by tests) ──
const PORT = process.env.PORT || 5000;

export async function startServer() {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`[Server] PerfectRishta API running on port ${PORT}`);
    console.log(
      `[Server] Environment: ${process.env.NODE_ENV || "development"}`,
    );
  });
}

// Only auto-start when run directly (not imported by vitest)
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
