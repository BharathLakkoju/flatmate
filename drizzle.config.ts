import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// drizzle-kit needs the direct Supabase connection (port 5432), not the pooler (port 6543)
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
} satisfies Config;
