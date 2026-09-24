const BEATS = [
  {
    t: "Our own floor was losing leads.",
    d: "Free leads, grabbed by the loudest and worked by no one.",
  },
  {
    t: "So we built the market.",
    d: "Coins, prices and live auctions turned a free-for-all into an economy.",
  },
  {
    t: "We ran it on ourselves.",
    d: "Our BDEs buy leads, ring the Bell and settle real months on it — real coins, real payroll, real auctions since day one.",
  },
  {
    t: "It works. Now it’s yours.",
    d: "Every feature exists because a live floor demanded it. In production daily. Nothing is a mock-up.",
  },
];

const STATS = [
  { n: "73+", l: "curated properties" },
  { n: "3", l: "India · Bali · Sri Lanka" },
  { n: "Daily", l: "in production" },
  { n: "0", l: "mock-ups" },
];

export default function Proof() {
  return (
    <section className="proof" id="proof">
      <div className="proof__grid">
        <div className="proof__intro">
          <span className="eyebrow reveal-up">The origin</span>
          <h2 className="h2 reveal-up">
            Born on a <em>real floor.</em>
          </h2>
          <p className="proof__lead reveal-up">
            We didn&rsquo;t build it for a pitch &mdash; our own floor needed it.
          </p>

          <div className="proof__cred reveal-up">
            <span className="proof__cred-glow" aria-hidden="true" />
            <div className="proof__cred-banner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/destinme.jpg"
                alt="A DestinMe luxury hospitality floor lit for the evening"
                loading="lazy"
              />
              <span className="proof__live">
                <span className="pulse" /> Live floor
              </span>
            </div>
            <div className="proof__cred-body">
              <span className="proof__cred-name">DestinMe</span>
              <span className="proof__cred-sub">Luxury hospitality</span>
              <ul className="proof__stats">
                {STATS.map((s) => (
                  <li key={s.l} className="proof__stat">
                    <span className="proof__stat-n">{s.n}</span>
                    <span className="proof__stat-l">{s.l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="proof__story">
          <ol className="proof__timeline">
            {BEATS.map((b, i) => (
              <li
                className={`proof__beat reveal-up${i === BEATS.length - 1 ? " is-now" : ""}`}
                key={b.t}
                style={{ ["--i" as string]: i } as React.CSSProperties}
              >
                <span className="proof__beat-marker" aria-hidden="true">
                  <span className="proof__beat-dot" />
                </span>
                <div className="proof__beat-txt">
                  <span className="proof__beat-n">0{i + 1}</span>
                  <h3 className="proof__beat-t">{b.t}</h3>
                  <p className="proof__beat-d">{b.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="proof__gated reveal-up">
            <span className="proof__gated-pill">On the demo</span>
            The real before/after numbers from our floor &mdash; CRM update rate, lead response time and
            revenue recovered &mdash; walked through live on your call.
          </p>
        </div>
      </div>
    </section>
  );
}
