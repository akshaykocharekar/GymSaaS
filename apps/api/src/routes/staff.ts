import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  ROLES,
  createStaffSchema,
  updateStaffPermissionsSchema,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { UserRepo } from "../repositories/users.js";
import { hashPassword } from "../lib/password.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

const MAX_STAFF_PER_GYM = 10;

export const staffRoutes = new Hono();

staffRoutes.use("*", requireAuth, requireRole(ROLES.OWNER));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

staffRoutes.get("/", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const staff = await db
    .collection("users")
    .find({ gymId, role: ROLES.STAFF })
    .sort({ createdAt: -1 })
    .toArray();

  return c.json({
    ok: true,
    maxAllowed: MAX_STAFF_PER_GYM,
    staff: staff.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      status: s.status,
      permissions: s.permissions || [],
      lastLoginAt: s.lastLoginAt,
      createdAt: s.createdAt,
    })),
  });
});

staffRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const input = createStaffSchema.parse(body);
  const db = getDb();
  const gymId = getGymId(c);
  const users = new UserRepo(db);

  // Hard limit: 10 active staff per gym
  const activeCount = await db
    .collection("users")
    .countDocuments({ gymId, role: ROLES.STAFF, status: "ACTIVE" });
  if (activeCount >= MAX_STAFF_PER_GYM) {
    throw new HTTPException(409, {
      message: `Only ${MAX_STAFF_PER_GYM} staff accounts allowed per gym`,
    });
  }

  const existing = await users.findByEmail(input.email);
  if (existing) {
    throw new HTTPException(409, { message: "Email already in use" });
  }

  const passwordHash = await hashPassword(input.password);

  const res = await users.create({
    gymId,
    role: ROLES.STAFF,
    name: input.name,
    email: input.email,
    passwordHash,
    status: "ACTIVE",
    permissions: input.permissions,
    lastLoginAt: null,
  });

  return c.json({ ok: true, id: res.insertedId.toString() }, 201);
});

staffRoutes.patch("/:id", async (c) => {
  const body = await c.req.json();
  const input = updateStaffPermissionsSchema.parse(body);
  const db = getDb();
  const gymId = getGymId(c);

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(c.req.param("id")), gymId, role: ROLES.STAFF },
    { $set: { permissions: input.permissions, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new HTTPException(404, { message: "Staff not found" });
  }
  return c.json({ ok: true });
});

staffRoutes.delete("/:id", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(c.req.param("id")), gymId, role: ROLES.STAFF },
    { $set: { status: "DISABLED", updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new HTTPException(404, { message: "Staff not found" });
  }
  return c.json({ ok: true });
});