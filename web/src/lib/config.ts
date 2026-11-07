export type DataSource = "nodered-api" | "mqtt" | "mock";

function readDataSource(): DataSource {
  if (import.meta.env.VITE_USE_MOCK === "true") return "mock";
  const raw = import.meta.env.VITE_DATA_SOURCE ?? "nodered-api";
  return raw === "mqtt" ? "mqtt" : "nodered-api";
}

export const config = {
  dataSource: readDataSource(),
  apiBase: import.meta.env.VITE_API_BASE ?? "/api",
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
