import type { Telemetry } from "../types/telemetry";

export type HistoryPoint = {
  t: number;
  label: string;
  temp: number | null;
  hum: number | null;
  occupancy: boolean;
  windowOpen: boolean;
  hvac: boolean;
};

function formatLabel(iso: string | null | undefined, t: number): string {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  }
  return new Date(t).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function telemetryToHistoryPoint(
  telemetry: Telemetry,
  receivedAt = Date.now(),
): HistoryPoint {
  return {
    t: receivedAt,
    label: formatLabel(telemetry.timestamp, receivedAt),
    temp: telemetry.metrics.temperature_c ?? null,
    hum: telemetry.metrics.humidity_rh_pct ?? null,
    occupancy: telemetry.metrics.occupancy,
    windowOpen: telemetry.metrics.contact_window_open ?? false,
    hvac: telemetry.actuators.hvac_power,
  };
}

export function appendHistoryPoint(
  prev: HistoryPoint[],
  point: HistoryPoint,
  maxPoints: number,
  lastTimestamp: string | null | undefined,
  newTimestamp: string | null | undefined,
  minGapMs: number,
): HistoryPoint[] {
  const last = prev[prev.length - 1];
  if (last) {
    if (
      lastTimestamp === newTimestamp &&
      point.t - last.t < minGapMs
    ) {
      return prev;
    }
  }
  const next = [...prev, point];
  if (next.length <= maxPoints) return next;
  return next.slice(next.length - maxPoints);
}

export function occupancyPercent(history: HistoryPoint[]): number {
  if (history.length === 0) return 0;
  const occupied = history.filter((p) => p.occupancy).length;
  return Math.round((occupied / history.length) * 100);
}

export function rssiToPercent(rssi: number | null | undefined): number {
  if (rssi == null || Number.isNaN(rssi)) return 0;
  const clamped = Math.min(-30, Math.max(-90, rssi));
  return Math.round(((clamped + 90) / 60) * 100);
}
