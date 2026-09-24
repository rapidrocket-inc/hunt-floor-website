"use client";

import { useEffect, useState } from "react";

const CHECKS = [
  {
    title: "Founder-led",
    sub: "The founder walks you through it — not a bot, not a ticket queue.",
  },
  {
    title: "Your data stays yours",
    sub: "Your floor’s leads, coins and numbers never leave your control.",
  },
  {
    title: "Live within a week",
    sub: "We shape HuntFloor around how your floor already works, fast.",
  },
];

const DESIGNATIONS = [
  "Founder / CEO",
  "Co-founder",
  "VP of Sales",
  "Head of Sales",
  "Sales Director",
  "Sales Manager",
  "Team Lead",
  "Account Executive",
  "SDR / BDR",
  "RevOps",
  "Other",
];

const I = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 20a6.5 6.5 0 0113 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  phone: (
    <path
      d="M6.8 3.5H9l1.6 4-2 1.3a11 11 0 004.6 4.6l1.3-2 4 1.6v2.2a2 2 0 01-2.2 2A15.5 15.5 0 014.8 5.7a2 2 0 012-2.2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  brief: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 7.5V6a2 2 0 012-2h3a2 2 0 012 2v1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12.5h18" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
};

const TEXT_FIELDS = [
  { key: "name", label: "Name", type: "text", ac: "name", ph: "Your full name", icon: I.user },
  { key: "email", label: "Email", type: "email", ac: "email", ph: "you@company.com", icon: I.mail },
  { key: "phone", label: "Phone number", type: "tel", ac: "tel", ph: "+1 555 000 0000", icon: I.phone },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Guess a country dial code from the browser (timezone first, then locale
// region). No permission prompt, no network — runs client-side after mount.
const DIAL: Record<string, string> = {
  IN: "+91", US: "+1", CA: "+1", GB: "+44", AE: "+971", SG: "+65", AU: "+61",
  DE: "+49", FR: "+33", NL: "+31", IE: "+353", ES: "+34", IT: "+39", SA: "+966",
  QA: "+974", ZA: "+27", NZ: "+64", PK: "+92", BD: "+880", LK: "+94", NP: "+977",
  PH: "+63", MY: "+60", ID: "+62", JP: "+81", BR: "+55", MX: "+52",
};
const TZ_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dubai": "AE", "Asia/Qatar": "QA",
  "Asia/Riyadh": "SA", "Asia/Singapore": "SG", "Asia/Karachi": "PK", "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK", "Asia/Kathmandu": "NP", "Asia/Manila": "PH", "Asia/Kuala_Lumpur": "MY",
  "Asia/Jakarta": "ID", "Asia/Tokyo": "JP", "Europe/London": "GB", "Europe/Dublin": "IE",
  "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Amsterdam": "NL", "Europe/Madrid": "ES",
  "Europe/Rome": "IT", "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ", "Africa/Johannesburg": "ZA", "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
};
function guessDialCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const c = TZ_COUNTRY[tz];
    if (c && DIAL[c]) return DIAL[c];
    if (tz.startsWith("America/")) return "+1";
  } catch {
    /* ignore */
  }
  try {
    const region = ((navigator.language || "").split("-")[1] || "").toUpperCase();
    if (DIAL[region]) return DIAL[region];
  } catch {
    /* ignore */
  }
  return "+1";
}

type Status = "idle" | "submitting" | "success" | "error";
type Form = { name: string; email: string; phone: string; designation: string };

export default function BookDemo() {
  const [form, setForm] = useState<Form>({ name: "", email: "", phone: "", designation: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // prefill the phone dial code once, after mount (keeps SSR/CSR markup in sync)
  useEffect(() => {
    setForm((f) => (f.phone ? f : { ...f, phone: `${guessDialCode()} ` }));
  }, []);

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const designation = form.designation.trim();

    if (!name || !email || !phone || !designation) {
      setError("Please fill in every field so we can reach you.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("That email doesn’t look right — mind checking it?");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setError("Please add a full phone number after the country code.");
      return;
    }

    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, designation, source: "book-a-call" }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong sending that. Please try again in a moment.");
    }
  };

  const firstName = form.name.trim().split(" ")[0];

  return (
    <section className="bookdemo" id="access">
      <div className="bookdemo__inner reveal-up">
        <div className="bookdemo__pitch">
          <span className="eyebrow">Founding partners</span>
          <h2 className="h2">
            See it on <em>your own floor.</em>
          </h2>
          <p className="bookdemo__sub">
            A short walkthrough on your real numbers &mdash; your sources, your reps, your leakage.
            Leave your details and the founder reaches out to set up your call.
          </p>

          <ul className="bookdemo__checks">
            {CHECKS.map((c) => (
              <li key={c.title}>
                <span className="bookdemo__check-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M5 12.5l4 4 10-10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="bookdemo__check-txt">
                  <strong>{c.title}.</strong> {c.sub}
                </span>
              </li>
            ))}
          </ul>

          <p className="bookdemo__scarcity">
            <span className="pulse" /> Limited founding-partner slots this quarter.
          </p>
        </div>

        <div className={`bookdemo__panel${status === "success" ? " is-done" : ""}`}>
          <span className="bookdemo__panel-glow" aria-hidden="true" />

          {status === "success" ? (
            <div className="bookdemo__done" role="status" aria-live="polite">
              <span className="bookdemo__done-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M8 12.4l2.6 2.6L16 9.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="bookdemo__panel-t">You&rsquo;re on the list.</h3>
              <p className="bookdemo__panel-d">
                Thanks{firstName ? `, ${firstName}` : ""}. The founder will reach out shortly to set up
                your call.
              </p>
            </div>
          ) : (
            <>
              <div className="bookdemo__panel-head">
                <span className="bookdemo__panel-badge">
                  <span className="pulse" /> Founding access
                </span>
                <h3 className="bookdemo__panel-t">Reserve your seat</h3>
                <p className="bookdemo__panel-d">Four quick details — the founder takes it from there.</p>
              </div>

              <form className="bookdemo__form" onSubmit={onSubmit} noValidate>
                {TEXT_FIELDS.map((f) => (
                  <div className="bookdemo__field" key={f.key}>
                    <label htmlFor={`bd-${f.key}`}>{f.label}</label>
                    <span className="bookdemo__input">
                      <span className="bookdemo__input-ic" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          {f.icon}
                        </svg>
                      </span>
                      <input
                        id={`bd-${f.key}`}
                        type={f.type}
                        name={f.key}
                        autoComplete={f.ac}
                        placeholder={f.ph}
                        value={form[f.key]}
                        onChange={set(f.key)}
                      />
                    </span>
                  </div>
                ))}

                <div className="bookdemo__field">
                  <label htmlFor="bd-designation">Designation</label>
                  <span className="bookdemo__input bookdemo__input--select">
                    <span className="bookdemo__input-ic" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        {I.brief}
                      </svg>
                    </span>
                    <select
                      id="bd-designation"
                      name="designation"
                      value={form.designation}
                      onChange={set("designation")}
                      className={form.designation ? "" : "is-empty"}
                    >
                      <option value="" disabled>
                        Select your role
                      </option>
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <span className="bookdemo__input-chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M6 9l6 6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                </div>

                {error && (
                  <p className="bookdemo__error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary btn--block bookdemo__submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    "Sending…"
                  ) : (
                    <>
                      Book my call
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                          d="M5 12h13M13 6l6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <p className="bookdemo__panel-foot">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                No spam. The founder replies personally, usually within a day.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
