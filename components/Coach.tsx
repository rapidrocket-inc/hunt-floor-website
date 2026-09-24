"use client";

import { useEffect, useRef, useState } from "react";
import { countTo, prefersReducedMotion } from "@/lib/format";

const REPS = [
  { name: "Priya N.", score: 92, best: true },
  { name: "Dev R.", score: 74, best: false },
  { name: "Arjun K.", score: 61, best: false },
];
const ASSIST =
  "Open with the ROI angle — deals like this close about 2× faster when booked for the evening.";
const RISK_VALUE = 18000;

const SparkIcon = (
  <path d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2z" fill="currentColor" />
);

const BEATS = [
  {
    label: "Match",
    caption: "Routed to the rep most likely to close it.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </>
    ),
  },
  {
    label: "Assist",
    caption: "Assists the call and the follow-up.",
    icon: SparkIcon,
  },
  {
    label: "Predict",
    caption: "Managers see what to fix before a lead goes cold.",
    icon: (
      <>
        <path d="M4 16l4-4 3 2 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7h4v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function Coach() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [play, setPlay] = useState(false);
  const pinnedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scoreRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const riskRef = useRef<HTMLSpanElement | null>(null);
  const cancels = useRef<Array<() => void>>([]);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // start on-screen + auto-advance through the beats
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setPlay(true);
      return;
    }
    let interval: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPlay(true);
            if (!interval)
              interval = setInterval(() => {
                if (!pinnedRef.current) setActive((a) => (a + 1) % BEATS.length);
              }, 3600);
          } else if (interval) {
            clearInterval(interval);
            interval = null;
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  // per-beat animation (runs each time the active beat changes, once playing)
  useEffect(() => {
    if (!play) return;
    const reduce = prefersReducedMotion();
    cancels.current.forEach((c) => c());
    cancels.current = [];
    if (typeTimer.current) {
      clearInterval(typeTimer.current);
      typeTimer.current = null;
    }

    if (active === 0) {
      REPS.forEach((r, i) => {
        const span = scoreRefs.current[i];
        if (!span) return;
        if (reduce) {
          span.textContent = String(r.score);
          return;
        }
        cancels.current.push(
          countTo(0, r.score, 900, (v) => {
            span.textContent = String(Math.round(v));
          })
        );
      });
    } else if (active === 1) {
      if (reduce) {
        setTyped(ASSIST);
      } else {
        setTyped("");
        let i = 0;
        typeTimer.current = setInterval(() => {
          i += 1;
          setTyped(ASSIST.slice(0, i));
          if (i >= ASSIST.length && typeTimer.current) {
            clearInterval(typeTimer.current);
            typeTimer.current = null;
          }
        }, 26);
      }
    } else if (active === 2) {
      const span = riskRef.current;
      if (span) {
        if (reduce) span.textContent = `$${RISK_VALUE.toLocaleString("en-US")}`;
        else
          cancels.current.push(
            countTo(0, RISK_VALUE, 1000, (v) => {
              span.textContent = `$${Math.round(v).toLocaleString("en-US")}`;
            })
          );
      }
    }

    return () => {
      cancels.current.forEach((c) => c());
      cancels.current = [];
      if (typeTimer.current) {
        clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    };
  }, [active, play]);

  const pin = (i: number) => {
    pinnedRef.current = true;
    setActive(i);
  };
  const unpin = () => {
    pinnedRef.current = false;
  };

  return (
    <section className="coach" id="coach">
      <div className="coach__head reveal-up">
        <span className="eyebrow">The intelligence</span>
        <h2 className="h2">
          The floor gets smarter <em>with every deal.</em>
        </h2>
        <p className="coach__sub">
          It routes each lead to the rep most likely to close it, assists the call and the follow-up,
          and predicts which deals are going cold &mdash; so managers fix them before they slip.
        </p>
      </div>

      <div className={`intel__console reveal-up${play ? " play" : ""}`} ref={rootRef}>
        <div className="intel__bar">
          <span className="intel__lead">
            <span className="intel__lead-dot" aria-hidden="true" />
            New lead &middot; <strong>Sarah K.</strong> &middot; Inbound demo &middot; $10K
          </span>
          <ol className="intel__stepper">
            {BEATS.map((b, i) => (
              <li
                key={b.label}
                className={`intel__step${active === i ? " is-active" : ""}`}
                tabIndex={0}
                role="button"
                aria-current={active === i ? "step" : undefined}
                onMouseEnter={() => pin(i)}
                onMouseLeave={unpin}
                onFocus={() => pin(i)}
                onBlur={unpin}
                onClick={() => pin(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pin(i);
                  }
                }}
              >
                <span className="intel__step-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    {b.icon}
                  </svg>
                </span>
                <span className="intel__step-label">{b.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="intel__stage" key={active}>
          {active === 0 && (
            <div className="intel__viz">
              <span className="intel__viz-tag">Match-making · scoring reps</span>
              <ul className="intel__reps">
                {REPS.map((r, i) => (
                  <li key={r.name} className={`intel__rep${r.best ? " is-best" : ""}`}>
                    <span className="intel__rep-name">
                      {r.name}
                      {r.best && <span className="intel__rep-badge">Best fit</span>}
                    </span>
                    <span className="intel__rep-track">
                      <span
                        className="intel__rep-fill"
                        style={{ ["--fill" as string]: `${r.score}%` } as React.CSSProperties}
                      />
                    </span>
                    <span className="intel__rep-score mono">
                      <span ref={(el) => { scoreRefs.current[i] = el; }}>0</span>%
                    </span>
                  </li>
                ))}
              </ul>
              <div className="intel__routed">
                Routed to <strong>Priya N.</strong> &mdash; she closes leads like this{" "}
                <strong>3× faster</strong>.
              </div>
            </div>
          )}

          {active === 1 && (
            <div className="intel__viz">
              <span className="intel__viz-tag">AI agent · on the call</span>
              <div className="intel__assist-msg">
                <span className="intel__assist-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    {SparkIcon}
                  </svg>
                </span>
                <span className="intel__assist-text">
                  {typed}
                  <span className="intel__caret" aria-hidden="true" />
                </span>
              </div>
              <div className="intel__assist-chip">
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path d="M5 12.5l4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Follow-up email drafted &middot; objection tips ready
              </div>
            </div>
          )}

          {active === 2 && (
            <div className="intel__viz">
              <span className="intel__viz-tag">Predictions · manager view</span>
              <div className="intel__predict-risk">
                <span className="intel__predict-num mono" ref={riskRef}>
                  $0
                </span>
                <span className="intel__predict-lbl">
                  at risk &middot; <strong>3 leads</strong> cooling in 24h
                </span>
              </div>
              <div className="intel__predict-fix">
                <span className="intel__predict-fix-k">Recommended fix</span>
                Nudge <strong>Dev&rsquo;s 5 un-worked leads</strong> before tonight.
              </div>
            </div>
          )}

          <p className="intel__caption">{BEATS[active].caption}</p>
        </div>
      </div>
    </section>
  );
}
