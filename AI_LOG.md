# AI çalışma kaydı — Akış AI

Bu kayıt Enteksis ALEX-24H-v1.0 uygulama çalışmasının gerçek geliştirme sürecini anlatır. AI tarafından üretilen kod, adayın elle yazdığı kod olarak sunulmaz. Adayın kişisel geçmişi veya görüşmede göstereceği bilgi seviyesi hakkında varsayım yapılmaz.

## 8 Ekim 2026 — Kapsam ve yaklaşım

- Kullanıcı görevin ekran görüntüsünü paylaştı, AI/LLM fullstack rolüne başvurduğunu ve süreyi başlattığını belirtti.
- Codex görev sayfasını ve ayrıntılı değerlendirme rehberini okudu. Kapsam: teknoloji hizmeti landing page, doğrulanan talep formu, sunucuda kalıcı kayıt, gerçek sonuç mesajları, canlı URL ve kaynak kod.
- Codex, kurgusal **Akış AI** hizmetini ve Next.js/TypeScript, Zod, Supabase/PostgreSQL yapısını önerdi. Kullanıcı başlamayı onayladı.
- LLM API çağrısı ürün gereksinimlerinde bulunmadığı için çekirdek kapsama eklenmedi. AI hizmetlerinin anlatılması ile uygulamanın gerçekten bir model çalıştırması birbirinden ayrıldı.

## Görev dağılımı

- Ana Codex ajanı: kapsam, altyapı bağlantıları, ortak doğrulama şeması, sunucu akışı, veri modeli, entegrasyon doğrulaması ve teslim.
- Gereksinim inceleme ajanı: ekran görüntüsündeki kabul kriterlerini ve eksik bağlamı çıkardı.
- Arayüz ajanı: Türkçe içerik, responsive sayfa, erişilebilir form durumları.
- Test ajanı: başarı, doğrulama, veri kaydı hatası ve erişilebilirlik testleri.
- Kullanıcı: ürün yaklaşımını onayladı; Vercel CLI ve MCP OAuth oturumlarını tamamladı. Kod inceleme veya elle test yaptığı, yalnızca bunu gerçekten yaptığı zaman kayda eklenebilir.

## Kabul edilen ve sınırlandırılan öneriler

1. **Ortak Zod şeması:** istemciye hızlı geri bildirim verirken sunucunun aynı kuralları bağımsız uygulaması için kabul edildi.
2. **Başarı yalnızca kayıt sonrasında:** API, depolamadan kayıt kimliği almadan başarı dönmüyor. UI da geçerli başarı yanıtını bekliyor.
3. **Tekrar deneme kimliği:** ağ yanıtı kaybolduğunda aynı formun tekrar gönderilmesinin ikinci kayıt oluşturmaması için request UUID kullanıldı.
4. **Veritabanında atomik kontrol:** aynı e-posta için 10 dakikada 5 yeni kayıt sınırı, birden çok sunucu örneğinde de tutarlı olmak üzere kayıt işlemiyle aynı transaction içinde uygulanıyor. Bu sınırlı önlem kapsamlı bot/DDoS koruması olarak sunulmuyor.
5. **Sahte ürün kanıtı eklenmedi:** müşteri logoları, müşteri yorumları, performans kazancı yüzdeleri ve gerçekte çalışmayan bir AI sohbet demosu yok.
6. **Anlamlı test ayrımı:** ana başarı testi gerçek veritabanını kullanacak; kontrollü hata testlerindeki sahte bağımlılıklar ve ağ yanıtları açıkça belirtilecek.

## Kurulum sırasında gözlenen sorunlar

