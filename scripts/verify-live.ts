import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local", quiet: true });
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(supabaseUrl && serviceKey, "Supabase credentials are required to independently verify persistence.");
const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const email = `verification-${randomUUID()}@example.com`;
const payload = {
  name: "Deniz Test",
  email,
  service: "knowledge",
  description: "Kurgusal ekibimiz için şirket içi belgelerde arama yapmak istiyoruz.",
  requestId: randomUUID(),
  website: "",
};

async function post(body: unknown) {
  return fetch(new URL("/api/leads", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: new URL(baseUrl).origin },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
}

async function records() {
  // This request bypasses our web API and reads the actual persistent database.
  const { data, error } = await db.from("leads").select("id, name, email, service, description, request_id").eq("email", email);
  assert.equal(error, null, "Independent database read failed");
  return data!;
}

const created = await post(payload);
assert.equal(created.status, 201, "A valid request must be committed before HTTP 201");
const result = await created.json();
assert.equal(result.ok, true);
const rows = await records();
assert.equal(rows.length, 1);
assert.equal(rows[0].id, result.id);
assert.equal(rows[0].description, payload.description);

const replay = await post(payload);
assert.equal(replay.status, 200);
assert.equal((await replay.json()).id, result.id);
assert.equal((await records()).length, 1, "Replaying a request must not create duplicates");

const conflict = await post({ ...payload, description: "Aynı kimlikle farklı içerik gönderilmesi reddedilmelidir." });
assert.equal(conflict.status, 409);

for (const invalid of [
  { ...payload, requestId: randomUUID(), name: " " },
  { ...payload, requestId: randomUUID(), email: "invalid-address" },
  { ...payload, requestId: randomUUID(), service: "injected-service" },
  { ...payload, requestId: randomUUID(), description: "x".repeat(2001) },
]) {
  assert.equal((await post(invalid)).status, 400, "Server must reject invalid fields");
}
assert.equal((await records()).length, 1);

// Concurrent attempts use the real database's locks, not an in-memory limiter.
const concurrent = await Promise.all(Array.from({ length: 5 }, () => post({ ...payload, requestId: randomUUID() })));
assert.deepEqual(concurrent.map((r) => r.status).sort(), [201, 201, 201, 201, 429]);
assert.equal((await records()).length, 5);

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
let publicRead = "not checked (anonymous key absent)";
if (anonKey) {
  const anonymous = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anonymous.from("leads").select("id").eq("id", result.id);
  assert(error || data?.length === 0, "Anonymous users must not be able to read lead records");
  publicRead = "denied";
}

console.log(JSON.stringify({
  baseUrl,
  testedAt: new Date().toISOString(),
  recordId: result.id,
  checks: ["persistent insert verified independently", "idempotent retry", "conflicting replay rejected", "server validation", "atomic concurrent rate limit"],
  anonymousRead: publicRead,
  syntheticRowsCreated: 5,
}, null, 2));
