"use client";

import { useEffect, useRef, useState } from "react";

const ROWS: { axis: string; them: string; us: React.ReactNode }[] = [
  {
    axis: "Mechanic",
    them: "Points and badges for activity",
    us: (
      <>
        Reps compete for leads with <strong>real coins</strong>
      </>
    ),
  },
  {
    axis: "System",
    them: "Leaderboards and confetti bolted onto a CRM",
    us: (
      <>
        A wallet, a market, auctions &mdash; an <strong>internal economy</strong>
      </>
    ),
  },
  {
    axis: "Motivation",
    them: "Borrowed from streaks and vanity metrics",
    us: (
      <>
        A monthly <strong>P&amp;L per rep</strong> &mdash; profit, loss, comeback
      </>
    ),
  },
  {
    axis: "Origin",
    them: "Generic SaaS, priced per seat",
    us: (
      <>
        Born on a live floor, <strong>priced for outcomes</strong>
      </>
    ),
  },
];

export default function Category() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPlay(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="category" id="category">
      <div className="category__head reveal-up">
        <span className="eyebrow">A different category</span>
        <h2 className="h2">
          Not another <em>leaderboard.</em>
        </h2>
        <p className="category__sub">
          Every sales tool answers the same four questions. HuntFloor answers them like a market &mdash;
          not a game.
        </p>
      </div>

      <div className={`vs${play ? " play" : ""}`} ref={ref}>
        <div className="vs__heads">
          <span className="vs__head vs__head--them">Gamification tools</span>
          <span className="vs__head vs__head--axis" aria-hidden="true" />
          <span className="vs__head vs__head--us">HuntFloor</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            className="vs__row"
            key={r.axis}
            style={{ ["--i" as string]: i } as React.CSSProperties}
            tabIndex={0}
          >
            <div className="vs__them">{r.them}</div>
            <div className="vs__axis">{r.axis}</div>
            <div className="vs__us">{r.us}</div>
          </div>
        ))}
      </div>

      <p className="category__close reveal-up">
        <em>Others gamify effort.</em>{" "}
        <strong>HuntFloor makes every salesperson run their own business.</strong>
      </p>
    </section>
  );
}