- Mevcut Vercel uygulama bağlantısı takım/proje listelerini okuyabildi ancak proje oluşturma ve entegrasyon sorguları 403 döndürdü. CLI yolu kullanıldı.
- İlk CLI OAuth onayı hemen terminale yansımadı. `whoami` ile doğrulandıktan sonra devam edildi; bağlantı kurulmuş gibi bildirilmedi.
- Kullanıcı resmi `https://vercel.com/get-started.md` rehberini izlemeyi istedi. Vercel CLI 62.7.0 global kuruldu; mevcut Vercel eklentisi yeniden kurulmadı; resmi MCP endpoint'i kullanıcı ayarına eklendi ve OAuth tamamlandı.
- Supabase ücretsiz planının kurulumu, sağlayıcının koşul kabul adımını gerektirdi. Bu adım kullanıcıya iletildi.
- Kullanıcı koşulları kabul etti; Frankfurt bölgesinde ücretsiz Supabase veritabanı oluşturuldu ve Vercel projesine bağlandı.
- İlk migration `SELF_SIGNED_CERT_IN_CHAIN` hatası verdi. Sertifika kontrolünü kapatmak yerine sağlayıcının public CA sertifikası eklendi ve `verify-full` ile zincir/hostname doğrulaması korunarak migration uygulandı.
- İlk Axe taraması küçük gri metinlerde kontrast sorunları ve diyagramın semantiğinde eksik buldu. Kontrastlar düzeltildi, diyagrama erişilebilir açıklama eklendi; 390 ve 1440 piksel taramaları geçti.
- Gerçek tarayıcı testi `127.0.0.1` isteğinde hatalı 403 buldu: Next.js isteğin URL'sini localhost'a normalize ediyordu. Origin kontrolü HTTP Host authority ile eşleştirildi; güvenilmeyen `X-Forwarded-Host` kullanılmadı. Kabul/red regresyon testleri eklendi.
- Runtime Google Fonts bağımlılığı yerel, OFL lisanslı fontlarla değiştirildi.

## Doğrulama sonuçları

- `npm test`: 43/43 test geçti. Doğrulama, normalizasyon, origin/gövde sınırı, gerçek kaydı bekleme, depolama hatası, boş kayıt kimliği, tekrar ve oran sınırı sözleşmeleri test edildi. Birim testlerindeki kayıt bağımlılığı taklittir.
- `npm run test:e2e`: localhost üzerinde 8/8 geçti. Başarı senaryosu gerçek API ve Supabase'e gider; hata/pending senaryoları kontrollü ağ yanıtları kullanır. 390/1440 px Axe taraması sıfır ihlal, yatay taşma yok.
- `npm run verify:live`: yerel API'nin Supabase'e yazdığı kayıt bağımsız SELECT ile doğrulandı; tekrar aynı kaydı döndürdü, farklı içerik 409 aldı, geçersiz alanlar reddedildi, eşzamanlı yeni kayıtlarda 5/10 dakika sınırı korundu. Anonim okuma engellendi. Yalnız kurgusal `example.com` verisi kullanıldı.
- ESLint, TypeScript ve production build geçti. GitHub Actions aynı kontrolleri temiz Node.js 24 ortamında da başarıyla çalıştırdı.
- `npm audit --omit=dev`: 0 bulgu. Tam audit, ESLint'in geçişli `braces` bağımlılığı zincirinde 5 yüksek bulgu raporladı. Otomatik zorlayıcı çözüm Next.js lint paketini eski ana sürüme düşürdüğü için uygulanmadı; bu geliştirme aracı sınırı README'de açıklandı.

## Canlı yayın kanıtı

- Vercel: https://akis-ai-enteksis.vercel.app — oturum açmadan HTTP 200.
- Kaynak: https://github.com/MuratKomurcu1/akis-ai-enteksis — herkese açık.
- 8 Ekim 2026 00:26 İstanbul: canlı API → Supabase kalıcılık, tekrar, 409 çakışma, sunucu doğrulaması, eşzamanlı 429 sınırı ve anonim erişim reddi bağımsız sorguyla doğrulandı. Test kayıt kimliği: `8298f1e6-a64c-47ac-ac73-1fac2dffee14`.
- Canlı Chromium testleri: 8/8 geçti; gerçek POST 201 ve kayıt kimliği başarı ekranında görüldü. 390/1440 px erişilebilirlik ve yatay taşma kontrolleri temiz. Ayrı gerçek başarı ekranının kayıt kimliği: `9c04ea88-2570-446d-bf3a-790a0368987d`. Kontrollü hata senaryoları mock yanıt kullanır; başarılı kayıt senaryolarında mock yoktur.
- Vercel ilk proje varsayılanı “Other” olduğu için framework hem `vercel.json` hem proje ayarında Next.js olarak açıkça tanımlandı. Yerel raporlar ve araç dosyaları `.vercelignore` ile upload dışında bırakıldı.
- Vercel Git bağlantısı, hesapta GitHub Login Connection bulunmadığından kurulamadı. Canlı yayın CLI ile tamamlandı; otomatik deploy varmış gibi raporlanmadı.

