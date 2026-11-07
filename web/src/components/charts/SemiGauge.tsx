import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "../../lib/chartSetup";

type Zone = { upTo: number; color: string };

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

export function SemiGauge({
  title,
  value,
  min,
  max,
  unit,
  zones,
  emptyLabel = "Sin lectura DHT",
}: Props) {
  const hasValue = value != null && !Number.isNaN(value);
  const ratio = hasValue ? (clamp(value, min, max) - min) / (max - min) : null;

  const { data, colors } = useMemo(() => {
    if (!hasValue) {
      return { data: [1], colors: ["#e2e8f0"] };
    }
    return buildZoneData(min, max, zones);
  }, [hasValue, min, max, zones]);

  const display = hasValue ? value!.toFixed(1) : "—";

  const chartData = {
    labels: zones.map((z) => String(z.upTo)),
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      semiGaugeNeedle: { ratio: hasValue ? ratio! : undefined },
    },
  };

  return (
    <div className="flex h-full flex-col">
      <p className="text-center text-xs font-medium text-[var(--text-muted)]">
        {title}
      </p>
      <div
        className="relative mx-auto h-36 w-full max-w-[220px]"
        aria-label={
          hasValue
            ? `${title} ${display} ${unit}`
            : `${title}: ${emptyLabel}`
        }
      >
        <Doughnut data={chartData} options={options} />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
          <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {display}
            <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
              {unit}
            </span>
          </p>
          {!hasValue && (
            <p className="text-[10px] text-[var(--text-muted)]">{emptyLabel}</p>
          )}
        </div>
      </div>
      <div className="mt-1 flex justify-between px-2 text-[10px] text-[var(--text-muted)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export const TEMP_ZONES: Zone[] = [
  { upTo: 18, color: "#fbbf24" },
  { upTo: 26, color: "#22c55e" },
  { upTo: 40, color: "#f97316" },
];

export const HUM_ZONES: Zone[] = [
  { upTo: 30, color: "#fbbf24" },
  { upTo: 60, color: "#22c55e" },
  { upTo: 100, color: "#f97316" },
];
