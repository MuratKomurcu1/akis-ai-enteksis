# Akış AI

Enteksis değerlendirmesi için hazırlanmış, kurgusal bir yapay zekâ hizmet firmasının Türkçe landing page'i. Ziyaretçi hizmetleri inceleyip test talebi gönderir; başarı mesajı ancak talep sunucuda kalıcı olarak kaydedildiğinde görünür.

- **Canlı demo:** https://akis-ai-enteksis.vercel.app
- **Kaynak kod:** https://github.com/MuratKomurcu1/akis-ai-enteksis
- **AI çalışma kaydı:** [AI_LOG.md](AI_LOG.md)

Teslim commit kimliği `git rev-parse HEAD` ile alınarak teslim alanına yazılır. Bu kimlik, canlı sürümün kaynak koduyla eşleşmelidir.

## Yerel kurulum

Node.js 24.x, npm ve bir Supabase projesi gerekir. Sürümler: Next.js 16.4, React 19.3, TypeScript, Zod 4 ve Supabase SDK 2.117.3; kalıcı kayıt Supabase PostgreSQL'dedir.

```bash
npm ci
cp .env.example .env.local
```

`.env.local` dosyasını kendi Supabase projenizin değerleriyle doldurun:

| Değişken | Kullanımı |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si. Sunucuda `SUPABASE_URL` tanımlanırsa o önceliklidir. |
| `SUPABASE_SERVICE_ROLE_KEY` | API'nin Supabase erişimi. Yalnız sunucuda tutulur; `NEXT_PUBLIC_` önekiyle tanımlanmaz. |
| `POSTGRES_URL` | Yalnız migration için PostgreSQL bağlantı adresi. `POSTGRES_URL_NON_POOLING` varsa öncelikle o kullanılır. |

`.env.local` Git tarafından dışlanır. Bağlantı adresleri ve anahtarlar README'ye veya kaynak koda yazılmaz. Uygulamanın çalışma zamanında doğrudan PostgreSQL bağlantı adresine ihtiyacı yoktur; sunucu Supabase RPC kullanır.

```bash
npm run db:migrate
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır. Migration, [001_leads.sql](supabase/migrations/001_leads.sql) dosyasını tek transaction içinde çalıştırır; `leads` tablosunu, kısıtlarını, erişim izinlerini ve `submit_lead` fonksiyonunu oluşturur. Alternatif olarak aynı SQL dosyası Supabase SQL Editor üzerinden uygulanabilir. Bu betik ilk kurulum içindir; daha sonraki şema değişiklikleri ayrı migration dosyalarıyla yönetilmelidir.

Migration bağlantısı `sslmode=verify-full` ile sertifika zincirini ve sunucu adını doğrular. Gerekli genel Supabase CA sertifikası [certs/supabase-ca.crt](certs/supabase-ca.crt) içinde bulunur; gizli anahtar değildir, ek ortam değişkeni gerekmez. [Sertifikanın Supabase kaynağı](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt).

## Veri akışı ve kararlar

```text
Form → ortak Zod şeması → POST /api/leads → sunucu doğrulaması
     → Supabase submit_lead RPC → PostgreSQL kaydı → kayıt kimliği → başarı görünümü
