"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/format";

const STEPS = [
  {
    title: "Fund",
    long: "Every rep starts the month with coins — a lead budget, not points. Deploy it well and it lasts the month; waste it on leads you never work and it runs dry.",
    points: ["A monthly coin allowance per rep", "Spend it like real capital", "Waste leads and you run out"],
    icon: (
      <>
        <ellipse cx="12" cy="7.5" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7.5v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 12.5c0 1.66 3.13 3 7 3s7-1.34 7-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
  },
  {
    title: "Buy",
    long: "Reps spend coins to claim leads at a set price, or bid against the floor for the hot, high-intent ones. Grabbing by whoever's loudest becomes a real market.",
    points: ["Every lead carries a price", "Auction for high-intent leads", "No more grabbing by whoever's loudest"],
    icon: (
      <>
        <path d="M4 6h13l-1.4 7H7.2L6 4H3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="8" cy="18" r="1.5" fill="currentColor" />
        <circle cx="15" cy="18" r="1.5" fill="currentColor" />
      </>
    ),
  },
  {
    title: "Close",
    long: "Claimed leads get worked and every step is recorded. When a deal lands, the Bell rings the win live on the floor for everyone to see.",
    points: ["Every lead is owned by a rep", "Progress is visible, not hidden", "Wins celebrated in real time"],
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12.5l2.6 2.6L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Earn",
    long: "A fixed share of every sale flows back as coins. Sell more and your buying power grows — the best closers get first pick of the best leads.",
    points: ["A cut of every sale returns as coins", "Reinvest into better leads", "Buying power compounds with results"],
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 8.5h6M9 11h6M10 8.5c2.6 0 2.6 4.4 0 4.4l3.6 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Settle",
    long: "At month-end it all nets to a clear P&L per rep. Profit compounds into next month; a loss is a lesson. Nobody hides at review time.",
    points: ["A clear per-rep P&L", "Profit carries forward", "Accountability by design"],
    icon: (
      <path d="M4 20V11M9 20V5M14 20v-6M19 20V8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    ),
  },
];

const N = STEPS.length;
const R = 40; // orbit radius, % of the square stage
const START = -Math.PI / 2; // Fund sits at the top
const angleOf = (i: number) => START + (i * 2 * Math.PI) / N;
const norm = (x: number) => {
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
};

// ambient blobs that keep flowing around the ring, same direction, varied speeds/sizes
const BLOBS = [
  { speed: 1.7, a0: 0.7, size: 9 },
  { speed: 0.85, a0: 2.9, size: 6 },
  { speed: 1.25, a0: 4.7, size: 7 },
  { speed: 1.45, a0: 1.9, size: 5 },
  { speed: 0.65, a0: 5.6, size: 8 },
];

export default function TheLoop() {
  const [active, setActive] = useState(0);
  const [play, setPlay] = useState(false);
  const activeRef = useRef(0);
  const pinnedRef = useRef(false);
  const targetRef = useRef(angleOf(0));
  const angleRef = useRef(angleOf(0));
  const coinRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const blobAnglesRef = useRef<number[]>(BLOBS.map((b) => b.a0));

  const positions = useMemo(
    () =>
      STEPS.map((_, i) => {
        const a = angleOf(i);
        return { left: 50 + R * Math.cos(a), top: 50 + R * Math.sin(a) };
      }),
    []
  );

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    // 0 when the coin sits on a node, 1 when it's midway between two nodes
    const proximity = (a: number) => {
      let bd = Infinity;
      for (let i = 0; i < N; i++) {
        const d = Math.abs(norm(angleOf(i) - a));
        if (d < bd) bd = d;
      }
      return Math.min(1, bd / (Math.PI / N));
    };
    const nearest = (a: number) => {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < N; i++) {
        const d = Math.abs(norm(angleOf(i) - a));
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };
    const placeCoin = (a: number) => {
      const c = coinRef.current;
      if (!c) return;
      // dock small + bright at a node, coast full-size + calm between nodes
      const t = proximity(a);
      const scale = 0.68 + 0.32 * t;
      const blur = 24 - 8 * t;
      const spread = 5 - 3 * t;
      const alpha = 0.95 - 0.28 * t;
      c.style.left = `${50 + R * Math.cos(a)}%`;
      c.style.top = `${50 + R * Math.sin(a)}%`;
      c.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      c.style.boxShadow = `0 0 ${blur.toFixed(1)}px ${spread.toFixed(1)}px rgba(16, 185, 129, ${alpha.toFixed(2)}), inset 0 1px 0 rgba(255, 255, 255, 0.55)`;
    };

    const placeBlob = (i: number, a: number) => {
      const el = blobRefs.current[i];
      if (!el) return;
      el.style.left = `${50 + R * Math.cos(a)}%`;
      el.style.top = `${50 + R * Math.sin(a)}%`;
    };

    placeCoin(angleRef.current);
    blobAnglesRef.current.forEach((a, i) => placeBlob(i, a));

    if (prefersReducedMotion()) {
      setPlay(true);
      setActive(0);
      return;
    }

    let raf = 0;
    let last = 0;
    const SPEED = (2 * Math.PI) / 15; // one lap ≈ 15s
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (inView()) {
        if (pinnedRef.current) {
          angleRef.current += norm(targetRef.current - angleRef.current) * Math.min(1, 6 * dt);
        } else {
          // ease speed: dwell at each node, then launch toward the next
          const speed = SPEED * (0.32 + 0.68 * proximity(angleRef.current));
          angleRef.current = norm(angleRef.current + speed * dt);
          const n = nearest(angleRef.current);
          if (n !== activeRef.current) {
            activeRef.current = n;
            setActive(n);
          }
        }
        placeCoin(angleRef.current);
        // ambient blobs keep flowing regardless of the pinned coin
        for (let i = 0; i < BLOBS.length; i++) {
          blobAnglesRef.current[i] = norm(blobAnglesRef.current[i] + SPEED * BLOBS[i].speed * dt);
          placeBlob(i, blobAnglesRef.current[i]);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    setPlay(true);
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pin = (i: number) => {
    pinnedRef.current = true;
    targetRef.current = angleOf(i);
    activeRef.current = i;
    setActive(i);
  };
  const unpin = () => {
    pinnedRef.current = false;
  };

  const step = STEPS[active];

  return (
    <section className={`loop${play ? " play" : ""}`} id="loop">
      <div className="loop__head reveal-up">
        <span className="eyebrow">The economy</span>
        <h2 className="h2">
          The loop that <em>runs the floor.</em>
        </h2>
        <p className="loop__sub">
          Coins are a rep&rsquo;s monthly lead budget: they fund the leads a rep claims, every close earns
          budget back, and it all settles to a P&amp;L. Follow the coin.
        </p>
      </div>

      <div className="loop__orbit reveal-up">
        <div className="loop__stage" ref={stageRef}>
          <svg className="loop__ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="40" />
          </svg>

          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`loop__node${active === i ? " is-active" : ""}`}
              style={{ left: `${positions[i].left}%`, top: `${positions[i].top}%` }}
              aria-label={s.title}
              aria-current={active === i ? "step" : undefined}
              onMouseEnter={() => pin(i)}
              onMouseLeave={unpin}
              onFocus={() => pin(i)}
              onBlur={unpin}
              onClick={() => pin(i)}
            >
              <span className="loop__node-ic">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  {s.icon}
                </svg>
              </span>
              <span className="loop__node-label">{s.title}</span>
            </button>
          ))}

          {BLOBS.map((b, i) => (
            <span
              key={`blob-${i}`}
              className="loop__blob"
              ref={(el) => {
                blobRefs.current[i] = el;
              }}
              style={{ width: b.size, height: b.size }}
              aria-hidden="true"
            />
          ))}

          <span className="loop__coin" ref={coinRef} aria-hidden="true">
            $
          </span>
        </div>

        <div className="loop__center">
          <div className="loop__center-card" key={active}>
            <span className="loop__center-step mono">
              Step {active + 1} / {N}
            </span>
            <h3 className="loop__center-t">{step.title}</h3>
            <p className="loop__center-d">{step.long}</p>
            <ul className="loop__center-points">
              {step.points.map((p) => (
                <li key={p}>
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 12.4l2.6 2.6L16 9.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="loop__close reveal-up">
        <em>Not a game. Not a scoreboard.</em> <strong>A market your floor runs on.</strong>
      </p>

      <div className="loop__cta reveal-up">
        <a className="btn btn--primary" href="#access">
          Book a demo
        </a>
      </div>
    </section>
  );
}
