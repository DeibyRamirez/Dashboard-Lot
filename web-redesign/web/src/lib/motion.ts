import { gsap } from "gsap";
import Lenis from "lenis";
import { animate } from "animejs";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Smooth scroll with Lenis driven by the GSAP ticker. No-op on reduced motion. */
export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {};
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}

/** Staggered entrance for elements marked with [data-reveal]. transform/opacity only. */
export function revealIn(scope: Element): () => void {
  if (prefersReducedMotion()) return () => {};
  const ctx = gsap.context(() => {
    gsap.from("[data-reveal]", {
      y: 14,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.06,
      clearProps: "transform,opacity",
    });
  }, scope);
  return () => ctx.revert();
}

/** Anime.js micro-interaction: a soft "press" bounce (scale only). */
export function pressBounce(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  animate(el, {
    scale: [{ to: 0.96, duration: 90 }, { to: 1, duration: 320 }],
    ease: "outElastic(1, .6)",
  });
}

/** Anime.js micro-interaction: small pop when a value updates (scale/opacity). */
export function softPop(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  animate(el, {
    scale: [{ to: 1.35, duration: 160 }, { to: 1, duration: 420 }],
    opacity: [{ to: 1, duration: 1 }],
    ease: "outQuad",
  });
}