```

- **Tek uygulama:** Landing page ve API aynı Next.js projesindedir. İçerik sunucuda, etkileşimli form istemcide işlenir; ayrı bir API servisi gerektirmez.
- **Ortak doğrulama:** [lead-schema.ts](src/lib/lead-schema.ts) hem formda hem API'de kullanılır. Ad soyad 2–80, açıklama 20–2.000 karakterdir; e-posta biçimi ve en fazla 254 karakter sınırı doğrulanır. Hizmet yalnız tanımlı üç seçenekten biri olabilir. Metinler kırpılır, e-posta küçük harfe dönüştürülür.
- **Kalıcı kayıt:** Serverless sunucunun belleği veya yerel dosyası yerine PostgreSQL kullanılır. Kayıt kimliği, istek kimliği, içerik özeti, dört form alanı ve oluşturulma zamanı saklanır.
- **Veritabanında tutarlılık:** Tekrar kontrolü, aynı e-posta için 10 dakikada en fazla 5 yeni kayıt sınırı ve insert aynı transaction'dadır. Transaction kilitleri, eşzamanlı isteklerde ve birden fazla sunucu örneğinde kontrolün tutarlı olmasını sağlar.
- **Küçük arayüz kapsamı:** Hizmetler, örnek kullanım, yaklaşım ve talep formu tek sayfadadır. Yerel fontlar kullanılır. Alan etiketleri, klavye odağı, hata açıklamaları ve durum bildirimleri form akışının parçasıdır.

API yeni kayıt için `201`, aynı isteğin güvenli tekrarı için aynı kayıt kimliğiyle `200` döndürür. Geçersiz alanlar `400`, farklı kaynak `403`, aynı istek kimliğiyle farklı içerik `409`, büyük gövde `413`, yanlış içerik türü `415`, oran sınırı `429`, doğrulanamayan kayıt `503` üretir.

## İki problem çözme örneği

### 1. Yanıt gelmediğinde yeniden gönderim

**Sorun:** Veritabanına yazma tamamlanabilir, fakat yanıt ağda kaybolabilir. Kullanıcının tekrar denemesi iki kayıt oluşturmamalıdır; düğmeyi kapatmak tek başına bu durumu çözmez.

**Çözüm:** Form, değişmeyen içerik için aynı `requestId` değerini korur. Sunucu doğrulanmış alanların SHA-256 özetini hesaplar. Veritabanı aynı kimlik ve aynı içerikte mevcut kaydı döndürür; içerik değişmişse `409` verir. Gönderim sırasında form ayrıca devre dışıdır. İstemcide 15, Supabase isteğinde 10 saniyelik zaman aşımı vardır.

**Doğrulama:** Birim testleri tekrar ve çakışma yanıtlarını kontrol eder. `verify:live`, gerçek API'ye aynı isteği yeniden gönderir ve bağımsız veritabanı sorgusuyla tek kayıt kaldığını denetler. E2E senaryosu, hata sonrası denemede kimliğin korunduğunu kontrol eder. Kimlik yalnız açık sayfanın belleğindedir; sayfa yenilenmesi veya içerik değişikliği yeni istek oluşturur.

### 2. Kayıt hatasında sahte başarı

**Sorun:** Yalnız düğmeye basıldığı veya HTTP isteği tamamlandığı için başarı göstermek, kaydedilmeyen talebi kaydedilmiş gibi sunar. Ağ hatası da kaydın kesinlikle oluşmadığını kanıtlamaz.

**Çözüm:** API, veritabanı işlemini bekler ve somut kayıt kimliği olmadan başarı vermez. İstemci de başarılı HTTP durumu, `ok: true` ve kayıt kimliğini birlikte arar. Hata durumunda alanlar korunur, sonuç doğrulanamadığı açıklanır ve yeniden deneme mümkün kalır. Başarı görünümünde gerçek kayıt kimliği gösterilir.

**Doğrulama:** Birim testleri bekleyen kayıt işlemi tamamlanmadan yanıt verilmediğini; yazma hatası veya boş kimlikte `503` döndüğünü kontrol eder. E2E hata senaryoları hata mesajını, alanların korunmasını ve başarı görünümünün oluşmamasını denetler. Bu hata senaryolarında API yanıtları kontrollü olarak taklit edilir; gerçek kayıt senaryosu API'yi taklit etmez.

## Test ve doğrulama

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run verify:live
```

`test:e2e`, `BASE_URL` verilmezse yerel geliştirme sunucusunu başlatır. Gerçek kayıt senaryosu için ortam değişkenleri ve migration hazır olmalıdır. `verify:live` için uygulamanın ayrıca çalışıyor olması gerekir; varsayılan hedef `http://localhost:3000`'dir.

