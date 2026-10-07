import { z } from "zod";

export const services = [
  { value: "knowledge", label: "Şirket içi bilgi asistanı" },
  { value: "support", label: "Müşteri destek otomasyonu" },
  { value: "documents", label: "Belge işleme" },
] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(80, "Ad soyad en fazla 80 karakter olabilir."),
  email: z.string().trim().max(254, "E-posta en fazla 254 karakter olabilir.").email("Geçerli bir e-posta adresi yazın.").transform((value) => value.toLowerCase()),
  service: z.enum(["knowledge", "support", "documents"], { error: "Bir hizmet seçin." }),
  description: z.string().trim().min(20, "İhtiyacınızı en az 20 karakterle anlatın.").max(2000, "Açıklama en fazla 2000 karakter olabilir."),
});

export const requestSchema = leadSchema.extend({
  requestId: z.uuid({ error: "Geçersiz istek kimliği. Sayfayı yenileyip tekrar deneyin." }),
  website: z.string().max(0).optional(),
});

export type LeadInput = z.output<typeof leadSchema>;
