import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { connect, disconnect, ping } from "./index.js";
import { createIndexes } from "./indexes.js";
import { COLLECTIONS } from "./collections.js";
import { getDb } from "./index.js";
// Load .env from repo root (packages/db → ../.. → repo root)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });
async function main() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || "gymora_dev";
    if (!uri) {
        console.error("✗ MONGODB_URI not set. Copy .env.example → .env at repo root.");
        process.exit(1);
    }
    console.log("→ Connecting to MongoDB…");
    await connect(uri, dbName);
    const alive = await ping();
    if (!alive)
        throw new Error("Ping failed");
    console.log(`✓ Connected to ${dbName}`);
    console.log("→ Creating indexes…");
    await createIndexes(getDb());
    console.log("✓ createIndexes() completed");
    // Verify each expected index exists
    const expected = {
        [COLLECTIONS.GYMS]: [
            "gyms_email_unique",
            "gyms_status",
            "gyms_trial_expires",
            "gyms_created_desc",
        ],
        [COLLECTIONS.USERS]: ["users_email_unique", "users_gym_role"],
        [COLLECTIONS.MEMBERS]: [
            "members_gym_status",
            "members_gym_expiry",
            "members_gym_phone",
            "members_gym_created",
        ],
        [COLLECTIONS.MEMBERSHIP_PLANS]: ["plans_gym_active"],
        [COLLECTIONS.PAYMENTS]: ["payments_gym_date", "payments_gym_member"],
        [COLLECTIONS.MEMBERSHIP_HISTORY]: ["history_gym_member"],
        [COLLECTIONS.LICENCE_PAYMENTS]: [
            "licence_order_unique",
            "licence_payment_unique_sparse",
            "licence_gym_created",
        ],
        [COLLECTIONS.WEBHOOK_EVENTS]: ["webhook_event_unique"],
    };
    let fail = 0;
    for (const [coll, names] of Object.entries(expected)) {
        const existing = await getDb().collection(coll).indexes();
        const existingNames = existing.map((i) => i.name);
        for (const n of names) {
            if (existingNames.includes(n)) {
                console.log(`  ✓ ${coll}.${n}`);
            }
            else {
                console.error(`  ✗ MISSING ${coll}.${n}`);
                fail++;
            }
        }
    }
    await disconnect();
    if (fail > 0) {
        console.error(`\n✗ ${fail} index(es) missing`);
        process.exit(1);
    }
    console.log("\n✓ All expected indexes present. Phase 1 DB test PASSED.");
}
main().catch((e) => {
    console.error("✗ Test failed:", e);
    process.exit(1);
});
