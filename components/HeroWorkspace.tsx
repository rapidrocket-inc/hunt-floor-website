"use client";

import { useEffect, useRef, useState } from "react";
import { countTo, formatUSD, formatGrouping, prefersReducedMotion } from "@/lib/format";

type Lead = {
  name: string;
  ctx: string;
  match: number;
  price: number; // coins spent to win the lead at bid
  reward: number; // coins earned back on close (> price -> the loop pays)
  value: number; // dollars closed
  tip: string;
};

// industry-agnostic sample leads (no hospitality slant, no invented client stats)
const LEADS: Lead[] = [
  { name: "Sarah K.", ctx: "Inbound demo · budget $10K", match: 87, price: 500, reward: 900, value: 4200, tip: "Best time to call: 6–8pm" },
  { name: "Metro Corp", ctx: "Renewal · mid-market", match: 91, price: 600, reward: 1300, value: 6500, tip: "Renewals close 2x faster for you" },
  { name: "Arjun K.", ctx: "Referral · warm intro", match: 76, price: 320, reward: 620, value: 2800, tip: "Replies fastest via text" },
  { name: "Emma R.", ctx: "Website enquiry · pricing", match: 68, price: 260, reward: 480, value: 1800, tip: "High intent — call within 10 min" },
];

const START_WALLET = 1200;
const DWELL = 2600; // ms each stage holds before auto-advancing

type Stage = "coins" | "bid" | "close" | "earn";

