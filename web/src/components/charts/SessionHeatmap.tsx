import type { HistoryPoint } from "../../lib/telemetryHistory";

type Props = {
  history: HistoryPoint[];
};

const ROWS: { key: keyof Pick<HistoryPoint, "occupancy" | "windowOpen" | "hvac">; label: string; on: string; off: string }[] = [
  { key: "occupancy", label: "Presencia", on: "Ocupada", off: "Libre" },
  { key: "windowOpen", label: "Ventana", on: "Abierta", off: "Cerrada" },
  { key: "hvac", label: "HVAC", on: "ON", off: "OFF" },
];

export function SessionHeatmap({ history }: Props) {
  const samples = history.slice(-24);

  if (samples.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Sin muestras en esta sesión.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${samples.length}, minmax(1.25rem, 1fr))`,
        }}
        role="img"
        aria-label="Mapa de estados recientes"
      >
        {samples.map((s, i) => (
          <div
            key={`${s.t}-${i}`}
            className="h-2 rounded-sm bg-slate-100"
            title={s.label}
          />
        ))}
      </div>
      {ROWS.map((row) => (
        <div key={row.key} className="mt-3">
          <p className="mb-1 text-xs text-[var(--text-muted)]">{row.label}</p>
          <div
            className="inline-grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${samples.length}, minmax(1.25rem, 1fr))`,
            }}
          >
            {samples.map((s, i) => {
              const active = s[row.key];
              return (
                <div
                  key={`${row.key}-${s.t}-${i}`}
                  className={`h-6 rounded-sm border border-white/50 ${
                    active ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                  title={`${s.label}: ${active ? row.on : row.off}`}
                />
              );
            })}
          </div>
        </div>
      ))}
      <p className="mt-3 text-[10px] text-[var(--text-muted)]">
        Últimas {samples.length} muestras · verde = activo
      </p>
    </div>
  );
}
