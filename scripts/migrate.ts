import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local", quiet: true });
const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL is required for migration.");

// Supabase's database uses its own public CA. Verify both chain and hostname.
const verifiedUrl = new URL(connectionString);
verifiedUrl.searchParams.set("sslmode", "verify-full");
verifiedUrl.searchParams.set("sslrootcert", resolve("certs/supabase-ca.crt"));
const client = new pg.Client({ connectionString: verifiedUrl.toString(), connectionTimeoutMillis: 15_000 });
try {
  await client.connect();
  await client.query(await readFile("supabase/migrations/001_leads.sql", "utf8"));
  const { rows } = await client.query("select to_regclass('public.leads') as table_name");
  console.log("Migration applied:", rows[0].table_name);
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
  console.error(`Migration failed (${code}). Check connection access and migration SQL; no secrets were logged.`);
  process.exitCode = 1;
} finally {
  await client.end();
}
