import type { Telemetry } from "../types/telemetry";

type Props = {
  telemetry: Telemetry | null;
};

export function KpiStrip({ telemetry }: Props) {
  if (!telemetry) return null;
  const sys = telemetry.system;

  const items = [
    telemetry.grupo && { label: "Grupo", value: telemetry.grupo },
    telemetry.uptime_s != null && {
      label: "Uptime",
      value: `${telemetry.uptime_s}s`,
    },
    telemetry.timestamp && { label: "Último TX", value: telemetry.timestamp },
    sys?.firmware && { label: "Firmware", value: sys.firmware },
    sys?.rssi_dbm != null && {
      label: "RSSI",
      value: `${sys.rssi_dbm} dBm`,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--card-border)] bg-white px-3 py-1.5 text-xs"
        >
          <span className="text-[var(--text-muted)]">{item.label}</span>
          <span className="font-medium tabular-nums text-[var(--text-primary)]">
            {item.value}
          </span>
        </span>
      ))}
    </div>
  );
}
