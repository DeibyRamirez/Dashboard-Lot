import type { ConnectionStatus } from "../hooks/useMqttTelemetry";
import type { DataSource } from "../lib/config";

const labels: Record<
  ConnectionStatus,
  Partial<Record<DataSource, string>> & { default: string }
> = {
  connecting: {
    default: "Conectando…",
    mqtt: "Conectando al broker MQTT…",
    "nodered-api": "Conectando a Node-RED API…",
  },
  connected: {
    default: "Conectado",
    mqtt: "MQTT conectado (HiveMQ)",
    "nodered-api": "Conectado vía Node-RED API (puente HTTP)",
  },
  waitingTelemetry: {
    default: "Esperando telemetría MQTT…",
    "nodered-api":
      "API Node-RED OK — esperando datos de Wokwi en el tópico configurado",
    mqtt: "MQTT conectado — esperando primer mensaje",
  },
  disconnected: {
    default: "Desconectado — reintentando",
    mqtt: "MQTT desconectado — reintentando",
    "nodered-api": "API no disponible — reintentando",
  },
  error: {
    default: "Error de conexión",
    mqtt: "Error de conexión MQTT",
    "nodered-api": "Error al contactar Node-RED (/api)",
  },
  mock: { default: "Modo demo local (VITE_USE_MOCK)" },
};

const colors: Record<ConnectionStatus, string> = {
  connecting: "border-amber-200 bg-amber-50 text-amber-900",
  connected: "border-emerald-200 bg-emerald-50 text-emerald-900",
  waitingTelemetry: "border-amber-200 bg-amber-50 text-amber-900",
  disconnected: "border-rose-200 bg-rose-50 text-rose-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  mock: "border-violet-200 bg-violet-50 text-violet-900",
};

type Props = {
  status: ConnectionStatus;
  dataSource: DataSource;
};

export function ConnectionBanner({ status, dataSource }: Props) {
  const entry = labels[status];
  const text =
    status === "mock"
      ? entry.default
      : (entry[dataSource === "mock" ? "nodered-api" : dataSource] ??
        entry.default);

  return (
    <div
      className={`rounded-md border px-4 py-2 text-sm ${colors[status]}`}
      role="status"
    >
      {text}
    </div>
  );
}
