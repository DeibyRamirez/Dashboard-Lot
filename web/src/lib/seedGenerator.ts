import type { Telemetry } from "../types/telemetry";

export type SeedState = {
  tick: number;
  hvacPower: boolean;
  mode: "AUTO" | "FORCED";
};

export function createInitialSeedState(hvacPower = true): SeedState {
  return { tick: 0, hvacPower, mode: "AUTO" };
}

/** Forma Wokwi (construir_telemetria) — solo para VITE_USE_MOCK */
export function nextSeedTelemetry(
  state: SeedState,
  deviceId: string,
): { telemetry: Telemetry; state: SeedState } {
  const tick = state.tick + 5;
  const t = 23.8 + Math.sin(tick / 30) * 1.2;
  const h = 55.2 + Math.cos(tick / 40) * 3;
  const hvacPower = state.hvacPower;
  const mode = state.mode;
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const telemetry: Telemetry = {
    device_id: deviceId,
    grupo: "grupoX",
    uptime_s: tick,
    timestamp: now,
    metrics: {
      occupancy: tick % 30 < 15,
      temperature_c: Math.round(t * 10) / 10,
      humidity_rh_pct: Math.round(h * 10) / 10,
      contact_window_open: tick % 45 < 5,
    },
    actuators: {
      hvac_power: hvacPower,
      mode,
    },
    system: {
      rssi_dbm: -80 - Math.floor(Math.random() * 10),
      firmware: "wokwi-micropython-v1.27.0",
      status: "OPERATIONAL",
    },
  };

  return { telemetry, state: { tick, hvacPower, mode } };
}
