"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, CircleAlert, LoaderCircle } from "lucide-react";
import { leadSchema, services } from "@/lib/lead-schema";

type FieldName = "name" | "email" | "service" | "description";
type FieldErrors = Partial<Record<FieldName, string[]>>;
type Phase = "idle" | "invalid" | "pending" | "error" | "success";
const fieldOrder: FieldName[] = ["name", "email", "service", "description"];

export function LeadForm() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  // A retry after an uncertain network result uses the same idempotency key.
  const requestRef = useRef<{ payload: string; id: string } | null>(null);

  useEffect(() => {
    if (phase === "invalid") {
      const field = fieldOrder.find((name) => errors[name]?.length);
      const element = field && formRef.current?.elements.namedItem(field);
      if (element instanceof HTMLElement) element.focus();
    } else if (phase === "error" || phase === "success") {
      feedbackRef.current?.focus();
    }
  }, [phase, errors]);

  function describedBy(name: FieldName, hint?: string) {
    return [hint, errors[name]?.length ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;
  }

  function fieldError(name: FieldName) {
    return errors[name]?.[0] ? <p className="field-error" id={`${name}-error`}>{errors[name]?.[0]}</p> : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    const formData = new FormData(event.currentTarget);
    const result = leadSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      service: formData.get("service"),
      description: formData.get("description"),
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName;
        if (fieldOrder.includes(field)) nextErrors[field] = [...(nextErrors[field] ?? []), issue.message];
      }
      setErrors(nextErrors);
      setPhase("invalid");
      return;
    }

    const payload = { ...result.data, website: String(formData.get("website") ?? "") };
    const serializedPayload = JSON.stringify(payload);
    if (requestRef.current?.payload !== serializedPayload) {
      requestRef.current = { payload: serializedPayload, id: crypto.randomUUID() };
    }

    pendingRef.current = true;
    setErrors({});
    setMessage("");
    setPhase("pending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: requestRef.current.id }),
        signal: controller.signal,
      });
      const data: unknown = await response.json().catch(() => null);
      const body = data && typeof data === "object" ? data as Record<string, unknown> : null;

      if (response.ok && body?.ok === true && typeof body.id === "string" && body.id.trim().length > 0 && body.id.length <= 128) {
        setRecordId(body.id);
        setPhase("success");
        requestRef.current = null;
        return;
      }

      if (body?.fieldErrors && typeof body.fieldErrors === "object") {
        const serverErrors = body.fieldErrors as Record<string, unknown>;
        const nextErrors: FieldErrors = {};
        for (const field of fieldOrder) {
          const value = serverErrors[field];
          if (Array.isArray(value)) nextErrors[field] = value.filter((item): item is string => typeof item === "string");
        }
        setErrors(nextErrors);
      }
      setMessage(typeof body?.error === "string" ? body.error : "Talebinizin kaydedildiği doğrulanamadı. Lütfen tekrar deneyin.");
      setPhase("error");
    } catch {
      setMessage("Bağlantı kurulamadı. Bilgileriniz burada duruyor; lütfen tekrar deneyin.");
      setPhase("error");
    } finally {
      window.clearTimeout(timeout);
      pendingRef.current = false;
    }
  }

  if (phase === "success") {
    return (
      <div className="lead-form-panel success-panel">
        <div ref={feedbackRef} className="success-content" role="status" tabIndex={-1}>
          <span className="success-icon"><Check size={30} aria-hidden="true" /></span>
          <p className="eyebrow">TEST TALEBİ ALINDI</p>
          <h3>Talebiniz kaydedildi.</h3>
          <p>Test talebiniz sunucuda başarıyla saklandı. Bu demo kapsamında e-posta gönderilmez.</p>
          <div className="record-reference"><span>Kayıt numarası</span><code>{recordId}</code></div>
        </div>
        <button className="button button-primary" type="button" onClick={() => { setPhase("idle"); setRecordId(""); requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("[name=name]")?.focus()); }}>Yeni bir test talebi oluştur <ArrowUpRight size={18} aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <form className="lead-form-panel" ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={phase === "pending"}>
      <div className="form-heading"><h3>Birlikte başlayalım.</h3><p>Tüm alanlar zorunludur.</p></div>
      {phase === "invalid" && <div className="form-alert" role="alert"><CircleAlert size={19} aria-hidden="true" /><p>Lütfen işaretli alanları kontrol edin.</p></div>}
      {phase === "error" && <div ref={feedbackRef} className="form-alert" role="alert" tabIndex={-1}><CircleAlert size={19} aria-hidden="true" /><p>{message}</p></div>}

      <fieldset disabled={phase === "pending"}>
        <legend className="sr-only">Test talebi bilgileri</legend>
        <div className="form-row">
          <div className="form-field"><label htmlFor="name">Ad soyad</label><input id="name" name="name" type="text" autoComplete="name" placeholder="Ör. Deniz Örnek" required minLength={2} maxLength={80} aria-invalid={Boolean(errors.name?.length)} aria-describedby={describedBy("name")} />{fieldError("name")}</div>
          <div className="form-field"><label htmlFor="email">E-posta</label><input id="email" name="email" type="email" autoComplete="email" placeholder="deniz@example.com" required maxLength={254} aria-invalid={Boolean(errors.email?.length)} aria-describedby={describedBy("email")} />{fieldError("email")}</div>
        </div>
        <div className="form-field"><label htmlFor="service">Hizmet</label><div className="select-wrapper"><select id="service" name="service" defaultValue="" required aria-invalid={Boolean(errors.service?.length)} aria-describedby={describedBy("service")}><option value="" disabled>Bir hizmet seçin</option>{services.map((service) => <option value={service.value} key={service.value}>{service.label}</option>)}</select><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></div>{fieldError("service")}</div>
        <div className="form-field"><label htmlFor="description">Açıklama</label><textarea id="description" name="description" rows={4} placeholder="Hangi süreci kolaylaştırmak istiyorsunuz? Kurgusal bir örnek paylaşın…" required minLength={20} maxLength={2000} aria-invalid={Boolean(errors.description?.length)} aria-describedby={describedBy("description", "description-hint")} /><p className="field-hint" id="description-hint">20–2.000 karakter. Yalnızca kurgusal test verisi yazın.</p>{fieldError("description")}</div>
        <div className="honeypot-field" aria-hidden="true"><label htmlFor="website">Web sitesi</label><input type="text" name="website" id="website" tabIndex={-1} autoComplete="off" /></div>
        <button className="button button-primary submit-button" type="submit" disabled={phase === "pending"}>{phase === "pending" ? <>Gönderiliyor… <LoaderCircle className="loading-icon" size={19} aria-hidden="true" /></> : <>Talebi gönder <ArrowUpRight size={20} aria-hidden="true" /></>}</button>
      </fieldset>
      <p className="form-footnote" role={phase === "pending" ? "status" : undefined}>{phase === "pending" ? "Talebiniz kaydediliyor. Lütfen bekleyin." : "Test talebiniz, gönderim başarılı olduğunda kaydedilir."}</p>
      <noscript><p className="form-alert">Bu formu göndermek için JavaScript’i etkinleştirin.</p></noscript>
    </form>
  );
}
