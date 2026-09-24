"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/format";

type Msg =
  | {
      kind: "bubble";
      id: string;
      side: "in" | "out";
      alt?: boolean;
      beat: number;
      body: React.ReactNode;
      t: string;
      pill?: boolean;
      sender?: string;
      senderAlt?: boolean;
    }
  | { kind: "day"; id: string; beat: number; label: string }
  | { kind: "sys"; id: string; beat: number; label: string };

// The scene: two reps grab the same lead, it's handed to one by availability, he never converts it.
const MESSAGES: Msg[] = [
  {
    kind: "bubble",
    id: "m0",
    side: "in",
    beat: 0,
    pill: true,
    t: "10:02",
    body: (
      <>
        <strong>New lead</strong>
        <br />
        Sarah K. · Inbound demo · budget $10K
      </>
    ),
  },
  { kind: "bubble", id: "m1", side: "out", beat: 0, t: "10:03", sender: "Dev", body: <>mine — free today 🙋‍♂️</> },
  {
    kind: "bubble",
    id: "m2",
    side: "out",
    alt: true,
    beat: 0,
    t: "10:03",
    sender: "Arjun",
    senderAlt: true,
    body: <>i&rsquo;ll take it</>,
  },
  { kind: "bubble", id: "m3", side: "in", beat: 1, t: "10:04", body: <>ok Dev, it&rsquo;s yours 👍</> },
  {
    kind: "bubble",
    id: "m4",
    side: "out",
    beat: 2,
    t: "10:12",
    sender: "Dev",
    body: <>called — no answer, will retry</>,
  },
  { kind: "day", id: "day", beat: 2, label: "Friday" },
  { kind: "sys", id: "sys", beat: 2, label: "No follow-up. Lead went cold." },
];

