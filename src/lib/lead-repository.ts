import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { IdempotencyConflictError, RateLimitError } from "./lead-errors";
import type { SaveLead } from "./lead-handler";

export const saveLead: SaveLead = async (input, requestId) => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage is not configured");

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000), cache: "no-store" }),
    },
  });
  const payloadHash = createHash("sha256").update(JSON.stringify([
    input.name, input.email, input.service, input.description,
  ])).digest("hex");

  const { data, error } = await client.rpc("submit_lead", {
    p_request_id: requestId,
    p_payload_hash: payloadHash,
    p_name: input.name,
    p_email: input.email,
    p_service: input.service,
    p_description: input.description,
  });

  if (error?.message === "RATE_LIMITED") throw new RateLimitError();
  if (error?.message === "IDEMPOTENCY_CONFLICT") throw new IdempotencyConflictError();
  if (error || !data || typeof data.id !== "string" || typeof data.replayed !== "boolean") {
    throw new Error("Storage operation failed");
  }
  return { id: data.id, replayed: data.replayed };
};
