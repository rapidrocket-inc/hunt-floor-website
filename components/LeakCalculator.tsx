"use client";

import { useEffect, useRef, useState } from "react";
import { countTo, formatGrouping, formatUSD } from "@/lib/format";

const CAPTURE_RATE = 0.08; // conservative share of unworked leads that would close

function calcLeak(leads: number, value: number, share: number) {
  const unworked = leads * (1 - share / 100);
  const monthly = unworked * CAPTURE_RATE * value;
  return { monthly, yearly: monthly * 12 };
}

export default function LeakCalculator() {
  const [leads, setLeads] = useState(400);
  const [value, setValue] = useState(8000);
  const [share, setShare] = useState(45);

  const monthRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const prev = useRef({ monthly: 0, yearly: 0 });
  const cancels = useRef<Array<() => void>>([]);

  // animate the result whenever an input changes
  useEffect(() => {
    const { monthly, yearly } = calcLeak(leads, value, share);
    cancels.current.forEach((c) => c());
    cancels.current = [];
    cancels.current.push(
      countTo(prev.current.monthly, monthly, 220, (v) => {
        if (monthRef.current) monthRef.current.textContent = formatUSD(v);
      })
    );
    cancels.current.push(
      countTo(prev.current.yearly, yearly, 220, (v) => {
        if (yearRef.current) yearRef.current.textContent = formatUSD(v);
      })
    );
    prev.current = { monthly, yearly };
    return () => cancels.current.forEach((c) => c());
  }, [leads, value, share]);

  const fill = (v: number, min: number, max: number) =>
    ({ ["--fill" as string]: `${((v - min) / (max - min)) * 100}%` } as React.CSSProperties);

  const init = calcLeak(400, 8000, 45);

  return (
    <section className="leak" id="leak">
      <div className="leak__head reveal-up">
        <span className="eyebrow">See it on your floor</span>
        <h2 className="h2">
          What&rsquo;s leaking <em>right now?</em>
        </h2>
        <p className="leak__sub">
          Set the sliders to your real floor &mdash; leads a month, average deal size, and how many
          actually get worked &mdash; and see what an unworked pipeline quietly costs you.
        </p>
      </div>

      <div className="leak__card reveal-up">
        <div className="leak__sliders">
          <div className="slider">
            <div className="slider__top">
              <label htmlFor="s-leads">Leads per month</label>
              <output id="o-leads">{formatGrouping(leads)}</output>
            </div>
            <input
              type="range"
              id="s-leads"
              min={50}
              max={2000}
              step={10}
              value={leads}
              style={fill(leads, 50, 2000)}
              onChange={(e) => setLeads(+e.target.value)}
            />
          </div>

          <div className="slider">
            <div className="slider__top">
              <label htmlFor="s-value">Avg. deal size</label>
              <output id="o-value">{formatUSD(value)}</output>
            </div>
            <input
              type="range"
              id="s-value"
              min={1000}
              max={100000}
              step={1000}
              value={value}
              style={fill(value, 1000, 100000)}
              onChange={(e) => setValue(+e.target.value)}
            />
          </div>

          <div className="slider">
            <div className="slider__top">
              <label htmlFor="s-share">Leads actually worked</label>
              <output id="o-share">{share}%</output>
            </div>
            <input
              type="range"
              id="s-share"
              min={10}
              max={100}
              step={5}
              value={share}
              style={fill(share, 10, 100)}
              onChange={(e) => setShare(+e.target.value)}
            />
          </div>
        </div>

        <div className="leak__out">
          <div className="leak__stat leak__stat--hero">
            <span className="leak__stat-label">Leaking per month</span>
            <span className="leak__stat-num" ref={monthRef}>
              {formatUSD(init.monthly)}
            </span>
          </div>
          <div className="leak__stat">
            <span className="leak__stat-label">Per year</span>
            <span className="leak__stat-num leak__stat-num--year" ref={yearRef}>
              {formatUSD(init.yearly)}
            </span>
          </div>
        </div>

        <p className="leak__note">
          A rough estimate from your own inputs, not an industry average. Assumes a conservative 8% of
          unworked leads would have closed.
        </p>

        <a className="btn btn--primary leak__cta" href="#access">
          Plug the leak
        </a>
      </div>
    </section>
  );
}
