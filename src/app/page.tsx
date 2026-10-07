import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Layers3,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";

const offerings = [
  {
    number: "01",
    icon: Search,
    title: "Şirket içi bilgi asistanı",
    description:
      "Dağınık dokümanlarınızı, ekibinizin sorularına kaynaklarıyla yanıt veren bir bilgi asistanına dönüştürelim.",
    example: "“İzin sürecimiz nasıl işliyor?”",
    detail: "Bilgiye ulaşmak kolaylaşsın.",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Müşteri destek otomasyonu",
    description:
      "Tekrar eden soruları karşılayan, gerektiğinde görüşmeyi ekibinize aktaran bir destek akışı tasarlayalım.",
    example: "“Siparişimin durumunu öğrenebilir miyim?”",
    detail: "Ekibinize daha fazla alan açılsın.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Akıllı belge işleme",
    description:
      "Form, fatura ve raporlardaki bilgileri çıkaralım. Kontrol gerektiren kayıtları insan onayına sunalım.",
    example: "Belgeden düzenli, işlenebilir veriye.",
    detail: "Elle veri girişi azalsın.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#" aria-label="Akış AI ana sayfa">
            <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
            <span>akış<span className="brand-ai">ai</span></span>
          </a>
          <nav aria-label="Ana menü">
            <a className="nav-link" href="#hizmetler">Hizmetler</a>
            <a className="nav-link" href="#yaklasim">Yaklaşımımız</a>
            <a className="header-cta" href="#talep">Birlikte başlayalım <ArrowUpRight size={17} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>

      <main id="icerik">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Yapay zekâ, işinizin akışında.</p>
            <h1 id="hero-title">Az tekrar.<br />Daha çok <span className="accent-word">ilerleme<svg viewBox="0 0 370 16" aria-hidden="true"><path d="M4 11C94 1 245 0 366 8" /></svg>.</span></h1>
            <p className="hero-description">Ekibinizin zamanını alan işleri akıllı akışlara dönüştürelim. Bilginize ulaşın, müşterilerinize yetişin, asıl işinize odaklanın.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#talep">İhtiyacınızı konuşalım <ArrowUpRight size={20} aria-hidden="true" /></a>
              <a className="text-link" href="#hizmetler">Hizmetleri keşfedin <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <p className="hero-note"><ShieldCheck size={17} aria-hidden="true" /> Kontrol sizde. Yapay zekâ işinize destek olsun.</p>
          </div>

          <div className="flow-illustration" role="img" aria-label="Örnek bilgi akışı: Şirket dokümanları bilgi asistanına aktarılır, asistan sorulara kaynak göstererek yanıt verir.">
            <div className="flow-caption" aria-hidden="true"><span className="small-dot" /> Bir bilgi akışı, sadeleşti.</div>
            <div className="flow-source" aria-hidden="true">
              <div className="flow-source-icon"><Layers3 size={21} /></div>
              <div><strong>Şirket bilginiz</strong><span>Dokümanlar · Kılavuzlar · Notlar</span></div>
              <span className="source-count">GİRDİ</span>
            </div>
            <div className="flow-connector" aria-hidden="true"><span /><ArrowDown size={15} /></div>
            <div className="flow-engine" aria-hidden="true">
              <span className="engine-icon"><Sparkles size={24} /></span>
              <div><span className="engine-label">AKIŞ AI</span><strong>Bilgi anlam kazanır.</strong></div>
              <div className="engine-orbit"><i /><i /><i /></div>
            </div>
            <div className="flow-connector" aria-hidden="true"><span /><ArrowDown size={15} /></div>
            <div className="flow-answer" aria-hidden="true">
              <div className="answer-question"><span className="avatar">E</span><p>İzin talebimi nasıl iletebilirim?</p></div>
              <div className="answer-response"><span className="answer-spark"><Sparkles size={16} /></span><div><p>İzin talep formunu doldurup ekip yöneticinizin onayına iletebilirsiniz.</p><span className="answer-source"><FileText size={12} /> Çalışan rehberi · Bölüm 4</span></div></div>
              <div className="answer-footer"><Check size={14} /> Kaynağı belli. Kontrol edilebilir.</div>
            </div>
            <p className="flow-disclaimer" aria-hidden="true">Örnek senaryo · Gerçek şirket verisi içermez.</p>
          </div>
        </section>

        <div className="principles-strip">
          <div className="container principles-inner">
            <p>Teknoloji bir araç.<br /><strong>Odak noktamız sizin işiniz.</strong></p>
            <span><Check size={18} aria-hidden="true" /> İhtiyaca göre çözüm</span>
            <span><Check size={18} aria-hidden="true" /> İnsan denetimi</span>
            <span><Check size={18} aria-hidden="true" /> Ölçülebilir süreç</span>
          </div>
        </div>

        <section className="services-section container section-spacing" id="hizmetler" aria-labelledby="services-title">
          <div className="section-heading">
            <div><p className="eyebrow">NEREDEN BAŞLAYABİLİRİZ?</p><h2 id="services-title">Doğru yerde,<br />işe yarayan yapay zekâ.</h2></div>
            <p className="section-intro">Her işe aynı çözüm olmaz. İş akışınızdaki gerçek bir ihtiyacı bulalım, oradan başlayalım.</p>
          </div>
          <div className="service-grid">
            {offerings.map((offering) => (
              <article className="service-card" key={offering.number}>
                <div className="service-card-top"><span className="service-icon"><offering.icon size={24} strokeWidth={1.7} aria-hidden="true" /></span><span className="service-number">/{offering.number}</span></div>
                <h3>{offering.title}</h3>
                <p className="service-description">{offering.description}</p>
                <div className="service-example"><span className="example-label">BİR KULLANIM ÖRNEĞİ</span><p>{offering.example}</p></div>
                <a className="service-link" href="#talep" aria-label={`${offering.title} için ihtiyacınızı paylaşın`}>{offering.detail}<ArrowUpRight size={20} aria-hidden="true" /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="approach-section" id="yaklasim" aria-labelledby="approach-title">
          <div className="container">
            <div className="section-heading approach-heading"><div><p className="eyebrow">BÜYÜK VAATLERDEN ÖNCE, KÜÇÜK ADIMLAR.</p><h2 id="approach-title">Birlikte anlayalım.<br />Birlikte geliştirelim.</h2></div><p className="section-intro">Önce süreci tanırız. Sonra kontrollü bir pilotla neyin işe yaradığını görürüz.</p></div>
            <ol className="steps-grid">
              <li><div className="step-top"><span>01</span><ArrowRight size={23} aria-hidden="true" /></div><h3>İhtiyacı netleştirelim.</h3><p>Tekrar eden işi, kullandığınız araçları ve beklediğiniz sonucu birlikte tanımlayalım.</p></li>
              <li><div className="step-top"><span>02</span><ArrowRight size={23} aria-hidden="true" /></div><h3>Küçük bir pilot kuralım.</h3><p>Sınırlı bir senaryoda çözümü deneyelim. Veri erişimini ve insan kontrolünü baştan belirleyelim.</p></li>
              <li><div className="step-top"><span>03</span><Check size={23} aria-hidden="true" /></div><h3>Ölçerek geliştirelim.</h3><p>Yanıt kalitesini, harcanan zamanı ve ekibinizin geri bildirimlerini değerlendirerek ilerleyelim.</p></li>
            </ol>
          </div>
        </section>

        <section className="contact-section" id="talep" aria-labelledby="contact-title">
          <div className="container contact-grid">
            <div className="contact-copy"><p className="eyebrow">İLK ADIM, SİZİ DİNLEMEK.</p><h2 id="contact-title">Hangi işiniz<br />daha kolay<br /><span>aksın?</span></h2><p>Aklınızdaki ihtiyacı birkaç cümleyle paylaşın. Başlamak için tüm cevapları bilmeniz gerekmiyor.</p><div className="contact-divider" /><div className="demo-note"><ShieldCheck size={21} aria-hidden="true" /><p><strong>Bu bir değerlendirme demosudur.</strong> Lütfen yalnızca kurgusal test verisi kullanın. Gönderdiğiniz test talebi kaydedilir; e-posta gönderilmez.</p></div></div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><a className="brand" href="#" aria-label="Akış AI sayfa başına dön"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>akış<span className="brand-ai">ai</span></span></a><p>İşinize alan açan yapay zekâ.</p><span>Akış AI, kurgusal bir markadır. <span className="footer-year">© 2026</span></span></div></footer>
    </>
  );
}
