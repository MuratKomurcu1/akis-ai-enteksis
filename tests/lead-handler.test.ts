import { describe, expect, it, vi } from "vitest";
import { createLeadHandler } from "@/lib/lead-handler";
import { IdempotencyConflictError, RateLimitError } from "@/lib/lead-errors";
import type { LeadInput } from "@/lib/lead-schema";

const requestId = "f29c5ca1-1c9c-4ef2-bdd3-67652214e23b";
const rowId = "8a06e5f6-58ed-40a7-9396-e0bc09267683";
const validBody = {
  name: "Kurgu Ada Test",
  email: "ada@example.com",
  service: "knowledge",
  description: "Bu kayıt yalnızca kurgusal kabul testi verisidir.",
  requestId,
  website: "",
};
const disallowedOrigins: Record<string, string>[] = [
  { origin: "https://untrusted.example" },
  { origin: "null" },
  { "sec-fetch-site": "cross-site" },
];

function makeRequest(body: unknown = validBody, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function setup() {
  const saveLead = vi.fn<(input: LeadInput, id: string) => Promise<{ id: string; replayed: boolean }>>()
    .mockResolvedValue({ id: rowId, replayed: false });
  return { saveLead, handle: createLeadHandler(saveLead) };
}

describe("POST handler: HTTP ve hata sözleşmesi (veritabanı yerine kontrollü bağımlılık)", () => {
  it("yalnız kayıt bağımlılığı tamamlandıktan sonra başarı döndürür", async () => {
    let completeSave!: (result: { id: string; replayed: boolean }) => void;
    const saveLead = vi.fn(() => new Promise<{ id: string; replayed: boolean }>((resolve) => {
      completeSave = resolve;
    }));
    const handle = createLeadHandler(saveLead);
    let responseCompleted = false;
    const pendingResponse = handle(makeRequest()).then((response) => {
      responseCompleted = true;
      return response;
    });
    await vi.waitFor(() => expect(saveLead).toHaveBeenCalledOnce());
    expect(responseCompleted).toBe(false);
    completeSave({ id: rowId, replayed: false });
    const response = await pendingResponse;
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ ok: true, id: rowId });
  });

  it("aynı isteğin tekrarında mevcut kayıt kimliğiyle 200 döndürür", async () => {
    const { saveLead, handle } = setup();
    saveLead.mockResolvedValue({ id: rowId, replayed: true });
    const response = await handle(makeRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, id: rowId });
  });

  it("aynı origin isteğinde doğrulanmış alanları ve istek kimliğini kayıt bağımlılığına geçirir", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(
      { ...validBody, name: "  Kurgu Ada Test  " },
      { origin: "http://localhost:3000", "sec-fetch-site": "same-origin" },
    ));
    expect(response.status).toBe(201);
    expect(saveLead).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
      service: validBody.service,
      description: validBody.description,
    }, requestId);
  });

  it("Next.js dahili URL'yi localhost yaptığında gerçek Host ve Origin eşleşmesini kabul eder", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(validBody, {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      "sec-fetch-site": "same-origin",
    }));
    expect(response.status).toBe(201);
    expect(saveLead).toHaveBeenCalledOnce();
  });

  it("Origin dahili URL ile eşleşse bile gerçek Host farklıysa isteği reddeder", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(validBody, {
      host: "127.0.0.1:3000",
      origin: "http://localhost:3000",
    }));
    expect(response.status).toBe(403);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("sahte x-forwarded-host başlığı farklı origin kontrolünü aşamaz", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(validBody, {
      host: "localhost:3000",
      origin: "https://untrusted.example",
      "x-forwarded-host": "untrusted.example",
      "x-forwarded-proto": "https",
    }));
    expect(response.status).toBe(403);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it.each(disallowedOrigins)("farklı origin/cross-site isteklerini kayıt yapmadan reddeder: %j", async (headers) => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(validBody, headers));
    expect(response.status).toBe(403);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("JSON dışı içerik türünü kayıt yapmadan reddeder", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest(validBody, { "content-type": "text/plain" }));
    expect(response.status).toBe(415);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("bozuk JSON gövdesine 400 döndürür", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(new Request("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{broken",
    }));
    expect(response.status).toBe(400);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it.each([undefined, "1"])("gövde boyutunu content-length değerine güvenmeden bayt olarak sınırlar (%s)", async (length) => {
    const { saveLead, handle } = setup();
    const headers: Record<string, string> = length ? { "content-length": length } : {};
    const response = await handle(makeRequest({ ...validBody, description: "ğ".repeat(9_000) }, headers));
    expect(response.status).toBe(413);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("alan doğrulama hatalarını 400 ile döndürür ve kayıt yapmaz", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest({ ...validBody, name: "", email: "invalid", service: "unknown" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.fieldErrors).toMatchObject({
      name: expect.any(Array), email: expect.any(Array), service: expect.any(Array),
    });
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("eksik kimlik ve doldurulmuş honeypot için kayıt yapmaz", async () => {
    const { saveLead, handle } = setup();
    const response = await handle(makeRequest({ ...validBody, requestId: undefined, website: "bot" }));
    expect(response.status).toBe(400);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("veritabanı hatasında 503 döndürür ve iç hata ayrıntılarını açığa çıkarmaz", async () => {
    const { saveLead, handle } = setup();
    saveLead.mockRejectedValue(new Error("postgresql://secret:password@database.invalid private_table SQL insert failed"));
    const response = await handle(makeRequest());
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.error).toEqual(expect.any(String));
    expect(body.id).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/secret|password|private_table|SQL|postgresql/);
  });

  it("kayıt bağımlılığı somut kayıt kimliği döndürmezse başarı bildirmez", async () => {
    const { saveLead, handle } = setup();
    saveLead.mockResolvedValue({ id: "", replayed: false });
    const response = await handle(makeRequest());
    expect(response.status).toBe(503);
    expect((await response.json()).ok).toBe(false);
  });

  it("oran sınırında 429 ve yeniden deneme süresini döndürür", async () => {
    const { saveLead, handle } = setup();
    saveLead.mockRejectedValue(new RateLimitError());
    const response = await handle(makeRequest());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("600");
    expect((await response.json()).ok).toBe(false);
  });

  it("aynı istek kimliği farklı alanlarla kullanıldığında 409 döndürür", async () => {
    const { saveLead, handle } = setup();
    saveLead.mockRejectedValue(new IdempotencyConflictError());
    const response = await handle(makeRequest());
    expect(response.status).toBe(409);
    expect((await response.json()).ok).toBe(false);
  });
});