## Kaynaklar

- Görev: https://ai.enteksis.com.tr/calisma
- Ölçütler: https://ai.enteksis.com.tr/degerlendirme-rehberi.md
- Next.js API ve layout belgeleri: kurulu `next` paketindeki `dist/docs/` dizini.
- Vercel kurulumu: https://vercel.com/get-started.md

## Arayüz revizyonu — 8 Ekim 2026

Kullanıcı ilk arayüzdeki hazır AI şablonu hissinin giderilmesini ve daha özgün bir tasarım istedi. Codex ana ajanı sayfa ve CSS'yi yeniden kurdu; ayrı ajanlar form sunumunu ve görsel kaliteyi inceledi.

- Kırık beyaz/kömür paleti, sınırlı chartreuse vurgu, geniş tipografik hiyerarşi ve yerel Instrument Serif italik kullanıldı. Fontun OFL lisansı depoya eklendi.
- İç içe sohbet maketi, parıltı/kalkan ikonları ve eşit hizmet kartları kaldırıldı. Hizmetler, girdi ve sonucu açıklayan numaralı satırlar olarak düzenlendi.
- Akış markası için 27 çizginin üç düzenli çıkışa dönüştüğü özgün, statik SVG çizimi oluşturuldu. Bu çizim çalışan bir modelin arayüzü olarak sunulmaz.
- Form sunumu sadeleştirildi; alan etiketleri, doğrulama, kayıt ve yeniden deneme davranışı korundu. Numara etiketleri erişilebilir alan adını değiştirmeyecek biçimde label dışına taşındı.
- İlk masaüstü Axe taraması giriş animasyonundaki opacity sırasında düşük kontrast buldu. Opacity kaldırıldı; yalnız küçük konum hareketi kaldı ve reduced-motion tercihi desteklendi.
- Production build, ESLint ve TypeScript geçti. Mevcut Playwright testleri değiştirilmeden 8/8 geçti; gerçek API kaydı kullanıldı. Son görsel doğrulama kaydı: `77a52f07-3573-461f-9809-691aa33122e6`.
- 390/1440 px Axe taramaları temiz. 320, 390, 768, 1024 ve 1440 px ölçümlerinde yatay taşma yok. Masaüstü, mobil, form ve gerçek başarı ekranları görsel olarak incelendi.

## Önceki arayüze dönüş — 8 Ekim 2026

Kullanıcı son editoryal tasarımı beğenmediğini belirterek önceki tasarıma dönülmesini istedi. Mavi-beyaz arayüz, önceki form sunumu, ikon ve font düzeni geri getirildi. Uygulama kaynakları `3dedf77` sürümüyle eşleşecek şekilde geri alındı; veritabanı ve API davranışı değiştirilmedi. Tasarım denemesinin AI çalışma kaydı süreç geçmişi olarak korundu.

## Referansa göre banner görseli — 8 Ekim 2026

Kullanıcı, katmanlı izometrik teknoloji illüstrasyonu içeren bir referans paylaşarak ilk banner için Akış AI konseptine uygun bir görsel hazırlanmasını ve yerleştirilmesini istedi.

- Yerleşik Imagegen aracıyla, şeffaf arka planlı özgün bir raster illüstrasyon üretildi. Merkezde şirket dokümanları; çevresinde bilgi, destek ve belge işleme modülleri bulunur. Görsel bir kavram illüstrasyonudur; çalışan ürün ekranı veya gerçek müşteri verisi göstermez.
- Kullanılan tam prompt ve üretim modu [docs/hero-image-prompt.txt](docs/hero-image-prompt.txt) içinde kayıtlıdır. Asıl çıktı [public/images/akis-ai-hero.png](public/images/akis-ai-hero.png), 1448 × 1086 piksel ve alfa kanallı PNG'dir.
- Banner masaüstünde solda görsel, sağda HTML başlık ve bağlantılar olacak şekilde düzenlendi. Mobilde metin ve eylemler önce gelir. Next.js Image, boyut bilgisi, responsive `sizes`, preload ve açıklayıcı alternatif metinle kullanıldı.
- Ana ajan görseli üretti ve sayfaya eklenmiş halini inceledi; arayüz ajanı hero düzenini uyguladı; test ajanı mevcut testleri değiştirmeden çalıştırdı. Diğer sayfa bölümleri ve kayıt akışı korunmuştur.
- Production build, TypeScript ve ESLint geçti. Yerel production sunucusunda 8/8 Playwright testi geçti; gerçek API kayıt senaryosu ve 390/1440 px Axe kontrolleri dahil. 320, 390, 768, 1024 ve 1440 px genişliklerinde yatay taşma yok, görsel yükleniyor ve kırpılmıyor. Masaüstü ve mobil ekran görüntüleri görsel olarak incelendi.

