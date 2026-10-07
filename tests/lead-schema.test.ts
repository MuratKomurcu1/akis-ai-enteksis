import { describe, expect, it } from "vitest";
import { leadSchema, requestSchema } from "@/lib/lead-schema";

const validLead = {
  name: "Kurgu Ada Test",
  email: "ada+test@example.com",
  service: "knowledge",
  description: "Bu kayıt yalnızca kurgusal kabul testi verisidir.",
};

describe("leadSchema: istemci ve sunucunun ortak alan kuralları", () => {
  it("geçerli alanları temizler ve e-postayı tutarlı biçimde normalleştirir", () => {
    const result = leadSchema.parse({
      ...validLead,
      name: "  Kurgu Ada Test  ",
      email: "  ADA+TEST@EXAMPLE.COM  ",
      description: `  ${validLead.description}  `,
    });
    expect(result.name).toBe("Kurgu Ada Test");
    expect(result.email).toBe(validLead.email);
    expect(result.description).toBe(validLead.description);
  });

  it.each(["knowledge", "support", "documents"])("izin verilen hizmeti kabul eder: %s", (service) => {
    expect(leadSchema.safeParse({ ...validLead, service }).success).toBe(true);
  });

  it.each([
    ["name", ""],
    ["name", "   "],
    ["name", "A"],
    ["name", "A".repeat(81)],
    ["email", ""],
    ["email", "ada.example.com"],
    ["email", "ada@"],
    ["email", `${"a".repeat(243)}@example.com`],
    ["service", ""],
    ["service", "unapproved-service"],
    ["description", ""],
    ["description", " ".repeat(25)],
    ["description", "a".repeat(19)],
    ["description", "a".repeat(2001)],
  ])("geçersiz %s alanını reddeder", (field, value) => {
    const result = leadSchema.safeParse({ ...validLead, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(true);
    }
  });

  it.each([
    { name: "Ab", description: "a".repeat(20) },
    { name: "A".repeat(80), description: "a".repeat(2000) },
  ])("alan uzunluklarının dahil sınırlarını kabul eder", (boundaries) => {
    expect(leadSchema.safeParse({ ...validLead, ...boundaries }).success).toBe(true);
  });

  it("string yerine nesne veya null verilen alanları reddeder", () => {
    expect(leadSchema.safeParse({ ...validLead, email: { value: validLead.email } }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, description: null }).success).toBe(false);
  });
});

describe("requestSchema: kayıt isteği", () => {
  const validRequest = { ...validLead, requestId: "f29c5ca1-1c9c-4ef2-bdd3-67652214e23b" };

  it("geçerli istek kimliğini ve boş/eksik honeypot alanını kabul eder", () => {
    expect(requestSchema.safeParse(validRequest).success).toBe(true);
    expect(requestSchema.safeParse({ ...validRequest, website: "" }).success).toBe(true);
  });

  it("eksik veya UUID olmayan istek kimliğini reddeder", () => {
    expect(requestSchema.safeParse(validLead).success).toBe(false);
    expect(requestSchema.safeParse({ ...validRequest, requestId: "test" }).success).toBe(false);
  });

  it("doldurulmuş honeypot alanını reddeder", () => {
    expect(requestSchema.safeParse({ ...validRequest, website: "https://example.com" }).success).toBe(false);
  });
});
