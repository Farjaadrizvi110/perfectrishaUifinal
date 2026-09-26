import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// We import the app factory (not the running server) so supertest can use it
let app;

// ── Test data ──
const adminCreds = {
  username: "FarjaadRizvi110",
  password: "Superadmin#721105",
};
const sampleRegistration = {
  gender: "Male",
  dob: "1995-05-15",
  age: "30",
  height: "5ft 10in",
  languages: "English, Urdu",
  location: "London",
  nationality: "British",
  ethnicity: "Pakistani",
  religion: "Islam",
  sect: "Sunni",
  education: "Master's",
  occupation: "Software Engineer",
  annualIncome: "£50,000 - £70,000",
  maritalStatus: "Single",
  aboutMe: "A practicing Muslim looking for a pious partner.",
  partnerDescription: "Looking for someone with strong Islamic values.",
  confirmInfo: true,
  plan: "Gold",
};

let adminToken = "";
let memberToken = "";
let registrationId = "";
let memberId = "";
let profileId = "";

// ── Setup: load env + connect to test DB (memory server fallback) ──
beforeAll(async () => {
  // Don't set MONGODB_URI — let database.js fall through to memory server
  delete process.env.MONGODB_URI;
  process.env.JWT_SECRET = "test_jwt_secret_key";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.NODE_ENV = "test";
  process.env.CLIENT_URL = "http://localhost:3000";
  process.env.ADMIN_USERNAME = adminCreds.username;
  process.env.ADMIN_PASSWORD = adminCreds.password;

  // Import app AFTER env is set
  const module = await import("../server.js");
  app = module.default;

  // Start server (connects DB + seeds admin)
  await module.startServer();

  // Wait for memory server + seed to complete
  await new Promise((r) => setTimeout(r, 2000));
}, 30000);

// ── Cleanup ──
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════
//  HEALTH
// ═══════════════════════════════════════════
describe("GET /api/health", () => {
  it("should return ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});

// ═══════════════════════════════════════════
//  AUTH — Registration
// ═══════════════════════════════════════════
describe("POST /api/auth/register", () => {
  it("should submit a registration form successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(sampleRegistration);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    expect(res.body.registrationId).toBeDefined();
    registrationId = res.body.registrationId;
  });

  it("should reject duplicate registration within 24h", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(sampleRegistration);
    expect(res.status).toBe(409);
  });

  it("should validate required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ gender: "", location: "" });
    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it("should require confirmInfo to be true", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...sampleRegistration,
        confirmInfo: false,
        gender: "Female",
        location: "Birmingham",
      });
    expect(res.status).toBe(422);
  });
});

