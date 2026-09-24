# HuntFloor landing page

A premium, product-led landing page for HuntFloor, a sales-floor operating system.
Design language: "trading desk meets private bank." Dark aubergine / near-black,
warm gold accents, serif headlines with an italic-to-bold emphasis pattern, tabular
figures on every number. Cinematic treatment is rationed to two moments only (the
hero keyhole and "the turn"), plus the Bell delight trigger.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind (theme tokens) with a hand-authored design system in `app/globals.css`
- GSAP + ScrollTrigger, lazy-loaded, used only for the scroll-driven WhatsApp thread
- Fonts via `next/font`: Fraunces (serif display, with italics) + Instrument Sans (body)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Structure

- `app/page.tsx` — assembles the sections inside `UIProvider`
- `app/globals.css` — full design system + every section's desktop and mobile layout
- `components/` — one component per section (Hero, Clarity, Problem, LeakCalculator,
  Shift, Turn, Product, Coach, Category, Proof, AccessForm, Faq) plus `Nav`,
  `UIProvider` (owns the Bell overlay + film modal + scroll reveals)
- `app/api/early-access/route.ts` — form endpoint (stub: logs + returns 200)
- `public/assets/` — hero keyhole, DestinMe photo, brand film (all from the deck)

## Interactive pieces (all real, not mocked)

- Section 4 leak calculator: three live sliders feeding a count-up result panel
- Section 5 before/after: a working toggle that cross-fades the panel
- Section 7 product walkthrough: tabbed browser-frame with a count-up P&L on the
  Settlement tab and a working "Ring it" trigger on the Bell tab
- Section 9 Bell: full-screen overlay, manually triggered and auto-fired once at 60%
  scroll depth (rate-limited per session); sound is off by default, never autoplays
- Section 12 form: inline validation with per-field shake, cross-fade to a
  confirmation state, posts to the API route

Accessibility: keyboard-navigable, visible focus rings, `prefers-reduced-motion`
respected throughout (animations disabled, numbers snap to final values).

## Still needed from you

See the "What I still need" section of the handoff notes:

1. **Form destination** — where submissions should land (email / Slack webhook /
   Google Sheet / CRM). The route at `app/api/early-access/route.ts` currently only
   logs server-side. Wire it to the real destination before launch.
2. **DestinMe before/after numbers** (CRM update rate, lead response time) once
   cleared for publishing. Currently a clearly-labeled "Pending" placeholder.
3. **Team quote** for the proof section, if/when you want one (omitted for now, no
   invented testimonials).
4. **Real product screenshots** for Wallet / Lead Market, if you prefer them over the
   high-fidelity built-to-deck mockups currently in place. The Settlement P&L card is
   already built to match deck p.6 exactly.
5. **Founder WhatsApp number** confirmation — currently wired to +91 95052 22555
   (from deck p.12) on the confirmation button and footer.
6. **Sound file** for the optional Bell "ding" if you want one (none wired yet; the
   mute control is present and audio never autoplays).
