import { z } from "zod";

/** Esquema alineado al firmware Wokwi (construir_telemetria). */
export const metricsSchema = z.object({
  occupancy: z.boolean(),
  contact_window_open: z.boolean().optional().default(false),
  temperature_c: z.number().nullable().optional(),
  humidity_rh_pct: z.number().nullable().optional(),
  /** Solo si añades sensor en Wokwi */
  illuminance_lux: z.number().optional(),
  current_ac_amps: z.number().optional(),
  active_power_watts: z.number().optional(),
});

export const actuatorsSchema = z.object({
  hvac_power: z.boolean(),
  mode: z.enum(["AUTO", "FORCED"]).optional().default("AUTO"),
});

export const systemSchema = z.object({
  rssi_dbm: z.number().nullable().optional(),
  firmware: z.string().optional(),
  status: z.string().optional(),
});

export const telemetrySchema = z.object({
  device_id: z.string(),
  grupo: z.string().optional(),
  timestamp: z.string().nullable().optional(),
  uptime_s: z.number().optional(),
  metrics: metricsSchema,
  actuators: actuatorsSchema,
  system: systemSchema.optional(),
});

export type Telemetry = z.infer<typeof telemetrySchema>;

export const mqttCommandSchema = z.object({
  command_id: z.string(),
  target_device: z.string(),
  action: z.enum(["SET_ACTUATOR_STATE", "SET_AUTO"]),
  hvac_power: z.boolean().optional(),
  reason: z.string().optional(),
  override_priority: z.string().optional(),
});

export type MqttCommand = z.infer<typeof mqttCommandSchema>;

export function normalizeTelemetryRaw(raw: unknown): unknown {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }

  const p = { ...(raw as Record<string, unknown>) };
  const metrics =
    p.metrics && typeof p.metrics === "object" && !Array.isArray(p.metrics)
      ? { ...(p.metrics as Record<string, unknown>) }
      : {};

  const m = metrics as Record<string, unknown>;
  if (m.temperature_c === undefined && typeof m.temperatura_c === "number") {
    m.temperature_c = m.temperatura_c;
  }
  delete m.temperatura_c;
  if (m.contact_window_open === undefined) m.contact_window_open = false;

  p.metrics = m;

  if (!p.actuators || typeof p.actuators !== "object") {
    p.actuators = { hvac_power: false, mode: "AUTO" };
  } else {
    const a = { ...(p.actuators as Record<string, unknown>) };
    if (a.mode !== "FORCED" && a.mode !== "AUTO") a.mode = "AUTO";
    p.actuators = a;
  }

  const system =
    p.system && typeof p.system === "object" && !Array.isArray(p.system)
      ? { ...(p.system as Record<string, unknown>) }
      : {};

  if (typeof p.rssi_dbm === "number" && system.rssi_dbm === undefined) {
    system.rssi_dbm = p.rssi_dbm;
  }
  if (typeof p.firmware === "string" && system.firmware === undefined) {
    system.firmware = p.firmware;
  }
  if (typeof p.status === "string" && system.status === undefined) {
    system.status = p.status;
  }
  if (Object.keys(system).length > 0) {
    p.system = system;
  }

  delete p.location;
  delete p.firmware;
  delete p.status;

  return p;
}

export function parseTelemetry(raw: unknown): Telemetry | null {
  const normalized = normalizeTelemetryRaw(raw);
  const result = telemetrySchema.safeParse(normalized);
  return result.success ? result.data : null;
}

export function formatMetric(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(digits);
}