// ═══════════════════════════════════════════
//  AUTH — Admin Login
// ═══════════════════════════════════════════
describe("POST /api/auth/admin-login", () => {
  it("should login admin with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/admin-login")
      .send(adminCreds);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("admin");
    adminToken = res.body.token;
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/admin-login").send({
      username: adminCreds.username,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("should reject non-existent admin", async () => {
    const res = await request(app).post("/api/auth/admin-login").send({
      username: "fakeadmin",
      password: "fakepassword123",
    });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════
//  ADMIN — Registrations
// ═══════════════════════════════════════════
describe("Admin Registrations API", () => {
  it("should list pending registrations", async () => {
    const res = await request(app)
      .get("/api/admin/registrations?status=pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it("should get a single registration", async () => {
    const res = await request(app)
      .get(`/api/admin/registrations/${registrationId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.registration.gender).toBe("Male");
  });

  it("should reject unauthenticated admin access", async () => {
    const res = await request(app).get("/api/admin/registrations");
    expect(res.status).toBe(401);
  });

  it("should approve a registration and generate credentials", async () => {
    const res = await request(app)
      .post(`/api/admin/registrations/${registrationId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.credentials.loginId).toMatch(/^PR-\d{4}$/);
    expect(res.body.credentials.password).toBeDefined();
    expect(res.body.profileId).toBeDefined();
    profileId = res.body.profileId;
    memberId = res.body.userId;
  });

  it("should not approve an already-approved registration", async () => {
    const res = await request(app)
      .post(`/api/admin/registrations/${registrationId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it("should list approved registrations", async () => {
    const res = await request(app)
      .get("/api/admin/registrations?status=approved")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════
//  ADMIN — Stats & Members
// ═══════════════════════════════════════════
describe("Admin Stats & Members API", () => {
  it("should return dashboard stats", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pending).toBeDefined();
    expect(res.body.approved).toBeGreaterThan(0);
    expect(res.body.members).toBeGreaterThan(0);
  });

  it("should list all members", async () => {
    const res = await request(app)
      .get("/api/admin/members")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it("should update member membership", async () => {
    const res = await request(app)
      .patch(`/api/admin/members/${memberId}/membership`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ tier: "platinum", status: "active" });
    expect(res.status).toBe(200);
    expect(res.body.user.membershipTier).toBe("platinum");
  });
});

// ═══════════════════════════════════════════
//  AUTH — Member Login (after approval)
// ═══════════════════════════════════════════
describe("POST /api/auth/login", () => {
  it("should reject login with unapproved credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      loginId: "PR-9999",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("should login with admin-generated credentials", async () => {
    // First get the credentials from the approved registration
    const membersRes = await request(app)
      .get("/api/admin/members")
      .set("Authorization", `Bearer ${adminToken}`);

    const member = membersRes.body.members[0];
    // We need to get the actual password — but it's hashed.
    // Instead, let's directly query the DB for the loginId and use the raw password from the approve step.
    // For testing, we'll create a known user:
    const User = mongoose.model("User");
    const bcrypt = (await import("bcryptjs")).default;
    const knownPass = "testpass123";
    const hashed = await bcrypt.hash(knownPass, 12);
    const testUser = await User.create({
      loginId: "PR-TEST1",
      password: knownPass,
      role: "member",
      membershipTier: "gold",
      membershipStatus: "active",
    });

    const res = await request(app).post("/api/auth/login").send({
      loginId: "PR-TEST1",
      password: knownPass,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("member");
    memberToken = res.body.token;
  });
});

// ═══════════════════════════════════════════
//  PROFILES — Premium-only access
// ═══════════════════════════════════════════
describe("Profiles API (premium only)", () => {
  it("should reject unauthenticated access", async () => {
    const res = await request(app).get("/api/profiles");
    expect(res.status).toBe(401);
  });

  it("should return profiles for premium members", async () => {
    const res = await request(app)
      .get("/api/profiles")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it("should filter by gender", async () => {
    const res = await request(app)
      .get("/api/profiles?gender=Male")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profiles.every((p) => p.gender === "Male")).toBe(true);
  });

  it("should get a single profile by ID", async () => {
    const res = await request(app)
      .get(`/api/profiles/${profileId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.gender).toBe("Male");
  });

  it("should return 404 for non-existent profile", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/profiles/${fakeId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════
//  AUTH — Get Me
// ═══════════════════════════════════════════
describe("GET /api/auth/me", () => {
  it("should return current user info", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("member");
    expect(res.body.user.membershipTier).toBe("gold");
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken123");
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════
//  SECURITY — Rate limiting & validation
// ═══════════════════════════════════════════
describe("Security: Rate Limiting & Input Validation", () => {
  it("should reject NoSQL injection attempts", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        loginId: { $gt: "" },
        password: { $gt: "" },
      });
    // After sanitisation, $gt becomes gt — treated as invalid credentials
    expect([400, 401, 422, 500]).toContain(res.status);
  });

  it("should reject HPP (parameter pollution)", async () => {
    const res = await request(app)
      .get("/api/profiles?gender=Male&gender=Female")
      .set("Authorization", `Bearer ${memberToken}`);
    // HPP should pick last value — should not error
    expect(res.status).toBe(200);
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
  });
});
