import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "../../lib/chartSetup";
import { useChartTheme } from "../../lib/chartTheme";
import { AnimatedNumber } from "../ui/AnimatedNumber";

type Zone = { upTo: number; color: string; label?: string };

type Props = {
  title: string;
  value: number | null | undefined;
  min: number;
  max: number;
  unit: string;
  zones: Zone[];
  emptyLabel?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function buildZoneData(min: number, max: number, zones: Zone[]) {
  const sorted = [...zones].sort((a, b) => a.upTo - b.upTo);
  const data: number[] = [];
  const colors: string[] = [];
  let cursor = min;
  for (const z of sorted) {
    const end = Math.min(z.upTo, max);
    if (end > cursor) {
      data.push(end - cursor);
      colors.push(z.color);
      cursor = end;
    }
  }
  if (cursor < max) {
    data.push(max - cursor);
    colors.push(sorted[sorted.length - 1]?.color ?? "#94a3b8");
  }
  return { data, colors };
}

function zoneFor(value: number, zones: Zone[]) {
  const sorted = [...zones].sort((a, b) => a.upTo - b.upTo);
  return sorted.find((z) => value <= z.upTo) ?? sorted[sorted.length - 1];
}

export function SemiGauge({
  title,
  value,
  min,
  max,
  unit,
  zones,
  emptyLabel = "Sin lectura DHT",
}: Props) {
  const t = useChartTheme();
  const hasValue = value != null && !Number.isNaN(value);
  const ratio = hasValue ? (clamp(value, min, max) - min) / (max - min) : null;

  const { data, colors } = useMemo(() => {
    if (!hasValue) return { data: [1], colors: [t.track] };
    return buildZoneData(min, max, zones);
  }, [hasValue, min, max, zones, t.track]);

  const zone = hasValue ? zoneFor(value, zones) : null;

  const chartData = {
    labels: zones.map((z) => String(z.upTo)),
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 8,
        spacing: 3,
        hoverOffset: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: "78%",
    animation: { duration: t.animationMs },
    layout: { padding: { left: 4, right: 4, top: 4 } },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      semiGaugeNeedle: {
        ratio: hasValue ? ratio! : undefined,
        color: t.text,
        ring: getComputedStyle(document.documentElement).getPropertyValue("--card-bg").trim(),
      },
    },
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative mx-auto h-32 w-full max-w-[220px]"
        role="img"
        aria-label={hasValue ? `${title} ${value!.toFixed(1)} ${unit}` : `${title}: ${emptyLabel}`}
      >
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-3 flex items-end justify-between px-1 text-[11px] text-muted">
        <span>{min}</span>
        <p className="text-center leading-none">
          <AnimatedNumber value={value} className="text-[28px] font-bold tracking-tight text-ink" />
          <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
        </p>
        <span>{max}</span>
      </div>
      <div className="mt-3 flex justify-center">
        {hasValue && zone ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `color-mix(in srgb, ${zone.color} 18%, transparent)` }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: zone.color }} aria-hidden />
            <span className="text-ink">{zone.label ?? "En rango"}</span>
          </span>
        ) : (
          <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

export const TEMP_ZONES: Zone[] = [
  { upTo: 18, color: "#fcd34d", label: "Fresco" },
  { upTo: 26, color: "#34d399", label: "Confortable" },
  { upTo: 40, color: "#fb923c", label: "Caluroso" },
];

export const HUM_ZONES: Zone[] = [
  { upTo: 30, color: "#fcd34d", label: "Seco" },
  { upTo: 60, color: "#34d399", label: "Ideal" },
  { upTo: 100, color: "#60a5fa", label: "Húmedo" },
];
