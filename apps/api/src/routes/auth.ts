import { Hono } from "hono";
import { promises as dns } from "node:dns";
import { createHash, randomBytes } from "node:crypto";
import {
  gymRegistrationSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  GYM_STATUS,
  ROLES,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { UserRepo } from "../repositories/users.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt.js";
import { sendEmail } from "../lib/email.js";
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
} from "../templates/password-reset.js";
import { env } from "../env.js";
import { HTTPException } from "hono/http-exception";
import { loginRateLimiter } from "../middleware/rateLimit.js";

export const authRoutes = new Hono();

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_RATE_LIMIT_MAX = 3; // 3 per email per hour

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function hasMxRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

// ─── Register gym ───────────────────────────────────────
authRoutes.post("/register-gym", async (c) => {
  const body = await c.req.json();
  const input = gymRegistrationSchema.parse(body);
  const db = getDb();
  const gyms = new GymRepo(db);
  const users = new UserRepo(db);

  const existingGym = await gyms.findByEmail(input.email);
  const existingUser = await users.findByEmail(input.email);
  if (existingGym || existingUser) {
    throw new HTTPException(409, { message: "Email already registered" });
  }

  const hasMx = await hasMxRecord(input.email);
  if (!hasMx) {
    throw new HTTPException(400, {
      message: "Email domain cannot receive mail. Please check the address.",
    });
  }

  const passwordHash = await hashPassword(input.password);

  const gymRes = await gyms.create({
    name: input.gymName,
    ownerName: input.ownerName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    address: input.address,
    logoUrl: null,
    status: GYM_STATUS.PENDING_APPROVAL,
    trialStartAt: null,
    trialExpiresAt: null,
    licencePurchasedAt: null,
    licenceExpiresAt: null,
    activationCodeHash: null,
    activationCodeExpiresAt: null,
    activationCodeUsedAt: null,
    suspendedReason: null,
    notes: null,
  });

  await users.create({
    gymId: gymRes.insertedId,
    role: ROLES.OWNER,
    name: input.ownerName,
    email: input.email.toLowerCase(),
    passwordHash,
    status: "ACTIVE",
    permissions: [],
    lastLoginAt: null,
  });

  return c.json(
    {
      ok: true,
      message: "Registration received. Awaiting Superadmin approval.",
      gymId: gymRes.insertedId.toString(),
    },
    201
  );
});

// ─── Login ──────────────────────────────────────────────
authRoutes.post("/login", loginRateLimiter, async (c) => {
  const body = await c.req.json();
  const input = loginSchema.parse(body);
  const db = getDb();
  const users = new UserRepo(db);
  const gyms = new GymRepo(db);

  const user = await users.findByEmail(input.email);
  if (!user || user.status !== "ACTIVE") {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new HTTPException(401, { message: "Invalid credentials" });

  let gymStatus: string | null = null;
  if (user.gymId) {
    const gym = await gyms.findById(user.gymId.toString());
    if (!gym) throw new HTTPException(401, { message: "Gym missing" });
    gymStatus = gym.status;
  }

  const payload = {
    sub: user._id!.toString(),
    role: user.role,
    gymId: user.gymId ? user.gymId.toString() : null,
    permissions: user.permissions || [],
  };

  await users.touchLogin(user._id!);

  return c.json({
    ok: true,
    accessToken: signAccess(payload),
    refreshToken: signRefresh(payload),
    user: {
      id: payload.sub,
      role: user.role,
      gymId: payload.gymId,
      name: user.name,
      email: user.email,
      permissions: user.permissions || [],
    },
    gymStatus,
  });
});

// ─── Refresh ────────────────────────────────────────────
authRoutes.post("/refresh", async (c) => {
  const body = await c.req.json();
  const refreshToken = body?.refreshToken;
  if (!refreshToken) {
    throw new HTTPException(400, { message: "Missing refreshToken" });
  }
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw new HTTPException(401, { message: "Invalid refresh token" });
  }
  const users = new UserRepo(getDb());
  const user = await users.findById(payload.sub);
  if (!user || user.status !== "ACTIVE") {
    throw new HTTPException(401, { message: "User inactive" });
  }
  const newAccess = signAccess({
    sub: payload.sub,
    role: payload.role,
    gymId: payload.gymId,
    permissions: user.permissions || [],
  });
  return c.json({ ok: true, accessToken: newAccess });
});

