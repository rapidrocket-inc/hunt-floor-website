"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/lib/config";
import { FAQS } from "@/lib/seo";

const ICON = {
  plug: (
    <>
      <path d="M9 3v4M15 3v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 7h10v3a5 5 0 01-10 0z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 15v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  spark: <path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2z" fill="currentColor" />,
  tag: (
    <>
      <path d="M4 4h7l9 9-7 7-9-9V4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  floor: (
    <>
      <path d="M4 20V8l6-4 6 4v12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 20h16M9 20v-4h2v4M13 12h.01M10 9h.01" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="18" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 6h6a4 4 0 010 8H8a4 4 0 000 4h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

// FAQ copy lives in lib/seo.ts (shared with the FAQPage JSON-LD); the icons stay
// here, mapped by tag so the two can't drift.
const ICON_BY_TAG: Record<string, React.ReactNode> = {
  Integrations: ICON.plug,
  Intelligence: ICON.spark,
  Pricing: ICON.tag,
  Ownership: ICON.lock,
  Fit: ICON.floor,
  Onboarding: ICON.route,
};

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const year = new Date().getFullYear();

  const toggle = (i: number) => () => setOpen((cur) => (cur === i ? null : i));

  return (
    <section className="faq" id="faq">
      <h2 className="h2 faq__title reveal-up">
        Questions, <em>answered.</em>
      </h2>
      <p className="faq__sub reveal-up">
        Everything founders ask before they put their floor on HuntFloor.
      </p>

      <div className="faq__list reveal-up">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div className={`faq__item${isOpen ? " is-open" : ""}`} key={item.q}>
              <button
                className="faq__q"
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={toggle(i)}
              >
                <span className="faq__ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="19" height="19">
                    {ICON_BY_TAG[item.tag]}
                  </svg>
                </span>
                <span className="faq__q-txt">
                  <span className="faq__chip">{item.tag}</span>
                  <span className="faq__q-title">{item.q}</span>
                </span>
                <span className="faq__mark" aria-hidden="true" />
              </button>
              <div className="faq__ans" id={`faq-a-${i}`} role="region">
                <div className="faq__ans-in">{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="faq__cta reveal-up">
        <span className="faq__cta-txt">Still weighing it up? Talk to the founder.</span>
        <div className="faq__cta-actions">
          <a className="btn btn--primary" href="#access">
            Book a call
          </a>
          <a className="btn btn--ghost" href={WHATSAPP_URL} target="_blank" rel="noopener">
            Message on WhatsApp
          </a>
        </div>
      </div>

      <footer className="footer">
        <span className="footer__glow" aria-hidden="true" />
        <div className="footer__top">
          <div className="footer__brand">
            <div className="brand brand--footer">
              HUNT<span>FLOOR</span>
            </div>
            <p className="footer__tag">The sales floor, run as a market.</p>
            <span className="footer__status">
              <span className="pulse" /> Market open
            </span>
            <a className="footer__cta" href="#access">
              Book a demo
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <span className="footer__h">Product</span>
              <a href="#problem">Problem</a>
              <a href="#loop">How it works</a>
              <a href="#proof">Proof</a>
              <a href="#access">Book a demo</a>
            </div>
            <div className="footer__col">
              <span className="footer__h">Company</span>
              <a href="#top">About</a>
              <a href="#access">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer__legal">
          <span>© {year} HuntFloor</span>
          <a
            className="footer__credit"
            href="https://rapidrocket.co"
            target="_blank"
            rel="noopener"
          >
            <svg className="footer__credit-mark" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M12 2.5c2.8 1.7 4.4 4.9 4.4 8.4l-2 2.1H9.6l-2-2.1C7.6 7.4 9.2 4.2 12 2.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="9.2" r="1.7" fill="currentColor" />
              <path d="M9.4 15.5l-1.9 4 3.5-1.8M14.6 15.5l1.9 4-3.5-1.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Built by <strong>Rapid Rocket</strong>
          </a>
          <div className="footer__social" aria-label="Social links">
            <a href="#" aria-label="X">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 10v6M8 7v.5M12 16v-3.5a1.5 1.5 0 0 1 3 0V16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
