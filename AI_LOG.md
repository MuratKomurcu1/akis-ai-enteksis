# AI ile geliştirme — Akış AI

Bu çalışmanın odağı; geçersiz girdide, kayıt hatasında ve eşzamanlı isteklerde tutarlı davranan bir talep akışı kurmaktır. Teknik kararlar, uygulamadaki karşılıkları ve doğrulama kanıtları aşağıda özetlenmiştir.

## AI kullanım kapsamı

Codex; uygulama kodu, test senaryoları, arayüz geliştirme ve hata analizi için kullanıldı. Gereksinim incelemesi, uygulama ve test çalışmaları ayrı adımlarda yürütüldü. Üretilen çıktılar statik kontroller, gerçek tarayıcı senaryoları ve bağımsız veritabanı sorgularıyla doğrulandı.

Banner illüstrasyonları Imagegen ile üretildi. Kullanılan promptlar [hero görseli](docs/hero-image-prompt.txt) ve [ikinci banner](docs/workflow-banner-prompt.txt) için depoda tutulur. Başlıklar, açıklamalar ve bağlantılar görsele gömülmeden HTML olarak sunulur.

## Temel mühendislik kararları

### 1. Başarı mesajı, doğrulanmış kayıt sonucuna bağlı

API, veritabanı işlemini bekler ve somut kayıt kimliği olmadan başarı dönmez. İstemci başarılı HTTP yanıtını, `ok: true` değerini ve kayıt kimliğini birlikte kontrol eder.

Ağ hatası, kaydın oluşmadığını kesin olarak göstermez. Sonuç doğrulanamadığında başarı gösterilmez; hata açıklanır, form verileri korunur ve güvenli tekrar mümkün kalır. İstemcide 15, depolama isteğinde 10 saniyelik zaman aşımı bulunur.

**Kanıt:** [API sözleşmesi](src/lib/lead-handler.ts), [form durumları](src/components/lead-form.tsx), [bekleyen kayıt ve hata testleri](tests/lead-handler.test.ts).

### 2. Tekrar gönderim ve eşzamanlılık veri katmanında çözülür

Değişmeyen form içeriği için aynı istek UUID'si kullanılır. Sunucu, doğrulanmış ve normalize edilmiş alanların SHA-256 özetini üretir. Aynı kimlik ve aynı içerik mevcut kaydı döndürür; aynı kimliğin farklı içerikle kullanılması `409` üretir.

Tekrar kontrolü, e-posta başına 10 dakikada 5 yeni kayıt sınırı ve insert aynı veritabanı işlemi içinde yürütülür. Advisory lock kullanımı, birden fazla serverless örneğinde eşzamanlı isteklerin sınırı aşmasını engeller. Arayüzde düğmenin kapatılması bu veri tutarlılığı mekanizmasını tamamlar.

**Tercihin sınırı:** İstek kimliği açık sayfanın belleğinde tutulur. Sayfa yenilendiğinde veya içerik değiştiğinde yeni kimlik oluşur. E-posta bazlı sınır, genel bot koruması sağlamaz.

**Kanıt:** [Repository](src/lib/lead-repository.ts), [transaction ve kilitler](supabase/migrations/001_leads.sql), [gerçek eşzamanlılık ve tekrar kontrolü](scripts/verify-live.ts).

### 3. İstemci ve sunucu arasında açık bir güven sınırı var

Ortak Zod şeması alan kurallarının farklılaşmasını önler; API aynı kuralları bağımsız uygular. İstek gövdesi yalnız `Content-Length` beyanıyla değil, akıştan okunan gerçek baytlarla 16 KiB sınırına tabi tutulur. İç hata ayrıntıları, form içeriği ve anahtarlar yanıta veya uygulama hata günlüğüne taşınmaz.

Veritabanı erişimi `server-only` katmanındadır. `anon` ve `authenticated` rollerinin tablo erişimi ve kayıt fonksiyonunu çalıştırma yetkisi kaldırılmıştır. RLS'yi aşabilen `service_role` anahtarı yalnız sunucu ortamında tutulur.

**Kanıt:** [Doğrulama şeması](src/lib/lead-schema.ts), [istek kontrolleri](src/lib/lead-handler.ts), [erişim izinleri](supabase/migrations/001_leads.sql).

### 4. Etkileşim maliyeti ve erişilebilirlik birlikte ele alınır

Sayfa içeriği sunucuda oluşturulur; form, hizmet pencereleri ve sohbet rehberi ayrı istemci bileşenleridir. Fare takibi `requestAnimationFrame` ve CSS değişkenleriyle çalışır; her harekette React state güncellenmez. Dokunmatik kullanımda ve reduced-motion tercihinde hareket kapalıdır.

