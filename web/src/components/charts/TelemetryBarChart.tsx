import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { HistoryPoint } from "../../lib/telemetryHistory";
import "../../lib/chartSetup";

type Props = {
  history: HistoryPoint[];
};

export function TelemetryBarChart({ history }: Props) {
  const chart = useMemo(() => {
    const labels = history.map((h) => h.label);
    const temps = history.map((h) => h.temp ?? NaN);
    const hums = history.map((h) => h.hum ?? NaN);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Temp °C",
            data: temps,
            backgroundColor: "rgba(13, 148, 136, 0.75)",
            borderRadius: 2,
            yAxisID: "y",
          },
          {
            label: "Humedad %",
            data: hums,
            backgroundColor: "rgba(59, 130, 246, 0.65)",
            borderRadius: 2,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index" as const, intersect: false },
        plugins: {
          legend: {
            position: "top" as const,
            labels: { boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          x: {
            ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
            grid: { display: false },
          },
          y: {
            type: "linear" as const,
            position: "left" as const,
            title: { display: true, text: "°C", font: { size: 10 } },
            suggestedMin: 10,
            suggestedMax: 40,
          },
          y1: {
            type: "linear" as const,
            position: "right" as const,
            grid: { drawOnChartArea: false },
            title: { display: true, text: "% RH", font: { size: 10 } },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    };
  }, [history]);

  if (history.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-muted)]">
        Acumulando muestras para el historial…
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar data={chart.data} options={chart.options} />
    </div>
  );
}
