import { Doughnut } from "react-chartjs-2";
import "../../lib/chartSetup";

type Props = {
  percentOccupied: number;
  currentlyOccupied: boolean;
};

export function OccupancyDonut({
  percentOccupied,
  currentlyOccupied,
}: Props) {
  const p = Math.min(100, Math.max(0, percentOccupied));
  const rest = 100 - p;

  return (
    <div className="flex h-full flex-col items-center">
      <p className="text-xs font-medium text-[var(--text-muted)]">
        Ocupación (sesión)
      </p>
      <div
        className="relative mx-auto mt-2 h-32 w-32"
        aria-label={`Ocupación ${p} por ciento de muestras; ahora ${currentlyOccupied ? "ocupada" : "libre"}`}
      >
        <Doughnut
          data={{
            datasets: [
              {
                data: [p, rest],
                backgroundColor: ["#0d9488", "#e2e8f0"],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="text-xl font-semibold tabular-nums">{p}%</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {currentlyOccupied ? "Ocupada ahora" : "Libre ahora"}
          </span>
        </div>
      </div>
    </div>
  );
}
