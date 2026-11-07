import { Doughnut } from "react-chartjs-2";
import "../../lib/chartSetup";

type Props = {
  percent: number;
  rssiDbm: number | null | undefined;
};

export function SignalDonut({ percent, rssiDbm }: Props) {
  const p = Math.min(100, Math.max(0, percent));
  const rest = 100 - p;
  const color =
    p >= 60 ? "#22c55e" : p >= 35 ? "#fbbf24" : "#ef4444";

  return (
    <div className="flex h-full flex-col items-center">
      <p className="text-xs font-medium text-[var(--text-muted)]">
        Calidad señal Wi‑Fi
      </p>
      <div
        className="relative mx-auto mt-2 h-32 w-32"
        aria-label={`Señal ${p} por ciento, RSSI ${rssiDbm ?? "desconocido"} dBm`}
      >
        <Doughnut
          data={{
            datasets: [
              {
                data: [p, rest],
                backgroundColor: [color, "#e2e8f0"],
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">{p}%</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {rssiDbm != null ? `${rssiDbm} dBm` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