const STAGE_META: { id: Stage; label: string; caption: string; icon: JSX.Element }[] = [
  {
    id: "coins",
    label: "Coins",
    caption: "You start the month with coins — your lead budget for the month.",
    icon: (
      <>
        <ellipse cx="12" cy="7" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 7v5c0 1.66 3.13 3 7 3s7-1.34 7-3V7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    id: "bid",
    label: "Bid",
    caption: "You bid for a lead the AI matched to you — and win it.",
    icon: (
      <>
        <path d="M12 3v10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "close",
    label: "Close",
    caption: "You work the deal, close it, and log the win.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12.4l2.6 2.6L16 9.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: "earn",
    label: "Earn",
    caption: "A share of the sale returns as coins — enough to fund the next bid.",
    icon: (
      <>
        <path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M20 4v3.2h-3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

type Flash = { amount: number; dir: "up" | "down" } | null;

export default function HeroWorkspace() {
  const [active, setActive] = useState(0); // index into STAGE_META
  const [leadIdx, setLeadIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bidWon, setBidWon] = useState(false);
  const [closedStep, setClosedStep] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [flowKey, setFlowKey] = useState(0); // bumps on each Earn→Coins wrap to fire the return blobs
  const [fwdFlow, setFwdFlow] = useState<{ key: number; from: number } | null>(null); // a blob per forward step

  const rootRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(0);
  const fwdKeyRef = useRef(0);
  const closedRef = useRef<HTMLSpanElement>(null);
  const walletRef = useRef<HTMLSpanElement>(null);
  const closed = useRef(0);
  const wallet = useRef(START_WALLET);
  const cancels = useRef<Array<() => void>>([]);
  const cycleRef = useRef(0); // full loops completed — keys money so it applies once per beat
  const applied = useRef<Set<string>>(new Set());

  const reduce = typeof window !== "undefined" && prefersReducedMotion();
  const stage = STAGE_META[active].id;
  const lead = LEADS[leadIdx];

  const animateWallet = (to: number, dur: number) => {
    cancels.current.push(
      countTo(wallet.current, to, dur, (v) => {
        if (walletRef.current) walletRef.current.textContent = formatGrouping(v);
      })
    );
    wallet.current = to;
  };

  const flashFor = (amount: number, dir: "up" | "down", ms: number) => {
    setFlash({ amount, dir });
    const t = setTimeout(() => setFlash(null), ms);
    cancels.current.push(() => clearTimeout(t));
  };

  // Start the loop the first time the console scrolls into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect();
            const t = setTimeout(() => setStarted(true), 700);
            cancels.current.push(() => clearTimeout(t));
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cleanup any running animations/timers on unmount.
  useEffect(() => () => cancels.current.forEach((c) => c()), []);

  // Focal effect: run each beat's money + micro-animation once on entry.
  useEffect(() => {
    if (!started) return;
    const r = prefersReducedMotion();
    const ts: Array<ReturnType<typeof setTimeout>> = [];
    // apply each beat's coin/revenue math once per cycle (so clicking a node to
    // re-visit a beat doesn't double-count) — the visual still replays every time.
    const key = `${cycleRef.current}:${stage}`;
    const firstTime = !applied.current.has(key);
    applied.current.add(key);

    if (stage === "coins") {
      setBidWon(false);
      setClosedStep(false);
    } else if (stage === "bid") {
      setBidWon(false);
      const t = setTimeout(() => {
        setBidWon(true);
        if (firstTime) {
          animateWallet(wallet.current - lead.price, r ? 0 : 500);
          if (!r) flashFor(lead.price, "down", 1400);
        }
      }, r ? 0 : 950);
      ts.push(t);
    } else if (stage === "close") {
      setClosedStep(false);
      const t = setTimeout(() => {
        setClosedStep(true);
        if (firstTime) {
          const to = closed.current + lead.value;
          cancels.current.push(
            countTo(closed.current, to, r ? 0 : 800, (v) => {
              if (closedRef.current) closedRef.current.textContent = formatUSD(v);
            })
          );
          closed.current = to;
        }
      }, r ? 0 : 850);
      ts.push(t);
    } else if (stage === "earn") {
      const t = setTimeout(() => {
        if (firstTime) {
          animateWallet(wallet.current + lead.reward, r ? 0 : 700);
          if (!r) flashFor(lead.reward, "up", 1700);
        }
      }, r ? 0 : 450);
      ts.push(t);
    }

    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, leadIdx, started]);

  // Advance timer: hold the beat, then move on. Pauses on hover/focus; off for reduced motion.
  useEffect(() => {
    if (!started || paused || reduce) return;
    const t = setTimeout(() => {
      if (stage === "earn") {
        cycleRef.current += 1;
        setLeadIdx((i) => (i + 1) % LEADS.length);
      }
      setActive((a) => (a + 1) % STAGE_META.length);
    }, DWELL);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, leadIdx, started, paused, reduce]);

  // Blobs synced to the stepper: a stream on the Earn→Coins wrap, a single blob on each forward step.
  useEffect(() => {
    const prev = prevActiveRef.current;
    if (prev === STAGE_META.length - 1 && active === 0) {
      setFlowKey((k) => k + 1); // wrap: coins stream back along the return arc
    } else if (active === prev + 1) {
      fwdKeyRef.current += 1;
      setFwdFlow({ key: fwdKeyRef.current, from: prev }); // forward: one blob to the next station
    }
    prevActiveRef.current = active;
  }, [active]);

  const goTo = (i: number) => {
    setActive(i);
    if (!started) setStarted(true);
  };

  return (
    <div
      className="hero__app reveal-up"
      data-r="7"
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="appwin" role="group" aria-label="HuntFloor — the loop: coins, bid, close, earn">
        <div className="appwin__bar">
          <span className="frame__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="appwin__id">Your floor · August</span>
          <span className="appwin__live">
            <span className="dot--green" /> live
          </span>
        </div>

        <div className="appwin__body">
          {/* two-stat meter: revenue closed + coin wallet */}
          <div className="appwin__meter">
            <div className="appwin__stat">
              <span className="appwin__meter-k">Closed today</span>
              <span className="appwin__meter-v mono" ref={closedRef}>
                $0
              </span>
            </div>
            <div className="appwin__stat appwin__stat--wallet">
              <span className="appwin__meter-k">Wallet</span>
              <span className="appwin__wallet-v mono">
                <span className="coin" />
                <span ref={walletRef}>{formatGrouping(START_WALLET)}</span>
              </span>
              {flash && (
                <span className={`appwin__flash is-${flash.dir}`}>
                  {flash.dir === "down" ? "−" : "+"}
                  {formatGrouping(flash.amount)}
                </span>
              )}
            </div>
          </div>

          {/* pipeline stepper — one continuous track threading the four beats */}
          <div className="hpipe" role="tablist" aria-label="The loop">
            <div className="hpipe__track" aria-hidden="true">
              <span
                className="hpipe__fill"
                style={{ width: `${(active / (STAGE_META.length - 1)) * 100}%` }}
              />
              {!reduce && active < STAGE_META.length - 1 && (
                <span
                  key={`${leadIdx}-${active}`}
                  className="hpipe__lead"
                  style={{
                    left: `${(active / (STAGE_META.length - 1)) * 100}%`,
                    width: `${100 / (STAGE_META.length - 1)}%`,
                    animationDuration: `${DWELL}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              )}
              {!reduce && fwdFlow && (
                <span
                  key={`fwd-${fwdFlow.key}`}
                  className="hpipe__fwd"
                  style={
                    {
                      "--x0": `${(fwdFlow.from / (STAGE_META.length - 1)) * 100}%`,
                      "--x1": `${((fwdFlow.from + 1) / (STAGE_META.length - 1)) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              )}
            </div>
            <div className="hpipe__stations">
              {STAGE_META.map((s, i) => {
                const state = i === active ? "active" : i < active ? "done" : "idle";
                return (
                  <button
                    type="button"
                    className={`hpipe__st is-${state}`}
                    key={s.id}
                    aria-current={i === active ? "step" : undefined}
                    aria-label={`${s.label} — step ${i + 1} of ${STAGE_META.length}`}
                    onClick={() => goTo(i)}
                  >
                    <span className="hpipe__num mono">0{i + 1}</span>
                    <span className="hpipe__medallion" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        {s.icon}
                      </svg>
                    </span>
                    <span className="hpipe__lb">{s.label}</span>
                  </button>
                );
              })}
            </div>
            {/* return path: dashed connector under stations 4→1 + a blob that flows back to the start */}
            <div className={`hpipe__return${stage === "earn" ? " is-lit" : ""}`} aria-hidden="true">
              <svg className="hpipe__arc" viewBox="0 0 100 32" preserveAspectRatio="none">
                <path
                  d="M87.5 2 C 87.5 18 66 30 50 30 C 34 30 12.5 18 12.5 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {!reduce &&
                flowKey > 0 &&
                [0, 1, 2].map((n) => (
                  <span
                    key={`${flowKey}-${n}`}
                    className="hpipe__flow"
                    style={{ animationDelay: `${n * 0.16}s` }}
                  />
                ))}
            </div>
          </div>

          {/* stage detail — what happens in the active beat */}
          <div className="hstage__panel" key={`${leadIdx}-${stage}`}>
            {stage === "coins" && (
              <div className="hbeat">
                <span className="hbeat__badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <ellipse cx="12" cy="16.5" rx="7.5" ry="2.7" fill="currentColor" opacity="0.45" />
                    <ellipse cx="12" cy="12" rx="7.5" ry="2.7" fill="currentColor" opacity="0.72" />
                    <ellipse cx="12" cy="7.5" rx="7.5" ry="2.7" fill="currentColor" />
                  </svg>
                </span>
                <div className="hbeat__txt">
                  <div className="hbeat__line">
                    <span className="mono">{formatGrouping(Math.round(wallet.current))}</span> coins to spend
                  </div>
                  <div className="hbeat__sub">
                    <span className="hbeat__step mono">
                      {active + 1}/{STAGE_META.length}
                    </span>
                    {STAGE_META[active].caption}
                  </div>
                </div>
              </div>
            )}

            {stage === "bid" && (
              <div className="hbeat">
                <span className={`hbeat__badge${bidWon ? " is-won" : ""}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity="0.28" />
                    <path d="M12 12 L12 3.5 A8.5 8.5 0 0 1 20.5 12 Z" fill="currentColor" />
                  </svg>
                </span>
                <div className="hbeat__txt">
                  <div className="hbeat__line">
                    {!bidWon ? (
                      <>
                        Bidding <span className="coin" />
                        {lead.price}
                        <span className="appwin__dots">…</span>
                      </>
                    ) : (
                      <span className="hbeat__won">
                        Won {lead.name} <span className="hbeat__dim">· {lead.match}% match</span>
                      </span>
                    )}
                  </div>
                  <div className="hbeat__sub">
                    <span className="hbeat__step mono">
                      {active + 1}/{STAGE_META.length}
                    </span>
                    {STAGE_META[active].caption}
                  </div>
                </div>
              </div>
            )}

            {stage === "close" && (
              <div className="hbeat">
                <span className={`hbeat__badge${closedStep ? " is-won appwin__bell" : ""}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5z" fill="currentColor" />
                    <path d="M9.8 19h4.4a2.2 2.2 0 0 1-4.4 0z" fill="currentColor" />
                  </svg>
                </span>
                <div className="hbeat__txt">
                  <div className="hbeat__line">
                    {!closedStep ? (
                      <>
                        Working the deal<span className="appwin__dots">…</span>
                      </>
                    ) : (
                      <span className="hbeat__won">Closed {formatUSD(lead.value)}</span>
                    )}
                  </div>
                  <div className="hbeat__sub">
                    <span className="hbeat__step mono">
                      {active + 1}/{STAGE_META.length}
                    </span>
                    {STAGE_META[active].caption}
                  </div>
                </div>
              </div>
            )}

            {stage === "earn" && (
              <div className="hbeat">
                <span className="hbeat__badge is-won" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="13" width="4" height="7" rx="1.2" fill="currentColor" opacity="0.5" />
                    <rect x="10" y="9" width="4" height="11" rx="1.2" fill="currentColor" opacity="0.75" />
                    <rect x="16" y="5" width="4" height="15" rx="1.2" fill="currentColor" />
                  </svg>
                </span>
                <div className="hbeat__txt">
                  <div className="hbeat__line hbeat__won">
                    <span className="mono">+{lead.reward}</span> coins back
                  </div>
                  <div className="hbeat__sub">
                    <span className="hbeat__step mono">
                      {active + 1}/{STAGE_META.length}
                    </span>
                    {STAGE_META[active].caption}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