// ─── Forgot password ────────────────────────────────────
authRoutes.post("/forgot-password", async (c) => {
  const body = await c.req.json();
  const input = forgotPasswordSchema.parse(body);
  const db = getDb();
  const users = new UserRepo(db);

  // Always return the same response (don't leak if email exists)
  const genericResponse = {
    ok: true,
    message:
      "If an account exists for this email, you'll receive a password reset link within a few minutes.",
  };

  const user = await users.findByEmail(input.email);
  if (!user || user.status !== "ACTIVE") {
    // Still return success to avoid email enumeration
    return c.json(genericResponse);
  }

  // Rate limit: max 3 reset requests per email per hour
  const resetCollection = db.collection("password_resets");
  const recent = await resetCollection.countDocuments({
    email: input.email,
    createdAt: { $gte: new Date(Date.now() - PASSWORD_RESET_RATE_LIMIT_MS) },
  });
  if (recent >= PASSWORD_RESET_RATE_LIMIT_MAX) {
    // Still return success but don't send another email
    console.warn(
      `[forgot-password] rate limit hit for ${input.email} (${recent} in last hour)`
    );
    return c.json(genericResponse);
  }

  // Generate token
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await resetCollection.insertOne({
    email: input.email,
    tokenHash,
    userId: user._id,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  // Get gym name for personalization
  let gymName = "your gym";
  if (user.gymId) {
    const gym = await db
      .collection("gyms")
      .findOne({ _id: user.gymId });
    if (gym) gymName = (gym as any).name || gymName;
  }

  const resetUrl = `${env.WEB_APP_URL}/reset-password?token=${rawToken}`;

  sendEmail({
    to: user.email,
    toName: user.name,
    subject: "Reset your Palastra password",
    htmlContent: passwordResetEmailHtml({
      gymName,
      ownerName: user.name,
      resetUrl,
    }),
    textContent: passwordResetEmailText({
      gymName,
      ownerName: user.name,
      resetUrl,
    }),
  }).catch((err) => console.error("[forgot-password] email failed:", err));

  return c.json(genericResponse);
});

// ─── Reset password ─────────────────────────────────────
authRoutes.post("/reset-password", async (c) => {
  const body = await c.req.json();
  const input = resetPasswordSchema.parse(body);
  const db = getDb();
  const users = new UserRepo(db);

  const tokenHash = hashResetToken(input.token);
  const resetCollection = db.collection("password_resets");

  const reset = await resetCollection.findOne({ tokenHash });
  if (!reset) {
    throw new HTTPException(400, {
      message: "Invalid or expired reset link. Please request a new one.",
    });
  }
  if (reset.usedAt) {
    throw new HTTPException(400, {
      message: "This reset link has already been used.",
    });
  }
  if (new Date(reset.expiresAt) < new Date()) {
    throw new HTTPException(400, {
      message: "Reset link has expired. Please request a new one.",
    });
  }

  // Update user's password
  const passwordHash = await hashPassword(input.password);
  await db
    .collection("users")
    .updateOne(
      { _id: reset.userId },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

  // Mark token as used
  await resetCollection.updateOne(
    { _id: reset._id },
    { $set: { usedAt: new Date() } }
  );

  // Invalidate any other outstanding reset tokens for this user
  await resetCollection.updateMany(
    { userId: reset.userId, usedAt: null },
    { $set: { usedAt: new Date() } }
  );

  return c.json({
    ok: true,
    message: "Password reset successful. You can now log in with your new password.",
  });
});
