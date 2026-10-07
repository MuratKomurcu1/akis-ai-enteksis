"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, X } from "lucide-react";
import styles from "./static-chatbot.module.css";

const topics = [
  {
    label: "Hizmetler",
    question: "Hangi hizmetleri sunuyorsunuz?",
    answer: "Şirket içi bilgi asistanı, müşteri destek otomasyonu ve akıllı belge işleme. İhtiyacınıza uygun hizmeti talep formunda seçebilirsiniz.",
  },
  {
    label: "Nasıl başlarız?",
    question: "Nasıl başlayabiliriz?",
    answer: "Talep formunda bir hizmet seçip kolaylaştırmak istediğiniz işi birkaç cümleyle anlatın. Bu demo için kurgusal bir örnek yeterli.",
  },
  {
    label: "Fiyatlandırma",
    question: "Fiyatlandırma nasıl yapılıyor?",
    answer: "Bu demoda fiyatlandırma bulunmuyor. Bir projenin kapsamı; iş akışı, kullanılacak veri ve gereken entegrasyonlar netleştiğinde belirlenebilir.",
  },
  {
    label: "Demo hakkında",
    question: "Bu bir demo mu?",
    answer: "Evet. Akış AI, değerlendirme için hazırlanmış kurgusal bir hizmet sitesidir. Form kayıtları test amaçlı saklanır; e-posta gönderilmez.",
  },
] as const;

type Exchange = { id: number; topic: (typeof topics)[number] };

export function StaticChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const instanceId = useId();
  const panelId = `akis-guide-${instanceId}`;
  const titleId = `${panelId}-title`;
  const descriptionId = `${panelId}-description`;
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(0);
  const formFocusFrameRef = useRef<number | null>(null);

  function closeGuide() {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setIsOpen(false);
      launcherRef.current?.focus();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    const log = logRef.current;
    if (isOpen && log) log.scrollTop = log.scrollHeight;
  }, [isOpen, exchanges]);

  useEffect(() => () => {
    if (formFocusFrameRef.current !== null) window.cancelAnimationFrame(formFocusFrameRef.current);
  }, []);

  function chooseTopic(topic: (typeof topics)[number]) {
    const exchange = { id: ++nextIdRef.current, topic };
    setExchanges((previous) => [...previous.slice(-7), exchange]);
  }

  function goToForm() {
    setIsOpen(false);
    if (formFocusFrameRef.current !== null) window.cancelAnimationFrame(formFocusFrameRef.current);
    formFocusFrameRef.current = window.requestAnimationFrame(() => {
      formFocusFrameRef.current = null;
      const field = document.getElementById("name");
      const fallback = document.querySelector<HTMLElement>("#talep button, #talep h2");
      const target = field && !field.matches(":disabled") ? field : fallback;
      if (!target) return;
      if (target.tagName === "H2") target.tabIndex = -1;
      target.focus();
    });
  }

  return (
    <>
      {isOpen && (
        <section
          className={styles.panel}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <header className={styles.header}>
            <span className={styles.guideIcon} aria-hidden="true"><MessageCircle size={20} strokeWidth={1.7} /></span>
            <div className={styles.heading}>
              <h2 id={titleId}>Akış rehberi</h2>
              <p id={descriptionId}>Hazır yanıtlar · Demo</p>
            </div>
            <button ref={closeRef} className={styles.closeButton} type="button" onClick={closeGuide} aria-label="Rehberi kapat"><X size={20} aria-hidden="true" /></button>
          </header>

          <div ref={logRef} className={styles.log} role="log" aria-label="Rehber konuşması" aria-live="polite" aria-relevant="additions" aria-atomic="false" tabIndex={0}>
            <p className={styles.answer}>Merhaba. Akış AI hakkında ne öğrenmek istersiniz?</p>
            {exchanges.map(({ id, topic }) => (
              <div className={styles.exchange} key={id}>
                <p className={styles.question}><span className={styles.srOnly}>Siz: </span>{topic.question}</p>
                <p className={styles.answer}><span className={styles.srOnly}>Akış rehberi: </span>{topic.answer}</p>
              </div>
            ))}
          </div>

          <div className={styles.topics}>
            <p>Bir konu seçin</p>
            <div className={styles.topicGrid}>
              {topics.map((topic) => <button className={styles.topicButton} type="button" key={topic.label} onClick={() => chooseTopic(topic)}>{topic.label}</button>)}
            </div>
          </div>

          <footer className={styles.footer}>
            <a href="#talep" onClick={goToForm}>Talep formuna geç <ArrowUpRight size={17} aria-hidden="true" /></a>
          </footer>
        </section>
      )}

      <button
        ref={launcherRef}
        className={styles.launcher}
        type="button"
        aria-label={isOpen ? "Akış rehberini kapat" : "Akış rehberini aç"}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => { if (isOpen) closeGuide(); else setIsOpen(true); }}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
        <span>Akış rehberi</span>
      </button>
    </>
  );
}
