/**
 * Remove "in_progress" from the task_status enum.
 * Usage: npx tsx src/lib/db/migrate-remove-in-progress.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Move any in_progress tasks to pending
  await sql`UPDATE tasks SET status = 'pending' WHERE status = 'in_progress'`;
  console.log("Updated in_progress rows to pending");

  // Rebuild enum without in_progress (clean up any leftover from partial run)
  // First check if column currently uses task_status_old (from a previous partial run)
  await sql.unsafe("DROP TYPE IF EXISTS task_status_new");
  
  // Create the new enum
  await sql.unsafe("CREATE TYPE task_status_new AS ENUM ('pending', 'completed')");
  
  // Drop default, convert column, set default
  await sql.unsafe("ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT");
  await sql.unsafe(
    "ALTER TABLE tasks ALTER COLUMN status TYPE task_status_new USING status::text::task_status_new"
  );
  await sql.unsafe("ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending'");
  
  // Drop old type(s) and rename new one
  await sql.unsafe("DROP TYPE IF EXISTS task_status_old CASCADE");
  await sql.unsafe("DROP TYPE IF EXISTS task_status CASCADE");
  await sql.unsafe("ALTER TYPE task_status_new RENAME TO task_status");
  console.log("Dropped in_progress from task_status enum");

  await sql.end();
}

main().catch((e) => {
  console.error("Migration error:", e.message);
  sql.end();
  process.exit(1);
});
