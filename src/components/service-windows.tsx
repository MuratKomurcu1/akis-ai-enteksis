"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Check, FileText, MessageSquareText, Search } from "lucide-react";
import styles from "./service-windows.module.css";

const offerings = [
  {
    number: "01",
    variant: "knowledge",
    windowTitle: "Bilgi asistanı",
    title: "Şirket içi bilgi asistanı",
    description: "Dağınık dokümanlarınızı, ekibinizin sorularına kaynaklarıyla yanıt veren bir bilgi asistanına dönüştürelim.",
    detail: "Bilgiye ulaşmak kolaylaşsın.",
  },
  {
    number: "02",
    variant: "support",
    windowTitle: "Destek akışı",
    title: "Müşteri destek otomasyonu",
    description: "Tekrar eden soruları karşılayan, gerektiğinde görüşmeyi ekibinize aktaran bir destek akışı tasarlayalım.",
    detail: "Ekibinize daha fazla alan açılsın.",
  },
  {
    number: "03",
    variant: "documents",
    windowTitle: "Belge işleme",
    title: "Akıllı belge işleme",
    description: "Form, fatura ve raporlardaki bilgileri çıkaralım. Kontrol gerektiren kayıtları insan onayına sunalım.",
    detail: "Elle veri girişi azalsın.",
  },
] as const;

type ServiceVariant = (typeof offerings)[number]["variant"];

function ServicePreview({ variant }: { variant: ServiceVariant }) {
  if (variant === "knowledge") {
    return (
      <div className={`${styles.preview} ${styles.knowledgePreview}`}>
        <div className={styles.previewTopline}><Search size={13} aria-hidden="true" /><span>Bilginin kaynağına ulaşın</span></div>
        <p className={styles.searchExample}>İzin sürecimiz nasıl işliyor?</p>
        <div className={styles.answerExample}>
          <span className={styles.answerMarker} aria-hidden="true" />
          <p>Talep formunu ekip yöneticinizin onayına iletebilirsiniz.</p>
        </div>
        <div className={styles.sourceChip}><FileText size={12} aria-hidden="true" /><span>Çalışan rehberi · Bölüm 4</span></div>
      </div>
    );
  }

  if (variant === "support") {
    return (
      <div className={`${styles.preview} ${styles.supportPreview}`}>
        <div className={styles.previewTopline}><MessageSquareText size={13} aria-hidden="true" /><span>Konuşma, doğru yere aksın</span></div>
        <p className={styles.customerMessage}>Siparişimi nasıl takip ederim?</p>
        <p className={styles.assistantMessage}>Sipariş numaranızla destek ekibine aktarabilirim.</p>
        <div className={styles.handoff}><span aria-hidden="true" />Gerektiğinde insan devri</div>
      </div>
    );
  }

  return (
    <div className={`${styles.preview} ${styles.documentPreview}`}>
      <div className={styles.previewTopline}><FileText size={13} aria-hidden="true" /><span>Belgeden düzenli bilgiye</span></div>
      <div className={styles.documentExample}>
        <div className={styles.paper} aria-hidden="true"><FileText size={20} strokeWidth={1.5} /><i /><i /><i /></div>
        <div className={styles.documentFields}>
          <div><span>Belge türü</span><strong>Örnek fatura</strong></div>
          <div><span>Çıkarılan alanlar</span><strong>Tarih, tutar, açıklama</strong></div>
          <p><Check size={12} aria-hidden="true" /> İnsan kontrolüne hazır</p>
        </div>
      </div>
    </div>
  );
}

export function ServiceWindows() {
  const shellsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const motionAllowed = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const resets: Array<() => void> = [];
    const cleanups: Array<() => void> = [];

    for (const shell of shellsRef.current) {
      const card = shell?.querySelector<HTMLElement>("[data-service-window]");
      if (!shell || !card) continue;

      let frame: number | null = null;
      let pointerX = 0;
      let pointerY = 0;

      const reset = () => {
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        delete shell.dataset.tracking;
        for (const property of ["--move-x", "--move-y", "--rotate-x", "--rotate-y", "--scale"]) {
          card.style.removeProperty(property);
        }
      };

      const followPointer = (event: PointerEvent) => {
        if (!motionAllowed.matches || event.pointerType !== "mouse") {
          reset();
          return;
        }
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (frame !== null) return;

        frame = window.requestAnimationFrame(() => {
          frame = null;
          // Measure the stationary shell, so the transformed card never feeds back into tracking.
          const bounds = shell.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, ((pointerX - bounds.left) / bounds.width - 0.5) * 2));
          const y = Math.max(-1, Math.min(1, ((pointerY - bounds.top) / bounds.height - 0.5) * 2));
          card.style.setProperty("--move-x", `${(x * 2.5).toFixed(2)}px`);
          card.style.setProperty("--move-y", `${(y * 2.5).toFixed(2)}px`);
          card.style.setProperty("--rotate-x", `${(-y * 1.8).toFixed(2)}deg`);
          card.style.setProperty("--rotate-y", `${(x * 1.8).toFixed(2)}deg`);
          card.style.setProperty("--scale", "1.025");
          shell.dataset.tracking = "true";
        });
      };

      shell.addEventListener("pointerenter", followPointer, { passive: true });
      shell.addEventListener("pointermove", followPointer, { passive: true });
      shell.addEventListener("pointerleave", reset);
      shell.addEventListener("pointercancel", reset);
      resets.push(reset);
      cleanups.push(() => {
        reset();
        shell.removeEventListener("pointerenter", followPointer);
        shell.removeEventListener("pointermove", followPointer);
        shell.removeEventListener("pointerleave", reset);
        shell.removeEventListener("pointercancel", reset);
      });
    }

    const resetAll = () => resets.forEach((reset) => reset());
    motionAllowed.addEventListener("change", resetAll);
    window.addEventListener("blur", resetAll);
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      motionAllowed.removeEventListener("change", resetAll);
      window.removeEventListener("blur", resetAll);
    };
  }, []);

  return (
    <div className={styles.windows}>
      {offerings.map((offering, index) => (
        <div className={styles.windowShell} key={offering.variant} ref={(node) => { shellsRef.current[index] = node; }}>
          <article className={styles.window} data-service-window aria-labelledby={`service-${offering.variant}`}>
            <div className={styles.toolbar} aria-hidden="true">
              <span className={styles.trafficLights}><i /><i /><i /></span>
              <span className={styles.windowTitle}>{offering.windowTitle}</span>
              <span className={styles.windowNumber}>{offering.number}</span>
            </div>
            <div className={styles.content}>
              <h3 id={`service-${offering.variant}`}>{offering.title}</h3>
              <p className={styles.description}>{offering.description}</p>
              <div className={styles.exampleBlock}>
                <p className={styles.exampleLabel}>ÖRNEK GÖRÜNÜM</p>
                <ServicePreview variant={offering.variant} />
              </div>
              <a className={styles.serviceLink} href="#talep" aria-label={`${offering.detail} ${offering.title} için ihtiyacınızı paylaşın`}>
                <span>{offering.detail}</span><ArrowUpRight size={19} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
