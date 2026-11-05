import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { connect, disconnect } from "@gymora/db";
import { getDb } from "@gymora/db";
import { UserRepo } from "../repositories/users.js";
import { hashPassword } from "../lib/password.js";
import { ROLES } from "@gymora/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

async function main() {
  const uri = process.env.MONGODB_URI!;
  const dbName = process.env.MONGODB_DB || "gymora_dev";
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || "Superadmin";

  if (!email || !password) {
    console.error("✗ Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env");
    process.exit(1);
  }

  await connect(uri, dbName);
  const users = new UserRepo(getDb());
  const existing = await users.findByEmail(email);
  if (existing) {
    console.log(`✓ Superadmin already exists: ${email}`);
    await disconnect();
    return;
  }
  const passwordHash = await hashPassword(password);
  await users.create({
    gymId: null,
    role: ROLES.SUPERADMIN,
    name,
    email: email.toLowerCase(),
    passwordHash,
    status: "ACTIVE",
    permissions: [],
    lastLoginAt: null,
  });
  console.log(`✓ Superadmin created: ${email}`);
  await disconnect();
}
main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});