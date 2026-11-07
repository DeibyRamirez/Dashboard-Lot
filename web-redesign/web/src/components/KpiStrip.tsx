import type { Telemetry } from "../types/telemetry";

type Props = {
  telemetry: Telemetry | null;
};

function formatUptime(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60}s`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function formatTx(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function KpiStrip({ telemetry }: Props) {
  if (!telemetry) return null;
  const sys = telemetry.system;

  const items = [
    telemetry.grupo && { label: "Grupo", value: telemetry.grupo },
    telemetry.uptime_s != null && { label: "Activo", value: formatUptime(telemetry.uptime_s) },
    telemetry.timestamp && { label: "Último envío", value: formatTx(telemetry.timestamp) },
    sys?.firmware && { label: "Firmware", value: sys.firmware },
    sys?.rssi_dbm != null && { label: "RSSI", value: `${sys.rssi_dbm} dBm` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <ul data-reveal className="flex flex-wrap gap-2" aria-label="Datos del dispositivo">
      {items.map((item) => (
        <li
          key={item.label}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs shadow-soft"
        >
          <span className="text-muted">{item.label}</span>
          <span className="font-semibold tabular-nums text-ink">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
