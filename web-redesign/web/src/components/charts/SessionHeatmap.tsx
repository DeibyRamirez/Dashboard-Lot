import type { HistoryPoint } from "../../lib/telemetryHistory";
import { EmptyState } from "../ui/EmptyState";
import { IconGrid } from "../ui/Icons";

type Props = {
  history: HistoryPoint[];
};

const ROWS: {
  key: keyof Pick<HistoryPoint, "occupancy" | "windowOpen" | "hvac">;
  label: string;
  on: string;
  off: string;
  color: string;
}[] = [
  { key: "occupancy", label: "Presencia", on: "Ocupada", off: "Libre", color: "bg-brand" },
  { key: "windowOpen", label: "Ventana", on: "Abierta", off: "Cerrada", color: "bg-sky" },
  { key: "hvac", label: "HVAC", on: "Encendido", off: "Apagado", color: "bg-amber" },
];

export function SessionHeatmap({ history }: Props) {
  const samples = history.slice(-24);

  if (samples.length === 0) {
    return (
      <EmptyState
        compact
        icon={<IconGrid className="h-6 w-6" />}
        title="Aún no hay muestras"
        text="Aquí verás presencia, ventana y HVAC a lo largo de la sesión."
      />
    );
  }

  const cols = { gridTemplateColumns: `repeat(${samples.length}, minmax(0.875rem, 1fr))` };
  const latest = samples[samples.length - 1];

  return (
    <div>
      <div className="space-y-4" role="img" aria-label="Mapa de estados recientes: presencia, ventana y HVAC">
        {ROWS.map((row) => (
          <div key={row.key} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 sm:grid-cols-[7rem_1fr]">
            <div>
              <p className="text-sm font-semibold text-ink">{row.label}</p>
              <p className="text-[11px] text-muted">{latest[row.key] ? row.on : row.off}</p>
            </div>
            <div className="overflow-x-auto">
              <div className="grid gap-1" style={cols}>
                {samples.map((s, i) => {
                  const active = s[row.key];
                  return (
                    <div
                      key={`${row.key}-${s.t}-${i}`}
                      className={`h-7 rounded-lg transition-colors duration-300 ${active ? row.color : "bg-track"}`}
                      title={`${s.label}: ${active ? row.on : row.off}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          {samples[0].label} → {latest.label}
        </span>
        <span className="flex items-center gap-3">
          {ROWS.map((r) => (
            <span key={r.key} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} aria-hidden />
              {r.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-track" aria-hidden />
            Inactivo
          </span>
        </span>
      </div>
    </div>
  );
}
