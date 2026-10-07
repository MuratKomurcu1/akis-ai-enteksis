import { ArrowDown, ArrowUpRight } from "lucide-react";
import { LeadForm } from "@/components/lead-form";

const services = [
  {
    number: "01",
    title: "Bilgi, arandığı yerde.",
    name: "Şirket içi bilgi asistanı",
    description: "Kılavuzlar, notlar, dağınık klasörler. Ekibinizin sorularına şirketinizin kendi bilgisinden, kaynağını göstererek yanıt veren bir asistan.",
    input: "Dokümanlar ve ekip soruları",
    output: "Kaynaklı, kontrol edilebilir yanıtlar",
  },
  {
    number: "02",
    title: "Her soruya, bir sonraki adım.",
    name: "Müşteri destek otomasyonu",
    description: "Sık sorulan soruları karşılayan, talepleri doğru yere yönlendiren bir destek akışı. İnsan gerektiğinde görüşme ekibinize geçer.",
    input: "Müşteri mesajları",
    output: "Yanıt veya doğru ekibe aktarım",
  },
  {
    number: "03",
    title: "Belgeden işe yarayan veriye.",
    name: "Akıllı belge işleme",
    description: "Fatura, form ve raporlardaki bilgileri düzenli veriye dönüştüren uygulamalar. Belirsiz alanlar kontrol edilmek üzere işaretlenir.",
    input: "Formlar, faturalar, raporlar",
    output: "Düzenli veri ve inceleme listesi",
  },
];

