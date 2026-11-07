import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { HistoryPoint } from "../../lib/telemetryHistory";
import "../../lib/chartSetup";
import { tooltipStyle, useChartTheme } from "../../lib/chartTheme";
import { EmptyState } from "../ui/EmptyState";
import { IconChart } from "../ui/Icons";

type Props = {
  history: HistoryPoint[];
};

export function TelemetryBarChart({ history }: Props) {
  const t = useChartTheme();
  const chart = useMemo(() => {
    const labels = history.map((h) => h.label);
    const temps = history.map((h) => h.temp ?? NaN);
    const hums = history.map((h) => h.hum ?? NaN);
    const tick = { color: t.muted, font: { family: t.font, size: 11 } };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: t.animationMs },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
            padding: 16,
            color: t.text,
            font: { family: t.font, size: 12, weight: 500 },
          },
        },
        tooltip: {
          ...tooltipStyle(t),
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y == null || Number.isNaN(ctx.parsed.y) ? "—" : ctx.parsed.y.toFixed(1)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { ...tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "°C", color: t.muted, font: { family: t.font, size: 11 } },
          suggestedMin: 10,
          suggestedMax: 40,
          ticks: { ...tick, maxTicksLimit: 5 },
          grid: { color: t.grid },
          border: { display: false, dash: [4, 4] },
        },
        y1: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "% RH", color: t.muted, font: { family: t.font, size: 11 } },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { ...tick, maxTicksLimit: 5 },
          border: { display: false },
        },
      },
    };

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Temperatura °C",
            data: temps,
            backgroundColor: t.brand,
            hoverBackgroundColor: t.brand,
            borderRadius: 8,
            borderSkipped: false as const,
            maxBarThickness: 18,
            categoryPercentage: 0.7,
            barPercentage: 0.85,
            yAxisID: "y",
          },
          {
            label: "Humedad %",
            data: hums,
            backgroundColor: t.sky,
            hoverBackgroundColor: t.sky,
            borderRadius: 8,
            borderSkipped: false as const,
            maxBarThickness: 18,
            categoryPercentage: 0.7,
            barPercentage: 0.85,
            yAxisID: "y1",
          },
        ],
      },
      options,
    };
  }, [history, t]);

  if (history.length < 2) {
    return (
      <EmptyState
        compact
        icon={<IconChart className="h-6 w-6" />}
        title="Acumulando muestras…"
        text="El historial aparece en cuanto lleguen dos lecturas."
      />
    );
  }

  return (
    <div className="h-64 w-full sm:h-72">
      <Bar data={chart.data} options={chart.options} />
    </div>
  );
}
