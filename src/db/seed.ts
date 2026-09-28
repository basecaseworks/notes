import "dotenv/config";
import { sql } from "@/db/client";

async function seed() {
  await sql`select 1`;
  console.log("Database is ready. Notes are private, so no sample rows were inserted.");
  await sql.end();
}

seed().catch(async (error) => {
  console.error("Could not verify the database.", error);
  await sql.end({ timeout: 1 }).catch(() => undefined);
  process.exitCode = 1;
});
