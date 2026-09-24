// US-format integer with thousands grouping (e.g. 739200 -> "739,200")
export function formatGrouping(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

// $ prefixed US currency
export function formatUSD(n: number): string {
  return "$" + formatGrouping(n);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Animate a numeric value; calls onUpdate with the eased current value.
// Returns a cancel function.
export function countTo(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void
): () => void {
  if (prefersReducedMotion() || duration <= 0) {
    onUpdate(to);
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    onUpdate(from + (to - from) * eased);
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
