import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error.js";
import { connect, ping } from "@gymora/db";
import { authRoutes } from "./routes/auth.js";
import { activationRoutes } from "./routes/activation.js";
import { adminRoutes } from "./routes/admin.js";
import { planRoutes } from "./routes/plans.js";
import { memberRoutes } from "./routes/members.js";
import { paymentRoutes } from "./routes/payments.js";
import { reportsRoutes } from "./routes/reports.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { profileRoutes } from "./routes/profile.js";

const app = new Hono();

app.use("*", cors());
app.onError(errorHandler);

app.get("/health", async (c) => {
  const dbAlive = await ping();
  return c.json({
    ok: true,
    service: "gymora-api",
    env: env.NODE_ENV,
    db: dbAlive ? "connected" : "disconnected",
    ts: new Date().toISOString(),
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/activation", activationRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/gym/plans", planRoutes);
app.route("/api/gym/members", memberRoutes);
app.route("/api/gym/payments", paymentRoutes);
app.route("/api/gym/reports", reportsRoutes);
app.route("/api/gym/dashboard", dashboardRoutes);
app.route("/api/gym/profile", profileRoutes);

app.get("/", (c) => c.text("Gymora API"));

async function main() {
  console.log("→ Connecting to MongoDB…");
  await connect(env.MONGODB_URI, env.MONGODB_DB);
  console.log("✓ MongoDB connected");
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`✓ Gymora API listening on http://localhost:${info.port}`);
  });
}
main().catch((e) => {
  console.error("✗ Startup failed:", e);
  process.exit(1);
});