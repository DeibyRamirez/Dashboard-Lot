import { useRef } from "react";
import type { MqttCommand } from "../types/telemetry";
import { config } from "../lib/config";
import { pressBounce } from "../lib/motion";
import { DashboardCard } from "./ui/DashboardCard";
import { IconFan } from "./ui/Icons";

type Props = {
  hvacOn: boolean;
  mode: "AUTO" | "FORCED";
  lastCommand: MqttCommand | null;
  onToggleHvac: (on: boolean) => void;
  onSetAuto: () => void;
};

export function ControlPanel({ hvacOn, mode, lastCommand, onToggleHvac, onSetAuto }: Props) {
  const switchRef = useRef<HTMLButtonElement>(null);
  const autoRef = useRef<HTMLButtonElement>(null);

  return (
    <DashboardCard
      title="Control HVAC"
      subtitle={`Comandos → ${config.topicComandos}`}
      icon={<IconFan />}
      className="h-full"
    >
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
        <span className="text-sm text-muted">Modo actual</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
            mode === "AUTO" ? "bg-brand-soft text-brand-strong" : "bg-amber-soft text-ink"
          }`}
        >
          {mode === "AUTO" ? "Automático" : "Forzado"}
        </span>
      </div>

      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={hvacOn}
        onClick={() => {
          pressBounce(switchRef.current);
          onToggleHvac(!hvacOn);
        }}
        className={`mb-3 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-300 ${
          hvacOn ? "border-transparent bg-brand-soft" : "border-line bg-card hover:bg-surface"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-ink">Climatización</span>
          <span className="block text-xs text-muted">
            {hvacOn ? "Encendido (forzado)" : "Apagado"}
          </span>
        </span>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
            hvacOn ? "bg-brand" : "bg-track"
          }`}
          aria-hidden
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
              hvacOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>

      <button
        ref={autoRef}
        type="button"
        onClick={() => {
          pressBounce(autoRef.current);
          onSetAuto();
        }}
        disabled={mode === "AUTO"}
        className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink"
      >
        Volver a modo automático
      </button>

      {lastCommand ? (
        <details className="mt-4 rounded-2xl bg-surface px-4 py-3 text-xs">
          <summary className="cursor-pointer font-semibold text-ink">
            Último comando enviado · {lastCommand.action}
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto text-[11px] leading-relaxed text-muted">
            {JSON.stringify(lastCommand, null, 2)}
          </pre>
        </details>
      ) : (
        <p className="mt-4 text-center text-xs text-muted">Aún no has enviado comandos.</p>
      )}
    </DashboardCard>
  );
}
