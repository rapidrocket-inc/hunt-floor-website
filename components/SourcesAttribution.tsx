"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/format";
import {
  SiZoho,
  SiHubspot,
  SiMeta,
  SiGoogleads,
  SiWhatsapp,
  SiGooglecalendar,
  SiCalendly,
  SiZapier,
} from "react-icons/si";
import { FaSalesforce, FaLinkedin, FaSlack } from "react-icons/fa6";

// GoHighLevel has no open-source brand mark — a funnel glyph fits the tool and the icon style
const GhlIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 4h18a1 1 0 0 1 .78 1.63L15 14.1V19a1 1 0 0 1-1.45.9l-3-1.5A1 1 0 0 1 10 17.5v-3.4L2.22 5.63A1 1 0 0 1 3 4z" />
  </svg>
);

const SOURCES = ["Meta Ads", "Google Ads", "Website", "Referrals", "CRM"];
// closed leads the floor produces — blobs fan out to these
const LEADS = [
  { name: "Sarah K.", val: "$4,200" },
  { name: "Marcus T.", val: "$6,800" },
  { name: "Priya N.", val: "$3,100" },
  { name: "Daniel R.", val: "$9,500" },
  { name: "Aisha M.", val: "$5,400" },
];
const NS = SOURCES.length; // 5 — paths 0..NS-1 are source → hub
const NL = LEADS.length; // 5 — paths NS..NS+NL-1 are hub → lead
const NPATH = NS + NL;
const BLOB_COUNT = 12;
const SPEED = 150; // px per second
const EDGE = 0.12; // fraction of each leg used to fade a blob in/out
const rand = (n: number) => Math.floor(Math.random() * n);

