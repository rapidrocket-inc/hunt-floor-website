// Central SEO / site constants. The production domain comes from
// NEXT_PUBLIC_SITE_URL (set it in the deploy env); a placeholder is used until then.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://huntfloor.com"
).replace(/\/+$/, "");

export const SITE_NAME = "HuntFloor";
export const TAGLINE = "The sales floor, run as a market.";

export const DESCRIPTION =
  "Give every sales rep a monthly lead budget and they buy the leads they'll actually work — with AI routing and a P&L per rep, on top of your CRM and ad accounts.";

export const KEYWORDS = [
  "sales lead management",
  "lead distribution software",
  "lead routing",
  "AI lead routing",
  "sales floor software",
  "sales performance management",
  "lead marketplace",
  "CRM add-on",
  "sales rep P&L",
  "inside sales software",
];

// The company that builds HuntFloor.
export const PUBLISHER = { name: "Rapid Rocket", url: "https://rapidrocket.co" };

export type Faq = { tag: string; q: string; a: string };

// Single source of truth for the on-page FAQ (Faq.tsx) and the FAQPage JSON-LD.
export const FAQS: Faq[] = [
  {
    tag: "Integrations",
    q: "Does it work with my CRM and ad accounts?",
    a: "Yes. Two-way sync with Zoho, HubSpot and GoHighLevel, and it pulls leads straight from Meta and Google Ad Managers. HuntFloor sits on top of the stack you already run — you don't rip anything out.",
  },
  {
    tag: "Intelligence",
    q: "How does the AI actually help?",
    a: "It learns from real outcomes on your floor: who converts what, when and why. It match-makes each lead to the rep most likely to close it, an AI agent assists the call and follow-up, and managers get predictions — which leads are about to go cold and what to fix.",
  },
  {
    tag: "Pricing",
    q: "How is pricing structured?",
    a: "Priced for outcomes, not per seat. Founding design partners settle pricing directly with the founder — full details come with your demo.",
  },
  {
    tag: "Ownership",
    q: "Who owns the data?",
    a: "You do. Your floor's leads, coins, settlements and numbers stay yours and never leave your control.",
  },
  {
    tag: "Fit",
    q: "What kind of floor is this built for?",
    a: "Any growing sales floor that runs on leads: real teams claiming, calling and closing every day. It was born on a live floor (DestinMe) and runs there in production.",
  },
  {
    tag: "Onboarding",
    q: "What happens after I book a demo?",
    a: "You hear from the founder, not a bot. We walk you through the live floor on your own numbers — your sources, your reps, the leakage — and the manager view this page keeps hinting at. Nothing on this page is a mock-up.",
  },
];