Form hataları alanlarla ilişkilendirilir ve uygun odağa taşınır. Sohbet rehberi klavyeyle açılıp kapanır, Escape sonrası odağı geri verir ve sayfaya erişimi kilitlemez. Sabit yanıtlar kullandığı arayüzde belirtilir. Fontlar yerelden yüklenir; görseller boyut bilgisi ve responsive `sizes` ile sunulur.

**Kanıt:** [Form](src/components/lead-form.tsx), [hizmet pencereleri](src/components/service-windows.tsx), [sohbet rehberi](src/components/static-chatbot.tsx).

## Doğrulamada bulunan sorunlar

| Bulguyla ortaya çıkan risk | Düzeltme | Doğrulama |
| --- | --- | --- |
| Next.js'in yerel URL normalizasyonu, geçerli `127.0.0.1` isteğini `403` ile reddediyordu. | Origin karşılaştırması yönlendirilen HTTP Host üzerinden kuruldu; `X-Forwarded-Host` kullanılmadı. | Kabul ve ret durumlarını kapsayan regresyon testleri. |
| Migration bağlantısında sertifika zinciri doğrulanamıyordu. | Sağlayıcının public CA sertifikası eklendi; `verify-full` ile zincir ve hostname kontrolü korundu. | Migration doğrulanmış TLS bağlantısıyla tamamlandı. |
| Küçük metinlerde düşük kontrast ve kısa yatay ekranda sabit panelin örttüğü klavye odağı bulundu. | Kontrastlar düzeltildi; odak, kaydırma boşlukları ve güvenli alan ölçüleri düzenlendi. | Axe taramaları, Tab/Enter akışı ve odaklanan öğelerin görünürlük ölçümleri. |

## Doğrulama kanıtları

Geliştirme sırasında alınan sonuçlar; otomatik test, gerçek entegrasyon ve ek tarayıcı kontrolleri olarak ayrılmıştır.

| Kontrol | Sonuç | Kanıtın kapsamı |
| --- | --- | --- |
| `npm test` | **43/43** | Doğrulama, normalizasyon, origin/gövde sınırı ve API başarı/hata sözleşmesi. Kayıt bağımlılığı kontrollü olarak taklit edilir. |
| `npm run test:e2e` | **8/8** | Chromium'da form, klavye, hata durumları ve 390/1440 px Axe kontrolleri. Başarı akışı gerçek API/veritabanı kullanır; hata ve gecikme senaryoları kontrollü yanıtlarla sınanır. |
| `npm run verify:live` | **Geçti** | API'den bağımsız SELECT ile kalıcılık; aynı kayda güvenli tekrar, `409` çakışması, eşzamanlı `429` sınırı ve anonim okuma reddi. Yalnız kurgusal veri kullanıldı. |
| Lint, TypeScript, production build | **Geçti** | GitHub Actions üzerinde Node.js 24 ortamında da doğrulandı. CI kapsamı statik kontroller, birim testleri ve build'dir. |

Ek tarayıcı kontrollerinde 320–1440 px aralığında yatay taşma; fare takibinin sıfırlanması; reduced-motion; sohbetin odak dönüşü ve form yönlendirmesi incelendi. 740 × 360 yatay görünüm dahil son açık sohbet paneli taramalarında Axe ihlali bulunmadı. Bu etkileşim kontrolleri, depodaki sekiz E2E senaryosundan ayrıdır.

## Bilinen sınırlar

- Otomatik tarayıcı testleri Chromium ile sınırlıdır. Safari ve ekran okuyucu doğrulaması için ek kanıt gerekir; Axe sonucu tek başına tam erişilebilirlik uygunluğu anlamına gelmez.
- Üretim bağımlılıkları için yapılan audit sıfır bulgu verdi. Geliştirme araç zincirindeki beş yüksek bulgu ve sürüm düşürmeyi gerektiren otomatik düzeltmenin uygulanmama gerekçesi [README](README.md#test-ve-doğrulama) içinde açıklanmıştır.
- Ürün kapsamı hizmet tanıtımı ve kalıcı test talebidir. Çalışma zamanında LLM çağrısı ve e-posta gönderimi yoktur. Gerçek müşteri verisi kullanımı kapsam dışıdır; yalnız kurgusal test verisi kullanılmalıdır.

Kurulum, ortam değişkenleri ve doğrulama komutlarının kullanım koşulları [README](README.md) içindedir.