const CARDS = [
  {
    title: "True source-to-close attribution",
    body: "See which sources actually produce revenue, not just clicks. Every dollar traced back to where the lead came from.",
    icon: (
      <path d="M4 20V10M9 20V4M14 20v-7M19 20V8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    ),
  },
  {
    title: "Every lead accounted for",
    body: "No lead sits unclaimed in a group chat. You see who picked it up, when they called, and exactly how it moved.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12.4l2.6 2.6L16 9.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Live, not month-end",
    body: "The whole floor's state in real time, by source and by rep, instead of a spreadsheet you reconcile after the fact.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
];

// the two marquee lanes — each a varied mix so both feel full and distinct
const LANE_A = [
  { name: "Zoho", cat: "CRM", Icon: SiZoho },
  { name: "HubSpot", cat: "CRM", Icon: SiHubspot },
  { name: "Salesforce", cat: "CRM", Icon: FaSalesforce },
  { name: "Meta Ads", cat: "Ads", Icon: SiMeta },
  { name: "Google Ads", cat: "Ads", Icon: SiGoogleads },
  { name: "Google Calendar", cat: "Calendar", Icon: SiGooglecalendar },
];
const LANE_B = [
  { name: "GoHighLevel", cat: "CRM", Icon: GhlIcon },
  { name: "LinkedIn Ads", cat: "Ads", Icon: FaLinkedin },
  { name: "WhatsApp", cat: "Comms", Icon: SiWhatsapp },
  { name: "Slack", cat: "Comms", Icon: FaSlack },
  { name: "Calendly", cat: "Calendar", Icon: SiCalendly },
  { name: "Zapier", cat: "Automation", Icon: SiZapier },
];

type Blob = { phase: 0 | 1; src: number; lead: number; d: number };

export default function SourcesAttribution() {
  const flowRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);
  const leadRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const blobsRef = useRef<Blob[]>([]);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const build = () => {
      const cont = flowRef.current;
      const svg = svgRef.current;
      const hub = hubRef.current;
      if (!cont || !svg || !hub) return;
      const cr = cont.getBoundingClientRect();
      if (cr.width === 0) return;
      svg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
      const pt = (r: DOMRect, edge: "left" | "right") => ({
        x: (edge === "left" ? r.left : r.right) - cr.left,
        y: r.top - cr.top + r.height / 2,
      });
      const hubR = hub.getBoundingClientRect();
      const hubL = pt(hubR, "left");
      const hubRt = pt(hubR, "right");

      chipRefs.current.forEach((chip, i) => {
        if (!chip || !pathRefs.current[i]) return;
        const f = pt(chip.getBoundingClientRect(), "right");
        const mx = (f.x + hubL.x) / 2;
        pathRefs.current[i]!.setAttribute(
          "d",
          `M${f.x},${f.y} C${mx},${f.y} ${mx},${hubL.y} ${hubL.x},${hubL.y}`
        );
      });
      leadRefs.current.forEach((leadEl, j) => {
        const idx = NS + j;
        if (!leadEl || !pathRefs.current[idx]) return;
        const to = pt(leadEl.getBoundingClientRect(), "left");
        const mx = (hubRt.x + to.x) / 2;
        pathRefs.current[idx]!.setAttribute(
          "d",
          `M${hubRt.x},${hubRt.y} C${mx},${hubRt.y} ${mx},${to.y} ${to.x},${to.y}`
        );
      });
    };

    const reduce = prefersReducedMotion();

    // spread blobs across the network at random positions
    blobsRef.current = Array.from({ length: BLOB_COUNT }, () => ({
      phase: (Math.random() < 0.5 ? 0 : 1) as 0 | 1,
      src: rand(NS),
      lead: rand(NL),
      d: Math.random(),
    }));

    const ro = new ResizeObserver(() => build());
    if (flowRef.current) ro.observe(flowRef.current);
    window.addEventListener("resize", build, { passive: true });

    if (reduce) {
      requestAnimationFrame(() => {
        build();
        blobsRef.current.forEach((b, i) => {
          const idx = b.phase === 0 ? b.src : NS + b.lead;
          const path = pathRefs.current[idx];
          const dot = dotRefs.current[i];
          if (!path || !dot) return;
          const len = path.getTotalLength();
          const pos = path.getPointAtLength(b.d * len);
          dot.setAttribute("cx", String(pos.x));
          dot.setAttribute("cy", String(pos.y));
          dot.setAttribute("opacity", "0.6");
        });
      });
      setPlay(true);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", build);
      };
    }

    const leadTimers: Array<ReturnType<typeof setTimeout> | null> = LEADS.map(() => null);
    const flashLead = (j: number) => {
      const el = leadRefs.current[j];
      if (!el) return;
      el.classList.add("is-hit");
      if (leadTimers[j]) clearTimeout(leadTimers[j]!);
      leadTimers[j] = setTimeout(() => el.classList.remove("is-hit"), 380);
    };

    let raf = 0;
    let last = 0;
    let running = false;

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const blobs = blobsRef.current;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const dot = dotRefs.current[i];
        if (!dot) continue;
        let idx = b.phase === 0 ? b.src : NS + b.lead;
        let path = pathRefs.current[idx];
        if (!path) continue;
        let len = path.getTotalLength();
        if (!len) continue;
        b.d += (SPEED / len) * dt;
        if (b.d >= 1) {
          if (b.phase === 0) {
            // reached the hub → head out to a random lead
            b.phase = 1;
            b.lead = rand(NL);
          } else {
            // delivered to a lead → flash it, respawn from a random source
            flashLead(b.lead);
            b.phase = 0;
            b.src = rand(NS);
          }
          b.d = 0;
          idx = b.phase === 0 ? b.src : NS + b.lead;
          path = pathRefs.current[idx];
          if (!path) continue;
          len = path.getTotalLength();
          if (!len) continue;
        }
        // fade in/out at each leg's ends so respawns never "teleport"
        let k = 1;
        if (b.d < EDGE) k = b.d / EDGE;
        else if (b.d > 1 - EDGE) k = (1 - b.d) / EDGE;
        const pos = path.getPointAtLength(b.d * len);
        dot.setAttribute("cx", String(pos.x));
        dot.setAttribute("cy", String(pos.y));
        dot.setAttribute("opacity", (0.95 * k).toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPlay(true);
            build();
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.2 }
    );
    if (flowRef.current) io.observe(flowRef.current);
    requestAnimationFrame(build);

    return () => {
      stop();
      leadTimers.forEach((t) => t && clearTimeout(t));
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", build);
    };
  }, []);

  // hover a node to trace its wire(s)
  const litPath = (i: number, on: boolean) => {
    pathRefs.current[i]?.classList.toggle("is-active", on);
  };

  // cursor-tracked spotlight + restrained 3D tilt on the attribution cards (matches ClarityCards)
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <section className="sources" id="sources">
      <div className="sources__head reveal-up">
        <span className="eyebrow">One floor for every lead</span>
        <h2 className="h2">
          Every lead, every source, <em>one floor.</em>
        </h2>
        <p className="sources__sub">
          Meta, Google, your website, referrals &mdash; every lead lands on the floor the moment it&rsquo;s
          created, gets priced, and goes to a rep to work. And you finally see how and when each one
          converts: by source, by rep.
        </p>
      </div>

      {/* live floor: every source streams into HuntFloor and out as closed leads */}
      <div className={`sflow reveal-up${play ? " play" : ""}`} ref={flowRef}>
        <svg className="sflow__wires" ref={svgRef} preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: NPATH }).map((_, i) => (
            <path
              key={i}
              className="sflow__path"
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              fill="none"
            />
          ))}
          {Array.from({ length: BLOB_COUNT }).map((_, i) => (
            <circle
              key={i}
              className="sflow__dot"
              r={3.2}
              opacity={0}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
            />
          ))}
        </svg>

        <div className="sflow__col sflow__sources">
          <span className="sflow__col-label">Sources</span>
          {SOURCES.map((s, i) => (
            <div
              className="sflow__chip"
              key={s}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              onMouseEnter={() => litPath(i, true)}
              onMouseLeave={() => litPath(i, false)}
            >
              {s}
            </div>
          ))}
        </div>

        <span className="sflow__mconn" aria-hidden="true" />

        <div className="sflow__hub" ref={hubRef}>
          <div className="sflow__hub-brand">
            HUNT<span>FLOOR</span>
          </div>
          <div className="sflow__hub-sub">priced &middot; matched &middot; picked up</div>
        </div>

        <span className="sflow__mconn" aria-hidden="true" />

        <div className="sflow__col sflow__leads">
          <span className="sflow__col-label">Closed leads</span>
          {LEADS.map((l, j) => (
            <div
              className="sflow__lead"
              key={l.name}
              ref={(el) => {
                leadRefs.current[j] = el;
              }}
              onMouseEnter={() => litPath(NS + j, true)}
              onMouseLeave={() => litPath(NS + j, false)}
            >
              <span className="sflow__lead-name">{l.name}</span>
              <span className="sflow__lead-val mono">{l.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sources__cards">
        {CARDS.map((c) => (
          <div className="scard reveal-up" key={c.title}>
            <div className="scard__inner" onMouseMove={onCardMove} onMouseLeave={onCardLeave}>
              <span className="scard__ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  {c.icon}
                </svg>
              </span>
              <h3 className="scard__t">{c.title}</h3>
              <p className="scard__b">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* integrations marquee — two lanes drifting in opposite directions */}
      <div className="integ reveal-up">
        <span className="integ__label">Plugs into the stack you already run</span>
        <div className="integ__marquee">
          <div className="integ__lane">
            <div className="integ__track">
              {[...LANE_A, ...LANE_A].map((it, i) => {
                const Icon = it.Icon;
                return (
                  <div className="integ__chip" key={`a${i}`}>
                    <span className="integ__mark" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="integ__chip-name">{it.name}</span>
                    <span className="integ__chip-cat">{it.cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="integ__lane">
            <div className="integ__track integ__track--rev">
              {[...LANE_B, ...LANE_B].map((it, i) => {
                const Icon = it.Icon;
                return (
                  <div className="integ__chip" key={`b${i}`}>
                    <span className="integ__mark" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="integ__chip-name">{it.name}</span>
                    <span className="integ__chip-cat">{it.cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="integ__note">
          Two-way sync with your CRM, auto-pull leads from every ad platform, and connect the dialer,
          calendar and automation tools you already run &mdash; HuntFloor sits on top of your stack, it
          doesn&rsquo;t replace it.
        </p>
      </div>
    </section>
  );
}
