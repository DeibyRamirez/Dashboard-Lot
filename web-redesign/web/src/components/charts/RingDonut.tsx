import type { ChartOptions } from "chart.js";
import type { ReactNode } from "react";
import { Doughnut } from "react-chartjs-2";
import "../../lib/chartSetup";
import { useChartTheme } from "../../lib/chartTheme";
import { AnimatedNumber } from "../ui/AnimatedNumber";

type Props = {
  percent: number;
  color: string;
  ariaLabel: string;
  caption: ReactNode;
};

/** Shared rounded progress ring used by SignalDonut and OccupancyDonut. */
export function RingDonut({ percent, color, ariaLabel, caption }: Props) {
  const t = useChartTheme();
  const p = Math.min(100, Math.max(0, percent));
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    animation: { duration: t.animationMs },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };
  return (
    <div className="relative mx-auto h-36 w-36" role="img" aria-label={ariaLabel}>
      <Doughnut
        data={{
          datasets: [
            {
              data: [p, 100 - p],
              backgroundColor: [color, t.track],
              borderWidth: 0,
              borderRadius: p > 0 && p < 100 ? 20 : 0,
            },
          ],
        }}
        options={options}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[26px] font-bold leading-none tracking-tight text-ink">
          <AnimatedNumber value={p} digits={0} />
          <span className="text-base font-semibold text-muted">%</span>
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted">{caption}</span>
      </div>
    </div>
  );
}
