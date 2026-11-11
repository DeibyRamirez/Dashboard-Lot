export type DataSource = "nodered-api" | "mqtt" | "mock";

/** Servicio Node-RED en Render (`render.yaml` → dashboard-lot-nodered). */
export const DEFAULT_PROD_API_BASE =
  "https://dashboard-lot-nodered.onrender.com/api";

function readDataSource(): DataSource {
  if (import.meta.env.VITE_USE_MOCK === "true") return "mock";
  const raw = import.meta.env.VITE_DATA_SOURCE ?? "nodered-api";
  return raw === "mqtt" ? "mqtt" : "nodered-api";
}

function resolveApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/$/, "");
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv;
  if (import.meta.env.PROD && typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (!isLocal && (fromEnv === "/api" || fromEnv === "")) {
      return DEFAULT_PROD_API_BASE;
    }
  }
  return fromEnv || "/api";
}

export const config = {
  dataSource: readDataSource(),
  apiBase: resolveApiBase(),
  mqttWsUrl:
    import.meta.env.VITE_MQTT_WS_URL ?? "ws://broker.hivemq.com:8000/mqtt",
  topicTelemetria:
    import.meta.env.VITE_MQTT_TOPIC_TELEMETRIA ?? "aula/grupoX/telemetria",
  topicEstado:
    import.meta.env.VITE_MQTT_TOPIC_ESTADO ?? "aula/grupoX/estado",
  topicComandos:
    import.meta.env.VITE_MQTT_TOPIC_COMANDOS ?? "aula/grupoX/comandos",
  deviceId: import.meta.env.VITE_DEVICE_ID ?? "ESP32-AULA-101",
  useMock: import.meta.env.VITE_USE_MOCK === "true",
  pollIntervalMs: Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 5000),
  historyMaxPoints: Number(import.meta.env.VITE_HISTORY_MAX_POINTS ?? 60),
  staleMs: 15_000,
};
