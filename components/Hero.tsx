"use client";

import { useUI } from "./UIProvider";
import StaggeredText from "./StaggeredText";
import HeroWorkspace from "./HeroWorkspace";

// denser, faster ray field (deterministic -> no hydration mismatch)
const RAYS = [
  { l: 3, d: 0.0, t: 4.2, h: 46, o: 0.34 },
  { l: 7, d: 1.9, t: 5.1, h: 40, o: 0.24 },
  { l: 11, d: 3.4, t: 4.6, h: 52, o: 0.42 },
  { l: 15, d: 0.9, t: 5.6, h: 38, o: 0.22 },
  { l: 19, d: 2.7, t: 4.0, h: 48, o: 0.5 },
  { l: 23, d: 4.3, t: 5.3, h: 42, o: 0.3 },
  { l: 27, d: 0.5, t: 4.8, h: 55, o: 0.55 },
  { l: 31, d: 3.0, t: 4.3, h: 44, o: 0.32 },
  { l: 35, d: 1.7, t: 5.5, h: 50, o: 0.44 },
  { l: 39, d: 4.0, t: 4.1, h: 38, o: 0.24 },
  { l: 43, d: 1.1, t: 5.0, h: 52, o: 0.46 },
  { l: 47, d: 2.4, t: 4.5, h: 42, o: 0.3 },
  { l: 51, d: 4.6, t: 5.2, h: 46, o: 0.28 },
  { l: 55, d: 0.7, t: 4.0, h: 54, o: 0.5 },
  { l: 59, d: 3.2, t: 4.7, h: 40, o: 0.26 },
  { l: 63, d: 1.5, t: 5.4, h: 50, o: 0.4 },
  { l: 67, d: 4.1, t: 4.2, h: 44, o: 0.3 },
  { l: 71, d: 2.0, t: 4.9, h: 38, o: 0.22 },
  { l: 75, d: 3.7, t: 5.1, h: 52, o: 0.45 },
  { l: 79, d: 0.3, t: 4.4, h: 42, o: 0.34 },
  { l: 83, d: 2.9, t: 5.6, h: 48, o: 0.3 },
  { l: 87, d: 1.3, t: 4.6, h: 40, o: 0.4 },
  { l: 91, d: 4.4, t: 5.0, h: 50, o: 0.26 },
  { l: 95, d: 2.2, t: 4.3, h: 44, o: 0.36 },
  { l: 98, d: 0.8, t: 5.3, h: 38, o: 0.22 },
] as const;

export default function Hero() {
  const { openFilm } = useUI();

  return (
    <section className="hero" id="top">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__rays" aria-hidden="true">
        {RAYS.map((r, i) => (
          <span
            key={i}
            className="ray"
            style={
              {
                left: `${r.l}%`,
                height: `${r.h}%`,
                "--dur": `${r.t}s`,
                "--delay": `${r.d}s`,
                "--op": r.o,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="hero__floorglow" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__copy">
          <div className="hero__index reveal" data-r="1">
            <span>The Floor</span>
            <span className="open">
              <span className="dot--green" /> Market open
            </span>
          </div>
          <h1 className="hero__title">
            <span className="reveal hero-em" data-r="2">
              A free lead is a dead lead.
            </span>
            <StaggeredText
              className="hero-payoff"
              text={"So HuntFloor makes your reps buy them."}
              baseDelay={0.42}
              stagger={0.06}
            />
          </h1>
          <p className="hero__sub reveal" data-r="4">
            Every rep gets a monthly lead budget and spends it on the leads
            they&rsquo;ll actually work &mdash; so nothing you paid for dies in a group
            chat. AI does the routing, everyone settles to a P&amp;L, and it all runs
            on top of your CRM and ad accounts.
          </p>
          <div className="hero__cta reveal" data-r="5">
            <a className="btn btn--primary" href="#access">
              Book a demo
            </a>
            <a className="btn btn--ghost" href="#loop">
              See it live
            </a>
          </div>
          <button
            className="hero__film reveal"
            data-r="6"
            type="button"
            onClick={openFilm}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" />
            </svg>
            Watch the 20-second film
          </button>
        </div>

        <HeroWorkspace />
      </div>
    </section>
  );
}