| Kontrol | Neyi kanıtlar? | Son doğrulanmış durum |
| --- | --- | --- |
| ESLint, TypeScript, production build | Statik kontroller ve derleme | Geçti |
| Vitest | Ortak doğrulama, API sözleşmesi, gecikme ve hata davranışı; kayıt bağımlılığı taklit edilir | 43 test geçti |
| Playwright + axe | Gerçek form gönderimi, istemci/sunucu hataları, klavye odağı, 390/1440 px taşma ve otomatik erişilebilirlik | 8/8 yerel ve 8/8 canlı test geçti |
| `verify:live` | Gerçek kalıcılık, tekrar, çakışma, geçersiz alanlar, eşzamanlı oran sınırı | Yerel ve canlı API → Supabase doğrulandı; anonim okuma engellendi |

`verify:live` API'den bağımsız olarak Supabase'den kayıt okur ve her çalıştırmada 5 kurgusal kayıt bırakır. İsteğe bağlı `SUPABASE_ANON_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` varsa anonim okumanın engellendiğini de denetler; yoksa bu kontrolün atlandığını çıktıda belirtir. Testler yalnız `example.com` adresleri ve kurgusal bilgiler kullanır. Otomatik erişilebilirlik taraması tek başına tam erişilebilirlik uygunluğu iddiası değildir.

GitHub Actions, Node.js 24 üzerinde lint, birim testleri, build ve tip kontrolünü çalıştırır. Veritabanı gerektiren testler canlı ortam doğrulamasında ayrıca çalıştırılır. `npm audit --omit=dev` sonucu 0 bulgudur. Tam audit, ESLint araç zincirindeki `braces` bağımlılığında [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) nedeniyle 5 yüksek bulgu raporlar; uygulamanın üretim bağımlılıklarında değildir. Otomatik zorlayıcı düzeltmenin Next.js lint paketini eski ana sürüme düşürmesi kabul edilmedi.

## Vercel'e yayınlama

