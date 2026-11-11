import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error.js";
import { trialGuard } from "./middleware/trialGuard.js";
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
import { licenceRoutes } from "./routes/licence.js";
import { staffRoutes } from "./routes/staff.js";
import { trainerRoutes } from "./routes/trainers.js";
import { payoutRoutes } from "./routes/payouts.js";
import { insightsRoutes } from "./routes/insights.js";
import { webhookRoutes } from "./routes/webhook.js";
import { startTrialCron } from "./lib/trialCron.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000", 
      "https://palastra.pages.dev", 
      "https://palastra.in"
    ],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.onError(errorHandler);

// ─── Health: fast, no DB ────────────────────────────────
app.get("/health", (c) => {
  return c.json({
    ok: true,
    service: "palastra-api",
    env: env.NODE_ENV,
    ts: new Date().toISOString(),
  });
});

// ─── Health DB: pings DB, used for readiness probes ─────
app.get("/health/db", async (c) => {
  const dbAlive = await ping();
  return c.json({
    ok: dbAlive,
    db: dbAlive ? "connected" : "disconnected",
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/activation", activationRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/webhooks", webhookRoutes);
app.route("/api/gym/licence", licenceRoutes);
app.route("/api/gym/profile", profileRoutes);

app.use("/api/gym/plans/*", trialGuard());
app.use("/api/gym/members/*", trialGuard());
app.use("/api/gym/payments/*", trialGuard());
app.use("/api/gym/reports/*", trialGuard());
app.use("/api/gym/staff/*", trialGuard());
app.use("/api/gym/trainers/*", trialGuard());
app.use("/api/gym/payouts/*", trialGuard());
app.use("/api/gym/insights/*", trialGuard());
app.route("/api/gym/plans", planRoutes);
app.route("/api/gym/members", memberRoutes);
app.route("/api/gym/payments", paymentRoutes);
app.route("/api/gym/reports", reportsRoutes);
app.route("/api/gym/dashboard", dashboardRoutes);
app.route("/api/gym/staff", staffRoutes);
app.route("/api/gym/trainers", trainerRoutes);
app.route("/api/gym/payouts", payoutRoutes);
app.route("/api/gym/insights", insightsRoutes);

app.get("/", (c) => c.text("Palastra API"));

async function main() {
  console.log("→ Connecting to MongoDB…");
  await connect(env.MONGODB_URI, env.MONGODB_DB);
  console.log("✓ MongoDB connected");
  startTrialCron();
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`✓ Palastra API listening on http://localhost:${info.port}`);
  });
}
main().catch((e) => {
  console.error("✗ Startup failed:", e);
  process.exit(1);
});