// right-column timeline — one lead's lifecycle, in beat order, mirroring the chat
const TIMELINE = [
  {
    beat: 0,
    time: "10:02",
    title: "Two reps grab it",
    desc: "Sarah’s lead drops in the group and two reps call dibs at once — loudest wins.",
  },
  {
    beat: 1,
    time: "10:04",
    title: "Assigned to whoever’s free",
    desc: "It goes to Dev because he’s free — not because he’s the best fit for it.",
  },
  {
    beat: 2,
    time: "Friday",
    title: "Never converted",
    desc: "One call, no answer, no follow-up. By Friday the lead is cold — and lost.",
    cold: true,
  },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const LAST_BEAT = TIMELINE.length - 1; // 2 — nodes sit at integer positions on the beat axis
const END_HOLD = 0.85; // the scene fully lands (cold) by this progress, then holds to the end
// scroll progress (0..1) → position along the beat axis (0..LAST_BEAT)
const beatFloatAt = (p: number) => clamp((p / END_HOLD) * LAST_BEAT, 0, LAST_BEAT);
// messages shown along the beat axis, kept in lock-step with the nodes:
// node0 segment reveals New→Dev→Arjun (1..3); the assignment lands at node1 (4);
// then Dev's dead call→Friday→cold approach node2 (5..7)
const revealedAt = (bf: number) =>
  bf < 1
    ? clamp(1 + Math.round(bf * 2), 1, 3)
    : clamp(4 + Math.round((bf - 1) * 3), 4, MESSAGES.length);
// scroll progress that lands the scene on a given beat (used by click-to-seek)
const BEAT_SEEK = [0.02, 0.52, 1.0];

export default function Problem() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const phoneColRef = useRef<HTMLDivElement>(null);
  const copyColRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [typingSide, setTypingSide] = useState<null | "in" | "out">(null);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [scrolly, setScrolly] = useState(false);
  const revealedRef = useRef(0);
  const activeRef = useRef(-1);
  const runId = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const finish = () => {
      setRevealed(MESSAGES.length);
      setActiveBeat(2);
      setTypingSide(null);
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    // ---- Desktop: scroll-scrubbed progression (pin + parallax) ----
    if (window.matchMedia("(min-width: 861px)").matches) {
      setScrolly(true);
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const sc = scrollRef.current;
          if (!sc) return;
          const rect = sc.getBoundingClientRect();
          const total = rect.height - window.innerHeight;
          const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
          const bf = beatFloatAt(p);
          const active = clamp(Math.floor(bf + 1e-4), 0, LAST_BEAT);
          if (active !== activeRef.current) {
            activeRef.current = active;
            setActiveBeat(active);
          }
          const rev = revealedAt(bf);
          if (rev !== revealedRef.current) {
            revealedRef.current = rev;
            setRevealed(rev);
          }
          // continuous connector fill — line grows blob-to-blob as you scroll (empty at rest)
          const nodes = sc.querySelectorAll<HTMLElement>(".ptl__node");
          nodes.forEach((node, i) => {
            if (i < nodes.length - 1)
              node.style.setProperty("--fill", clamp(bf - i, 0, 1).toFixed(3));
          });
          // subtle parallax: the phone and copy drift at slightly different rates
          if (phoneColRef.current)
            phoneColRef.current.style.transform = `translateY(${(0.5 - p) * 30}px)`;
          if (copyColRef.current)
            copyColRef.current.style.transform = `translateY(${(0.5 - p) * -14}px)`;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    // ---- Mobile / touch: autoplay once when it scrolls into view ----
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const play = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const id = ++runId.current;
      const alive = () => id === runId.current;

      // beat 0 — the lead drops, two reps grab it
      setActiveBeat(0);
      setTypingSide("in");
      await sleep(750);
      if (!alive()) return;
      setTypingSide(null);
      setRevealed(1); // New lead
      await sleep(560);
      if (!alive()) return;
      setTypingSide("out");
      await sleep(620);
      if (!alive()) return;
      setTypingSide(null);
      setRevealed(2); // Dev: mine
      await sleep(420);
      if (!alive()) return;
      setRevealed(3); // Arjun: i'll take it
      await sleep(820);
      if (!alive()) return;

      // beat 1 — handed to whoever's free
      setActiveBeat(1);
      setTypingSide("in");
      await sleep(640);
      if (!alive()) return;
      setTypingSide(null);
      setRevealed(4); // ok Dev, it's yours
      await sleep(900);
      if (!alive()) return;

      // beat 2 — one dead call, then it goes cold
      setActiveBeat(2);
      setTypingSide("out");
      await sleep(700);
      if (!alive()) return;
      setTypingSide(null);
      setRevealed(5); // Dev: called — no answer
      await sleep(950);
      if (!alive()) return;
      setRevealed(6); // Friday
      await sleep(1000);
      if (!alive()) return;
      setRevealed(7); // No follow-up. Lead went cold.
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            play();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      runId.current++;
      io.disconnect();
    };
  }, []);

  // click / keyboard a timeline node to scroll the scene to that beat (scroll mode only)
  const seekToBeat = (beat: number) => {
    const sc = scrollRef.current;
    if (!scrolly || !sc) return;
    const rect = sc.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;
    const top = rect.top + window.scrollY + BEAT_SEEK[beat] * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const dead = revealed >= MESSAGES.length;
  const showTyping = typingSide !== null;

  return (
    <section className={`problem${scrolly ? " is-scrolly" : ""}`} id="problem" ref={sectionRef}>
     <div className="problem__scroll" ref={scrollRef}>
      <div className="problem__sticky">
      <div className="problem__grid">
        <div className="problem__phone-col" ref={phoneColRef}>
          <div
            className={`phone${dead ? " dead" : ""}`}
            aria-label="A sales lead abandoned in a group chat"
          >
            <div className="phone__bar">
              <span className="phone__dot" />
              <span className="phone__title">Sales Floor · Leads</span>
              <span className={`phone__presence${dead ? " phone__presence--off" : ""}`}>
                {dead ? "last seen Friday" : "online"}
              </span>
            </div>
            <div className="phone__body">
              {MESSAGES.slice(0, revealed).map((m) => {
                if (m.kind === "day")
                  return (
                    <div className="wa__day" key={m.id}>
                      {m.label}
                    </div>
                  );
                if (m.kind === "sys")
                  return (
                    <div className="wa wa--sys" key={m.id}>
                      {m.label}
                    </div>
                  );
                return (
                  <div className={`wa wa--${m.side}${m.alt ? " wa--alt" : ""}`} key={m.id}>
                    <div className="wa__b">
                      {m.sender && (
                        <span className={`wa__sender${m.senderAlt ? " wa__sender--b" : ""}`}>
                          {m.sender}
                        </span>
                      )}
                      {m.body}
                      {m.pill && (
                        <span className={`wa__pill${dead ? " wa__pill--cold" : ""}`}>
                          {dead ? "Cold" : "New"}
                        </span>
                      )}
                    </div>
                    <span className="wa__t">{m.t}</span>
                  </div>
                );
              })}
              {showTyping && (
                <div className={`wa wa--${typingSide} wa--typing`} aria-hidden="true">
                  <div className="wa__b">
                    <span className="wa__dot" />
                    <span className="wa__dot" />
                    <span className="wa__dot" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="problem__copy" ref={copyColRef}>
          <span className="eyebrow">The floor today</span>
          <h2 className="h2">
            Grabbed by the loudest, <em>worked by no one.</em>
          </h2>
          <p className="problem__mirror">
            This is you if your floor runs on WhatsApp and spreadsheets, you can&rsquo;t see who&rsquo;s
            working which lead, and every month-end is a surprise.
          </p>
          <ol className="ptl">
            {TIMELINE.map((n) => {
              const reached = activeBeat >= n.beat;
              const active = activeBeat === n.beat;
              const cls = [
                "ptl__node",
                n.cold ? "ptl__node--cold" : "",
                reached ? "is-reached" : "",
                active ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li
                  key={n.beat}
                  className={cls}
                  style={
                    scrolly ? undefined : ({ "--fill": reached ? 1 : 0 } as React.CSSProperties)
                  }
                  tabIndex={scrolly ? 0 : undefined}
                  role={scrolly ? "button" : undefined}
                  aria-current={active ? "step" : undefined}
                  onClick={() => seekToBeat(n.beat)}
                  onKeyDown={(e) => {
                    if (scrolly && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      seekToBeat(n.beat);
                    }
                  }}
                >
                  <span className="ptl__dot" aria-hidden="true" />
                  <div className="ptl__content">
                    <div className="ptl__head">
                      <span className="ptl__time mono">{n.time}</span>
                      <h4 className="ptl__t">{n.title}</h4>
                    </div>
                    <p className="ptl__d">{n.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="problem__close">The tools exist. The behaviour doesn&rsquo;t change.</p>
        </div>
      </div>
      </div>
     </div>
    </section>
  );
}
