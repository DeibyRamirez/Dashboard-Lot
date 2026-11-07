import { useMemo } from "react";
import { prefersReducedMotion } from "./motion";
import { useTheme } from "./theme";

export type ChartTheme = {
  text: string;
  muted: string;
  grid: string;
  track: string;
  brand: string;
  sky: string;
  amber: string;
  coral: string;
  good: string;
  tooltipBg: string;
  tooltipText: string;
  font: string;
  animationMs: number;
};

function v(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Reads design tokens from CSS so Chart.js matches the active theme. */
export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return useMemo(() => {
    const dark = theme === "dark";
    return {
      text: v("--text-primary"),
      muted: v("--text-muted"),
      grid: v("--grid"),
      track: v("--track"),
      brand: v("--accent"),
      sky: v("--sky"),
      amber: v("--amber"),
      coral: v("--coral"),
      good: v("--good"),
      tooltipBg: dark ? "#e7f2ef" : "#10201d",
      tooltipText: dark ? "#10201d" : "#ffffff",
      font: '"Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif',
      // Short, calm updates; none when the user prefers reduced motion.
      animationMs: prefersReducedMotion() ? 0 : 450,
    };
  }, [theme]);
}

export function tooltipStyle(t: ChartTheme) {
  return {
    backgroundColor: t.tooltipBg,
    titleColor: t.tooltipText,
    bodyColor: t.tooltipText,
    padding: 12,
    cornerRadius: 12,
    boxPadding: 6,
    usePointStyle: true,
    titleFont: { family: t.font, weight: 600 as const, size: 12 },
    bodyFont: { family: t.font, size: 12 },
    displayColors: true,
  };
}
