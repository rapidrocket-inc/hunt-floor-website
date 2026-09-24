"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav__inner">
        <a className="brand" href="#top" aria-label="HuntFloor home">
          HUNT<span>FLOOR</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          <a href="#problem">Problem</a>
          <a href="#loop">How it works</a>
          <a href="#coach">Intelligence</a>
          <a href="#proof">Proof</a>
        </nav>
        <div className="nav__right">
          <a className="btn btn--primary nav__cta" href="#access">
            Book a demo
          </a>
          <button
            className={`hamburger${open ? " open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobileMenu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="mobileMenu" className={`mobile-menu${open ? " open" : ""}`}>
        <a href="#problem" onClick={() => setOpen(false)}>
          Problem
        </a>
        <a href="#loop" onClick={() => setOpen(false)}>
          How it works
        </a>
        <a href="#coach" onClick={() => setOpen(false)}>
          Intelligence
        </a>
        <a href="#proof" onClick={() => setOpen(false)}>
          Proof
        </a>
        <a href="#access" onClick={() => setOpen(false)}>
          Book a demo
        </a>
      </div>
    </header>
  );
}
