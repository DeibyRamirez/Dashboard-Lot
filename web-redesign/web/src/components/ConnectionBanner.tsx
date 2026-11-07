import type { ConnectionStatus } from "../hooks/useMqttTelemetry";
import type { DataSource } from "../lib/config";

const labels: Record<
  ConnectionStatus,
  Partial<Record<DataSource, string>> & { default: string }
> = {
  connecting: {
    default: "Conectando…",
    mqtt: "Conectando al broker MQTT…",
    "nodered-api": "Conectando con Node-RED…",
  },
  connected: {
    default: "Conectado",
    mqtt: "Conectado al broker MQTT (HiveMQ)",
    "nodered-api": "Conectado vía Node-RED (puente HTTP)",
  },
  waitingTelemetry: {
    default: "Esperando telemetría MQTT…",
    "nodered-api": "Node-RED responde — esperando datos de Wokwi",
    mqtt: "MQTT conectado — esperando el primer mensaje",
  },
  disconnected: {
    default: "Sin conexión — reintentando",
    mqtt: "MQTT desconectado — reintentando",
    "nodered-api": "La API no responde — reintentando",
  },
  error: {
    default: "No pudimos conectar",
    mqtt: "No pudimos conectar con el broker MQTT",
    "nodered-api": "No pudimos contactar a Node-RED (/api)",
  },
  mock: { default: "Modo demo · datos simulados tipo Wokwi" },
};

const hints: Partial<Record<ConnectionStatus, string>> = {
  connecting: "Esto suele tardar unos segundos.",
  waitingTelemetry: "Arranca la simulación en Wokwi para ver datos.",
  disconnected: "Seguimos intentando automáticamente.",
  error: "Revisa que Node-RED esté en :1880 o activa VITE_USE_MOCK.",
  mock: "Sin broker: la interfaz usa el generador de semillas.",
};

const tone: Record<ConnectionStatus, { wrap: string; dot: string; pulse: boolean }> = {
  connecting: { wrap: "bg-amber-soft", dot: "bg-amber", pulse: true },
  connected: { wrap: "bg-brand-soft", dot: "bg-brand", pulse: true },
  waitingTelemetry: { wrap: "bg-amber-soft", dot: "bg-amber", pulse: true },
  disconnected: { wrap: "bg-rose-soft", dot: "bg-coral", pulse: false },
  error: { wrap: "bg-rose-soft", dot: "bg-coral", pulse: false },
  mock: { wrap: "bg-sky-soft", dot: "bg-sky", pulse: true },
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
      : (entry[dataSource === "mock" ? "nodered-api" : dataSource] ?? entry.default);
  const t = tone[status];

  return (
    <div
      data-reveal
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-sm text-ink ${t.wrap}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        {t.pulse && <span className={`live-ping absolute inset-0 rounded-full ${t.dot}`} />}
        <span className={`relative h-2.5 w-2.5 rounded-full ${t.dot}`} />
      </span>
      <span className="font-semibold">{text}</span>
      {hints[status] && <span className="text-muted">{hints[status]}</span>}
    </div>
  );
}
