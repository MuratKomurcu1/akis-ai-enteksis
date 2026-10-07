import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { ServiceWindows } from "@/components/service-windows";

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
        <section className="hero-banner" aria-labelledby="hero-title">
          <div className="hero container">
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

            <div className="hero-art">
              <Image
                className="hero-art-image"
                src="/images/akis-ai-hero.png"
                alt="Şirket dokümanlarını bilgi asistanı, müşteri desteği ve belge işleme akışlarına bağlayan izometrik yapay zekâ illüstrasyonu."
                width={1448}
                height={1086}
                sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 850px) 640px, (max-width: 1100px) 50vw, 600px"
                preload
              />
            </div>
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

        <section className="services-section section-spacing" id="hizmetler" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading">
              <div><p className="eyebrow">NEREDEN BAŞLAYABİLİRİZ?</p><h2 id="services-title">Doğru yerde,<br />işe yarayan yapay zekâ.</h2></div>
              <p className="section-intro">Her işe aynı çözüm olmaz. İş akışınızdaki gerçek bir ihtiyacı bulalım, oradan başlayalım.</p>
            </div>
            <ServiceWindows />
          </div>
        </section>

        <section className="workflow-banner" aria-labelledby="workflow-title">
          <div className="container workflow-inner">
            <div className="workflow-copy">
              <p className="eyebrow">AKIŞ AI · İNSAN ODAKLI TEKNOLOJİ</p>
              <h2 id="workflow-title">İşler akışında.<br /><span>Ekibiniz odağında.</span></h2>
              <p className="workflow-description">Bilgiye ulaşmayı, talepleri karşılamayı ve belgeleri işlemeyi kolaylaştıralım. Ekibinize asıl işi için alan açılsın.</p>
              <a className="button workflow-cta" href="#talep">İlk akışı birlikte kuralım <ArrowUpRight size={19} aria-hidden="true" /></a>
              <p className="workflow-note">Akıllı süreçler. Kontrol sizde.</p>
            </div>
            <div className="workflow-art">
              <Image
                src="/images/akis-workflow-banner.png"
                alt="Tablet üzerinde çalışan bir kişinin, belge ve iletişim öğeleriyle birlikte renkli izometrik çizimi."
                width={1448}
                height={1086}
                sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 850px) 640px, 60vw"
              />
            </div>
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
