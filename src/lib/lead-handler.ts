import { requestSchema, type LeadInput } from "./lead-schema";
import { IdempotencyConflictError, RateLimitError } from "./lead-errors";

export type SaveLead = (input: LeadInput, requestId: string) => Promise<{ id: string; replayed: boolean }>;
const MAX_BYTES = 16 * 1024;

function json(body: unknown, status: number, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

// A streaming limit also protects requests that omit or lie about Content-Length.
async function readBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new RangeError("BODY_TOO_LARGE");
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export function createLeadHandler(saveLead: SaveLead) {
  return async function POST(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    const url = new URL(request.url);
    // Next.js can normalize request.url to localhost behind its local server.
    // Host is the routed HTTP authority; do not trust a client-supplied forwarded host.
    const expectedOrigin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
    if ((origin && origin !== expectedOrigin) || request.headers.get("sec-fetch-site") === "cross-site") {
      return json({ ok: false, error: "Bu kaynaktan gönderim kabul edilmiyor." }, 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return json({ ok: false, error: "İstek JSON biçiminde olmalı." }, 415);
    }
    if (Number(request.headers.get("content-length")) > MAX_BYTES) {
      return json({ ok: false, error: "Gönderilen veri çok büyük." }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(await readBody(request));
    } catch (error) {
      return json({ ok: false, error: error instanceof RangeError ? "Gönderilen veri çok büyük." : "İstek okunamadı. Lütfen tekrar deneyin." }, error instanceof RangeError ? 413 : 400);
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Lütfen formdaki bilgileri kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors }, 400);
    }
    const { requestId, website: _website, ...input } = parsed.data;
    void _website;
    try {
      const result = await saveLead(input, requestId);
      // Never acknowledge an insert unless storage returns a concrete record ID.
      if (!result.id) throw new Error("EMPTY_RECORD_ID");
      return json({ ok: true, id: result.id }, result.replayed ? 200 : 201);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return json({ ok: false, error: "Bu e-posta ile kısa sürede çok sayıda talep iletildi. 10 dakika sonra tekrar deneyin." }, 429, { "Retry-After": "600" });
      }
      if (error instanceof IdempotencyConflictError) {
        return json({ ok: false, error: "İstek kimliği farklı bilgilerle kullanılmış. Sayfayı yenileyip tekrar deneyin." }, 409);
      }
      // No request contents, credentials or provider error messages in logs/responses.
      console.error("lead_save_failed");
      return json({ ok: false, error: "Kaydı şu anda doğrulayamıyoruz. Bilgileriniz formda duruyor; lütfen tekrar deneyin." }, 503);
    }
  };
}