// An original line study: separate inputs find three ordered paths.
// Static server-rendered artwork; it does not simulate a running AI product.
function FlowStudy() {
  return (
    <figure className="flow-study" aria-label="Farklı yönlerden gelen çizgilerin üç düzenli akışa dönüşmesini gösteren çizim">
      <svg viewBox="0 0 840 330" fill="none" aria-hidden="true">
        <path className="flow-paper" d="M306 16 507 92 426 310 225 234Z" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.15">
          {Array.from({ length: 27 }, (_, i) => {
            const start = 38 + i * 9;
            const end = 64 + Math.floor(i / 9) * 86 + (i % 9) * 2.8;
            return <path key={i} d={`M-20 ${start} C142 ${start} 177 ${354 - i * 4.9} 337 ${306 - i * 5.9} S524 ${end} 677 ${end} H775`} />;
          })}
        </g>
        {[75, 161, 247].map((y, i) => <g key={y} className="flow-endpoint"><rect x="778" y={y - 3} width="6" height="6" fill="currentColor" /><text x="803" y={y + 5}>0{i + 1}</text></g>)}
      </svg>
      <figcaption><span>DAĞINIK BİLGİ</span><span className="flow-caption-line" /><span>ÜÇ ÇALIŞMA ALANI</span></figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      <header className="site-header container">
        <a className="brand" href="#" aria-label="Akış AI ana sayfa">akış<span className="brand-dot">.</span><span className="brand-note">YAPAY ZEKÂ<br />UYGULAMALARI</span></a>
        <nav aria-label="Ana menü">
          <a className="nav-link" href="#hizmetler"><span>01</span> Hizmetler</a>
          <a className="nav-link" href="#yaklasim"><span>02</span> Yaklaşım</a>
          <a className="header-cta" href="#talep">Bir proje konuşalım <ArrowUpRight size={19} aria-hidden="true" /></a>
        </nav>
      </header>

      <main id="icerik">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-topline"><p>İŞ SÜREÇLERİ İÇİN YAPAY ZEKÂ</p><span>AKIŞ AI — 2026</span></div>
          <h1 id="hero-title">İşinize <em>alan açın.</em></h1>
          <div className="hero-bottom">
            <FlowStudy />
            <div className="hero-intro">
              <p>Şirket bilginize ulaşmayı ve her gün tekrarlanan işleri kolaylaştıran yapay zekâ uygulamaları geliştiriyoruz.</p>
              <a className="round-link" href="#talep"><span>İhtiyacınızı anlatın</span><span className="round-arrow"><ArrowUpRight size={25} strokeWidth={1.4} aria-hidden="true" /></span></a>
            </div>
          </div>
          <div className="hero-baseline"><span>Bilgi asistanları / Destek akışları / Belge işleme</span><a href="#hizmetler">Çalışma alanlarımız <ArrowDown size={16} aria-hidden="true" /></a></div>
        </section>

        <section className="services-section container" id="hizmetler" aria-labelledby="services-title">
          <div className="section-opening"><p className="section-index">01 / NELER YAPIYORUZ</p><h2 id="services-title">Her işin<br />kendi akışı var.</h2></div>
          <div className="service-list">
            {services.map((service) => (
              <article className="service-row" key={service.number}>
                <span className="service-number" aria-hidden="true">{service.number}</span>
                <div className="service-title"><p>{service.name}</p><h3>{service.title}</h3></div>
                <div className="service-detail"><p>{service.description}</p><dl><div><dt>Girdi</dt><dd>{service.input}</dd></div><div><dt>Sonuç</dt><dd>{service.output}</dd></div></dl></div>
                <a className="service-action" href="#talep" aria-label={`${service.name} için ihtiyacınızı paylaşın`}><ArrowUpRight size={28} strokeWidth={1.25} aria-hidden="true" /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="approach-section" id="yaklasim" aria-labelledby="approach-title">
          <div className="container approach-layout">
            <div className="approach-copy"><p className="section-index">02 / NASIL ÇALIŞIYORUZ</p><h2 id="approach-title">Önce doğru<br />soruyu sorarız.</h2><p>Bir aracı işinize uydurmakla başlamayız. Nerede zaman kaybettiğinize, hangi bilginin eksik kaldığına bakarız.</p><div className="approach-mark" aria-hidden="true"><span /><span /><span /></div></div>
            <ol className="process-list">
              <li><span className="process-number">01</span><div><h3>İşi anlayalım.</h3><p>Tekrarlanan adımı, kullandığınız araçları ve çözülmesini istediğiniz sorunu birlikte tanımlayalım.</p></div></li>
              <li><span className="process-number">02</span><div><h3>Bir senaryoda deneyelim.</h3><p>Sınırlı bir pilot kuralım. Hangi veriye erişileceğini ve nerede insan onayı gerekeceğini baştan belirleyelim.</p></div></li>
              <li><span className="process-number">03</span><div><h3>Sonuca bakarak ilerleyelim.</h3><p>Yanıtları ve hata örneklerini inceleyelim. Ekibin geri bildirimiyle çözümün nerede işe yaradığını görelim.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="contact-section container" id="talep" aria-labelledby="contact-title">
          <div className="contact-copy"><p className="section-index">03 / BİR BAŞLANGIÇ</p><h2 id="contact-title">Aklınızdaki<br />iş nedir<span>?</span></h2><p>Her gün tekrar ettiğiniz bir adım ya da bulmakta zorlandığınız bir bilgi. Bir örnekle başlayabiliriz.</p><a className="back-to-services" href="#hizmetler">Hizmetlere tekrar bak <ArrowUpRight size={16} aria-hidden="true" /></a><aside className="demo-note"><span>DEMO NOTU</span><p>Bu bir değerlendirme projesidir. Yalnızca kurgusal test verisi kullanın. Form kaydedilir; e-posta gönderilmez.</p></aside></div>
          <LeadForm />
        </section>
      </main>

      <footer className="site-footer"><div className="container"><div className="footer-top"><span>DAHA İYİ ÇALIŞAN İŞLER İÇİN.</span><a href="#">Başa dön <ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="footer-wordmark" aria-hidden="true">akış<span>.</span><svg viewBox="0 0 200 200" fill="none"><path d="M25 175 175 25M25 25H175V175" stroke="currentColor" strokeWidth="8" /></svg></div><div className="footer-bottom"><span>© 2026 Akış AI</span><span>Kurgusal marka · Değerlendirme çalışması</span></div></div></footer>
    </>
  );
}