## macOS esintili hizmetler ve ikinci banner — 8 Ekim 2026

Kullanıcı hizmetlerin macOS pencerelerine benzer biçimde sunulmasını, fareyi takip edip hafifçe büyümesini ve bu bölümün altına paylaştığı izometrik referansa uygun bir banner eklenmesini istedi.

- Üç hizmet, dekoratif pencere başlıkları ve açıkça “Örnek görünüm” olarak etiketlenen senaryolarla ayrı bir `ServiceWindows` bileşenine taşındı. Başlıklar, açıklamalar ve form bağlantıları gerçek HTML'dir; örnekler çalışan AI uygulaması olarak sunulmaz.
- Fare hareketi React state yerine `requestAnimationFrame`, ref ve CSS değişkenleriyle uygulanır. Büyüme 1.025; dönüş ±1.8 derece, kayma ±2.5 piksel ile sınırlıdır. Pencerenin dışına çıkış, pointer iptali, sekme odağının kaybı ve hareket tercihinin değişmesi efekti sıfırlar. Dokunmatik cihazlarda ve reduced-motion tercihinde hareket kapalıdır.
- İlk yeni görselin parlak 3D yönü, kullanıcı tarafından ilk hero'ya fazla benzediği için reddedildi. Bu çıktı siteye yerleştirilmedi. Yerleşik Imagegen aracıyla referansa daha yakın, düz izometrik ve mor/pembe/sarı paletli ikinci bir çizim üretildi; lacivert-mor zemin ve sarı şeritler HTML/CSS banner'a eklendi.
- Son görsel [public/images/akis-workflow-banner.png](public/images/akis-workflow-banner.png), şeffaf arka planlı 1448 × 1086 PNG'dir. Tam üretim promptu ve düzeltme bağlamı [docs/workflow-banner-prompt.txt](docs/workflow-banner-prompt.txt) içinde kayıtlıdır. Banner başlığı ve çağrı bağlantısı görsele gömülmeden HTML olarak sunulur.
- Ana ajan görsel üretimi, banner ve sayfa entegrasyonunu; arayüz ajanı pencere bileşenini üstlendi. Ayrı ajanlar görsel kaliteyi, kodu ve erişilebilirlik/etkileşim davranışını incelemekle görevlendirildi.
- İnceleme üç düzeltme üretti: belge örneğindeki küçük etiketler ilk Axe ölçümündeki 4.4:1 kontrast nedeniyle koyulaştırıldı; pencere içerikleri flex ile alt hizaya oturtuldu; banner çiziminin 1024 px'de sağdan kırpılması giderildi. Bağlantıların erişilebilir adları görünür metinle başlayacak şekilde düzenlendi.
- Tarayıcıda 3 pencerenin merkezi ve dört köşesi olmak üzere 15 fare örneği ölçüldü; büyüme, kayma ve dönüş sınırları korundu. Pointerleave/cancel sıfırlaması, çalışma sırasında reduced-motion tercihinin değişmesi, dokunmatik kullanım, Tab/Enter ve görünür odak doğrulandı. 320/390/768/1024/1440 px'de yatay taşma ve pencere çakışması bulunmadı.
- Son production build, TypeScript ve ESLint geçti. Son build üzerinde mevcut 8/8 E2E testi başarılı; gerçek API kayıt akışı dahil. 390/1440 px Axe ile ek hover/klavye odağı taramalarında sıfır ihlal bulundu. 1440 px'de üç CTA'nın üst ve alt koordinatları eşit; 1024 px'de banner çizimi ekran sınırları içinde ve yüklenmiş durumda. Güncel masaüstü, tablet ve mobil ekranlar görsel olarak incelendi.
