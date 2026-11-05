import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error.js";
import { connect, ping } from "@gymora/db";
import { authRoutes } from "./routes/auth.js";
import { activationRoutes } from "./routes/activation.js";
import { adminRoutes } from "./routes/admin.js";

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