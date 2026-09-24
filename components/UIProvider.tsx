"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type BellPayload = { name: string; amount: string };

type UICtx = {
  ringBell: (p?: BellPayload) => void;
  openFilm: () => void;
};

const Ctx = createContext<UICtx | null>(null);

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const [bell, setBell] = useState<BellPayload | null>(null);
  const [bellShow, setBellShow] = useState(false);
  const [film, setFilm] = useState(false);
  const [muted, setMuted] = useState(true);
  const [soundTouched, setSoundTouched] = useState(false);
  const bellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ringBell = useCallback(
    (p?: BellPayload) => {
      const payload = p ?? { name: "Priya", amount: "$4,200" };
      setBell(payload);
      setBellShow(true);
      // optional soft ding, only if user has unmuted at least once
      if (!muted && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      if (bellTimer.current) clearTimeout(bellTimer.current);
      bellTimer.current = setTimeout(() => setBellShow(false), 2800);
    },
    [muted]
  );

  const openFilm = useCallback(() => {
    setFilm(true);
  }, []);

  const closeFilm = useCallback(() => {
    setFilm(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Global reveal-on-scroll observer for .reveal / .reveal-up
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-up")
    );
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => {
      // Anything already in or above the viewport reveals immediately (the CSS
      // transition + per-element delay still plays the staggered entrance). This
      // keeps above-the-fold content from depending on the observer, which does
      // not fire while the tab is backgrounded. Only below-fold elements wait.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });

    // Safety net: if the observer never fires (e.g. loaded while hidden), reveal
    // anything still pending once the page becomes visible.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      els.forEach((el) => {
        if (
          !el.classList.contains("in") &&
          el.getBoundingClientRect().top < window.innerHeight
        ) {
          el.classList.add("in");
        }
      });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Esc closes film modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFilm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFilm]);

  const toggleMute = () => {
    setMuted((m) => !m);
    setSoundTouched(true);
  };

  return (
    <Ctx.Provider value={{ ringBell, openFilm }}>
      {children}

      {/* Bell overlay */}
      <div
        className={`bell-overlay${bellShow ? " show" : ""}`}
        aria-hidden={!bellShow}
        onClick={() => setBellShow(false)}
      >
        <div className="bell-overlay__flash" />
        <div className="bell-overlay__spark" aria-hidden="true" />
        <div className="bell-overlay__inner">
          <div className="bell-overlay__ic">
            <svg viewBox="0 0 24 24" width="52" height="52">
              <path
                d="M12 3a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M10 19a2 2 0 0 0 4 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="bell-overlay__line">
            🔔 {bell?.name} closed {bell?.amount}
          </div>
          <div className="bell-overlay__brand">HuntFloor</div>
        </div>
        {soundTouched && (
          <button
            className={`bell-overlay__mute${muted ? " muted" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
              <path
                className="mute-x"
                d="M16 9l4 6M20 9l-4 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
      {/* keep a mute toggle reachable even before first unmute via corner control */}
      {!soundTouched && bellShow && (
        <button
          className="bell-overlay__mute"
          style={{ zIndex: 101 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          aria-label="Unmute"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
            <path
              className="mute-x"
              d="M16 9l4 6M20 9l-4 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* Film modal */}
      <div className={`modal${film ? " show" : ""}`} aria-hidden={!film}>
        <div className="modal__backdrop" onClick={closeFilm} />
        <div
          className="modal__box"
          role="dialog"
          aria-modal="true"
          aria-label="HuntFloor brand film"
        >
          <button className="modal__close" onClick={closeFilm} aria-label="Close film">
            ×
          </button>
          {film && (
            <video
              ref={videoRef}
              controls
              playsInline
              autoPlay
              poster="/assets/hero-keyhole.jpg"
            >
              <source src="/assets/huntfloor-film.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}