1. Kaynak kod deposunu Vercel'e aktarın; framework olarak Next.js, kök dizin olarak proje kökünü seçin. Build komutu `npm run build`'dir. [Next.js / Vercel belgeleri](https://vercel.com/docs/frameworks/full-stack/nextjs).
2. Supabase URL'sini ve `SUPABASE_SERVICE_ROLE_KEY` değerini ilgili Vercel ortamına tanımlayın. Önizleme ve üretim farklı veritabanları kullanıyorsa her biri için migration uygulayın. Anahtarları depoya eklemeyin.
3. Migration tamamlandıktan sonra deploy edin. Ortam değişkenlerini sonradan değiştirirseniz yeni deployment oluşturun.
4. Yayın adresini `BASE_URL` ortam değişkenine vererek `npm run test:e2e` ve `npm run verify:live` çalıştırın. Veritabanı doğrulamasının kullandığı yerel Supabase bilgileri yayın ortamıyla aynı projeye ait olmalıdır.
5. Canlı bağlantı ile depo erişimini oturum açmamış bir tarayıcıda kontrol edin. Son kodu commit edip `git rev-parse HEAD` çıktısını teslim edin. Sonraki commit'ler değerlendirme sistemindeki teslimi kendiliğinden güncellemez.

Mevcut teslim, Vercel CLI ile yayımlandı. Vercel GitHub otomatik dağıtım bağlantısı hesapta ek GitHub Login Connection gerektirdiğinden etkinleştirilmedi; GitHub Actions kontrolleri bağımsız çalışır. Sonraki yayın için `vercel deploy --prod` kullanılır. `vercel.json` Next.js framework'ünü ve Supabase'e yakın Frankfurt (`fra1`) fonksiyon bölgesini açıkça belirtir.

## Güvenlik ve kapsam sınırları

Supabase erişimi [lead-repository.ts](src/lib/lead-repository.ts) içindeki `server-only` sınırındadır. `leads` tablosunda RLS açıktır; `anon` ve `authenticated` rollerinin tablo erişimi kaldırılmış, RPC çalıştırma izni yalnız `service_role` için verilmiştir. `service_role` RLS'yi aşabilen bir sunucu anahtarıdır; bu nedenle gizli tutulması erişim modelinin temelidir. [Supabase RLS belgeleri](https://supabase.com/docs/guides/database/postgres/row-level-security).

API, JSON gövdesini gerçek okunan baytlarla 16 KiB sınırlar, farklı origin/cross-site tarayıcı isteklerini reddeder ve gizli bot alanını kontrol eder. İç hata ayrıntıları, anahtarlar ve form verileri yanıta veya uygulama hata günlüğüne yazılmaz. Güvenlik başlıkları [next.config.ts](next.config.ts) içinde tanımlıdır.

Bu bir değerlendirme demosudur: yalnız kurgusal veri girilmelidir. E-posta gönderimi, gerçek AI modeli, üyelik, yönetim paneli ve otomatik veri silme kapsamda değildir. Form JavaScript gerektirir. E-posta bazlı oran sınırı ve gizli alan temel kötüye kullanım önlemleridir; e-posta değiştirerek aşılabilir, genel bot veya DDoS koruması sağlamaz. Üretim kullanımı için veri saklama/silme süreci ve trafik koruması ayrıca tasarlanmalıdır.

## İstenenlerle eşleştirme

| İstenen | Uygulamadaki karşılığı |
| --- | --- |
| Anlaşılır, mobil ve masaüstü uyumlu hizmet sayfası | [page.tsx](src/app/page.tsx), [globals.css](src/app/globals.css); hizmet → yaklaşım → form sırası |
| İsim, e-posta, hizmet ve açıklama | [lead-form.tsx](src/components/lead-form.tsx) |
| İstemci ve sunucu doğrulaması | [lead-schema.ts](src/lib/lead-schema.ts), [lead-handler.ts](src/lib/lead-handler.ts) |
| Gönderiliyor, başarı ve hata durumları | Devre dışı gönderim, alan hataları, korunan form verisi, kayıt kimlikli başarı |
| Sunucuda kalıcı test kaydı | Supabase PostgreSQL, [migration](supabase/migrations/001_leads.sql) |
| Yalnız kayıttan sonra başarı | Beklenen RPC sonucu ve kayıt kimliği kontrolü; birim, E2E ve bağımsız kalıcılık kontrolleri |
| Canlı URL ve incelemeye açık kaynak kod | Belgenin başındaki canlı demo ve herkese açık GitHub deposu |
| README, AI günlüğü ve teslim commit'i | Bu belge, [AI_LOG.md](AI_LOG.md), son teslimde `git rev-parse HEAD` |

AI ile çalışma biçimi ve doğrulama kaydı [AI_LOG.md](AI_LOG.md) dosyasındadır.

İlk banner'daki izometrik illüstrasyon, kullanıcı referansına göre yerleşik Imagegen aracıyla üretilmiştir. [Görselin aslı](public/images/akis-ai-hero.png) ve [tam üretim promptu](docs/hero-image-prompt.txt) depoda bulunur; sayfa metinleri görsele gömülmeden HTML olarak sunulur.

Hizmetler, [ServiceWindows](src/components/service-windows.tsx) bileşeninde macOS esintili pencerelerle sunulur. Fare takibi yalnız uygun işaretçi ve hareket tercihlerinde çalışır; klavye ve dokunmatik kullanım için hareket gerekmez. Hemen altındaki [ikinci banner çizimi](public/images/akis-workflow-banner.png) kullanıcının düz izometrik referansına göre üretildi; [üretim promptu](docs/workflow-banner-prompt.txt) da kayıttadır.

Sol alttaki [statik sohbet rehberi](src/components/static-chatbot.tsx), hazır sorulara yerel yanıtlar verir ve talep formuna yönlendirir. Gerçek model/canlı temsilci bağlantısı, serbest metin girişi veya sohbet kaydı yoktur; arayüz bu kapsamı belirtir.
