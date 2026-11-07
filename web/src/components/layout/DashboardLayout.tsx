import type { ReactNode } from "react";
import { config } from "../../lib/config";

type Props = {
  children: ReactNode;
  deviceOnline: boolean | null;
  systemStatus?: string;
  parseErrors: number;
};

export function DashboardLayout({
  children,
  deviceOnline,
  systemStatus,
  parseErrors,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <aside
        className="hidden w-16 shrink-0 flex-col items-center gap-6 bg-[var(--sidebar-bg)] py-6 md:flex lg:w-[4.5rem]"
        aria-label="Navegación principal"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white"
          title="EMS-IoT"
        >
          EMS
        </div>
        <NavIcon label="Panel" active />
        <NavIcon label="MQTT" />
        <NavIcon label="Ajustes" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--card-border)] bg-white px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">
                EMS-IoT &gt; Aula 101 &gt;{" "}
                <span className="text-[var(--text-primary)]">
                  Panel operativo
                </span>
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
                Dashboard aula inteligente
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {systemStatus && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  {systemStatus}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${
                  deviceOnline
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    : deviceOnline === false
                      ? "bg-rose-50 text-rose-800 ring-rose-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    deviceOnline
                      ? "bg-emerald-500"
                      : deviceOnline === false
                        ? "bg-rose-500"
                        : "bg-slate-400"
                  }`}
                  aria-hidden
                />
                {deviceOnline === null
                  ? "Estado desconocido"
                  : deviceOnline
                    ? "En línea"
                    : "Sin señal reciente"}
              </span>
              {parseErrors > 0 && (
                <span className="text-xs text-amber-700">
                  Parseo: {parseErrors}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {config.deviceId} · {config.topicTelemetria} · poll{" "}
            {config.pollIntervalMs / 1000}s
          </p>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition ${
        active
          ? "bg-white/15 text-white"
          : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label.slice(0, 1)}
    </button>
  );
}
