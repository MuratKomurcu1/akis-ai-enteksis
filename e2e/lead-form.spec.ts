import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// All submitted information is fictitious. The successful submit test deliberately
// uses the real API and configured PostgreSQL database; no route is mocked there.
const fictionalLead = {
  name: "Kurgu Ada Test",
  email: "ada-test@example.com",
  service: "knowledge",
  description: "Kurgusal şirketimizin bilgi asistanı için oluşturulmuş bir test talebidir.",
};

async function fillForm(page: Page, email = fictionalLead.email) {
  await page.getByLabel("Ad soyad", { exact: true }).fill(fictionalLead.name);
  await page.getByLabel("E-posta", { exact: true }).fill(email);
  await page.getByLabel("Hizmet", { exact: true }).selectOption(fictionalLead.service);
  await page.getByLabel("Açıklama", { exact: true }).fill(fictionalLead.description);
}

test("gerçek API ve veritabanı: başarı yalnız kaydedilmiş kayıt kimliğiyle gösterilir", async ({ page }) => {
  await page.goto("/");
  await fillForm(page, `e2e-${randomUUID()}@example.com`);
  const responsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname === "/api/leads" && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Talebi gönder", exact: true }).click();
  const response = await responsePromise;
  expect(response.status(), "Gerçek veritabanı kaydı için çalışan sunucu yapılandırması gerekir").toBe(201);
  const result = await response.json();
  expect(result.ok).toBe(true);
  expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  const status = page.getByRole("status");
  await expect(status).toContainText("Talebiniz kaydedildi.");
  await expect(status).toContainText(result.id);
});

test("istemci doğrulaması: klavyeyle gönderimde ilk hatalı alan odaklanır ve API çağrılmaz", async ({ page }) => {
  let submissions = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/leads" && request.method() === "POST") submissions += 1;
  });
  await page.goto("/");
  const submit = page.getByRole("button", { name: "Talebi gönder", exact: true });
  await submit.focus();
  await page.keyboard.press("Enter");
  const firstField = page.getByLabel("Ad soyad", { exact: true });
  await expect(firstField).toBeFocused();
  await expect(firstField).toHaveAttribute("aria-invalid", "true");
  await expect(firstField).toHaveAttribute("aria-describedby", /\S+/);
  expect(submissions).toBe(0);
});

test("sunucu doğrulaması: istemci atlanarak gönderilen geçersiz alanlar reddedilir", async ({ request }) => {
  const response = await request.post("/api/leads", {
    data: { ...fictionalLead, email: "invalid-email", service: "unknown", requestId: randomUUID(), website: "" },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.ok).toBe(false);
  expect(body.fieldErrors).toMatchObject({ email: expect.any(Array), service: expect.any(Array) });
});

test("simüle edilen kayıt hatası: başarı gösterilmez, bilgiler korunur ve aynı istekle yeniden denenir", async ({ page }) => {
  const submittedIds: string[] = [];
  const error = "Test: kayıt servisi şu anda kullanılamıyor.";
  await page.route("**/api/leads", async (route) => {
    submittedIds.push(route.request().postDataJSON().requestId);
    await route.fulfill({ status: 503, json: { ok: false, error } });
  });
  await page.goto("/");
  await fillForm(page);
  const submit = page.getByRole("button", { name: "Talebi gönder", exact: true });
  await submit.click();
  await expect(page.locator("form").getByRole("alert")).toContainText(error);
  await expect(page.locator("form").getByRole("alert")).toBeFocused();
  await expect(page.getByText("Talebiniz kaydedildi.", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Ad soyad", { exact: true })).toHaveValue(fictionalLead.name);
  await expect(page.getByLabel("E-posta", { exact: true })).toHaveValue(fictionalLead.email);
  await expect(page.getByLabel("Hizmet", { exact: true })).toHaveValue(fictionalLead.service);
  await expect(page.getByLabel("Açıklama", { exact: true })).toHaveValue(fictionalLead.description);
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator("form").getByRole("alert")).toContainText(error);
  expect(submittedIds).toHaveLength(2);
  expect(submittedIds[0]).toBeTruthy();
  expect(submittedIds[1]).toBe(submittedIds[0]);
});

test("simüle edilen gecikme: gönderim boyunca düğme kapalıdır ve ikinci istek çıkmaz", async ({ page }) => {
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  let submissions = 0;
  await page.route("**/api/leads", async (route) => {
    submissions += 1;
    await responseGate;
    await route.fulfill({ status: 503, json: { ok: false, error: "Test: gecikmiş kayıt hatası." } });
  });
  try {
    await page.goto("/");
    await fillForm(page);
    await page.getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(page.getByRole("button", { name: "Gönderiliyor…", exact: true })).toBeDisabled();
    await expect(page.getByText("Talebiniz kaydedildi.", { exact: true })).toHaveCount(0);
    await page.keyboard.press("Enter");
    expect(submissions).toBe(1);
  } finally {
    releaseResponse();
  }
  await expect(page.locator("form").getByRole("alert")).toContainText("Test: gecikmiş kayıt hatası.");
  expect(submissions).toBe(1);
});

test("simüle edilen ağ kesintisi: bağlantı hatası açıklanır ve form korunur", async ({ page }) => {
  await page.route("**/api/leads", (route) => route.abort("failed"));
  await page.goto("/");
  await fillForm(page);
  await page.getByRole("button", { name: "Talebi gönder", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Bağlantı kurulamadı.");
  await expect(page.getByLabel("Açıklama", { exact: true })).toHaveValue(fictionalLead.description);
  await expect(page.getByText("Talebiniz kaydedildi.", { exact: true })).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`${width}px: yatay taşma yok ve otomatik erişilebilirlik kontrolü temiz`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    await test.info().attach(`axe-${width}px`, {
      body: JSON.stringify(accessibility, null, 2),
      contentType: "application/json",
    });
    expect(accessibility.violations.map((violation) => ({
      rule: violation.id,
      nodes: violation.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
    }))).toEqual([]);
  });
}
