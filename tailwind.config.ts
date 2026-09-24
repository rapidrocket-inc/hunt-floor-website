import type { Config } from "tailwindcss";

// The design system lives in CSS custom properties in app/globals.css
// (see the layered :root tokens). Components style via those tokens and
// BEM-style classes, not Tailwind color/font utilities — so there is no
// theme palette to mirror here. Keep this minimal to avoid drift.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
