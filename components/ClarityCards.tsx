"use client";

import { useEffect, useRef, useState } from "react";
import { countTo, formatUSD, prefersReducedMotion } from "@/lib/format";

export default function ClarityCards() {
  const rootRef = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringNumRef = useRef<HTMLSpanElement>(null);
  const pnlRef = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);
  const ringCancel = useRef<() => void>(() => {});

  const fillRing = (dur: number) => {
    ringCancel.current();
    ringCancel.current = countTo(0, 87, dur, (v) => {
      if (ringRef.current) ringRef.current.style.setProperty("--pct", String(v));
      if (ringNumRef.current) ringNumRef.current.textContent = String(Math.round(v));
    });
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = prefersReducedMotion();

    const run = () => {
      if (fired.current) return;
      fired.current = true;
      setPlay(true);
      fillRing(reduce ? 0 : 1200);
      countTo(0, 4200, reduce ? 0 : 1300, (v) => {
        if (pnlRef.current) pnlRef.current.textContent = formatUSD(v);
      });
    };

    if (reduce) {
      run();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cursor-tracked spotlight + restrained 3D tilt (set as CSS vars on the hovered face).
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = 6;
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--rx", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <section className={`clx-cards${play ? " play" : ""}`} ref={rootRef}>
      <div className="clx-cards__head">
        <span className="eyebrow">The model</span>
        <p className="clx-cards__lead">
          Your floor, <span className="clx-hl">run as a market.</span>
        </p>
      </div>

      <div className="clx-cards__grid">
        {/* Price */}
        <div className="clxc" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="clxc__inner" onMouseMove={onMove} onMouseLeave={onLeave}>
            <div className="clxc__viz clxc__viz--price" aria-hidden="true">
              <div className="clxc__chip">
                <span className="clxc__chip-name">New lead</span>
                <span className="clxc__price">
                  <span className="coin" />
                  500
                </span>
              </div>
              <span className="clxc__coin">
                <span className="coin coin--lg" />
              </span>
            </div>
            <h3 className="clxc__t">Every lead has a price</h3>
            <p className="clxc__b">
              Each lead is priced in coins &mdash; a rep&rsquo;s monthly lead budget. To own a lead they
              spend on it, so the ones you paid for get worked, not grabbed and dropped.
            </p>
          </div>
        </div>

        {/* P&L */}
        <div className="clxc" style={{ "--i": 1 } as React.CSSProperties}>
          <div className="clxc__inner" onMouseMove={onMove} onMouseLeave={onLeave}>
            <div className="clxc__viz clxc__viz--pnl" aria-hidden="true">
              <div className="clxc__bars">
                <span style={{ "--h": "42%" } as React.CSSProperties} />
                <span style={{ "--h": "66%" } as React.CSSProperties} />
                <span style={{ "--h": "52%" } as React.CSSProperties} />
                <span style={{ "--h": "90%" } as React.CSSProperties} />
              </div>
              <span className="clxc__pnl mono" ref={pnlRef}>
                $0
              </span>
            </div>
            <h3 className="clxc__t">Every rep owns a P&amp;L</h3>
            <p className="clxc__b">
              They spend on leads and earn coins back on every close. Month-end settles to a clear
              profit or loss per rep &mdash; so effort and results stop being invisible.
            </p>
          </div>
        </div>

        {/* AI */}
        <div className="clxc" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="clxc__inner" onMouseMove={onMove} onMouseLeave={onLeave}>
            <div className="clxc__viz clxc__viz--ai" aria-hidden="true">
              <div className="clxc__ring" ref={ringRef} style={{ "--pct": 0 } as React.CSSProperties}>
                <svg viewBox="0 0 48 48">
                  <circle className="clxc__ring-track" cx="24" cy="24" r="20" />
                  <circle className="clxc__ring-fill" cx="24" cy="24" r="20" />
                </svg>
                <span className="clxc__ring-num mono">
                  <span ref={ringNumRef}>0</span>%
                </span>
              </div>
              <span className="clxc__ai-label">AI match</span>
            </div>
            <h3 className="clxc__t">AI runs alongside them</h3>
            <p className="clxc__b">
              It routes each lead to the rep most likely to close it, assists the call and follow-up,
              and flags deals going cold before they do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
