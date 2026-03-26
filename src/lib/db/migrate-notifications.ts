/**
 * Run this once to create the notifications table.
 * Usage: npx tsx src/lib/db/migrate-notifications.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
      actor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✅ notifications table created (or already exists)");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
