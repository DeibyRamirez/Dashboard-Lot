import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  value: number | null | undefined;
  digits?: number;
  fallback?: string;
  className?: string;
};

/**
 * Tweens the displayed number with GSAP only when the value changes
 * (one short tween per MQTT tick, text-only — no layout animation).
 */
export function AnimatedNumber({ value, digits = 1, fallback = "—", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value == null || Number.isNaN(value)) {
      el.textContent = fallback;
      current.current = null;
      return;
    }
    const from = current.current;
    current.current = value;
    if (from == null || prefersReducedMotion()) {
      el.textContent = value.toFixed(digits);
      return;
    }
    const obj = { n: from };
    const tween = gsap.to(obj, {
      n: value,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = obj.n.toFixed(digits);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, digits, fallback]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {value == null || Number.isNaN(value) ? fallback : value.toFixed(digits)}
    </span>
  );
}
