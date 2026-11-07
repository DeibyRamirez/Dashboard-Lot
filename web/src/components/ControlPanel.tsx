import type { MqttCommand } from "../types/telemetry";
import { config } from "../lib/config";
import { DashboardCard } from "./ui/DashboardCard";

type Props = {
  hvacOn: boolean;
  mode: "AUTO" | "FORCED";
  lastCommand: MqttCommand | null;
  onToggleHvac: (on: boolean) => void;
  onSetAuto: () => void;
};

export function ControlPanel({
  hvacOn,
  mode,
  lastCommand,
  onToggleHvac,
  onSetAuto,
}: Props) {
  return (
    <DashboardCard
      title="Control HVAC"
      subtitle={`Comandos → ${config.topicComandos}`}
    >
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Modo actual:{" "}
        <span className="font-semibold text-[var(--text-primary)]">{mode}</span>
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={hvacOn}
        onClick={() => onToggleHvac(!hvacOn)}
        className={`mb-3 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
          hvacOn
            ? "border-teal-300 bg-teal-50"
            : "border-[var(--card-border)] bg-slate-50"
        }`}
      >
        <span className="text-sm font-medium">HVAC (forzado)</span>
        <span
          className={`font-mono text-xs uppercase ${
            hvacOn ? "text-teal-700" : "text-slate-500"
          }`}
        >
          {hvacOn ? "Encendido" : "Apagado"}
        </span>
      </button>
      <button
        type="button"
        onClick={onSetAuto}
        disabled={mode === "AUTO"}
        className="w-full rounded-lg border border-[var(--card-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Modo automático (SET_AUTO)
      </button>
      {lastCommand && (
        <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-slate-900 p-3 text-[10px] text-slate-100">
          {JSON.stringify(lastCommand, null, 2)}
        </pre>
      )}
    </DashboardCard>
  );
}
