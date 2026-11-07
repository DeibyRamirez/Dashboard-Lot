import type { ReactNode } from "react";
import { useRef } from "react";
import { config } from "../../lib/config";
import { pressBounce } from "../../lib/motion";
import { useTheme } from "../../lib/theme";
import { IconHome, IconMoon, IconRadio, IconSettings, IconSun } from "../ui/Icons";

type Props = {
  children: ReactNode;
  deviceOnline: boolean | null;
  systemStatus?: string;
  parseErrors: number;
};

export function DashboardLayout({ children, deviceOnline, systemStatus, parseErrors }: Props) {
  const { theme, toggle } = useTheme();
  const themeBtn = useRef<HTMLButtonElement>(null);

  return (
    <div className="min-h-screen bg-app md:flex">
      <aside
        className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-3 py-5 md:flex"
        aria-label="Navegación principal"
      >
        <div
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-xs font-extrabold text-white shadow-lift dark:text-[#06201c]"
          title="EMS-IoT"
        >
          EMS
        </div>
        <nav className="flex flex-col items-center gap-2 rounded-3xl border border-line bg-card p-2 shadow-soft">
          <NavIcon label="Panel" active icon={<IconHome />} />
          <NavIcon label="MQTT" icon={<IconRadio />} />
          <NavIcon label="Ajustes" icon={<IconSettings />} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="px-4 pt-5 sm:px-6 md:pl-2 md:pr-8 md:pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted">
                EMS-IoT <span aria-hidden>·</span> Aula 101 <span aria-hidden>·</span>{" "}
                <span className="text-ink">Panel operativo</span>
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-[30px]">
                Dashboard aula inteligente
              </h1>
              <p className="mt-1 text-xs text-muted">
                {config.deviceId} · {config.topicTelemetria} · actualiza cada{" "}
                {config.pollIntervalMs / 1000}s
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {systemStatus && (
                <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-strong">
                  {systemStatus === "OPERATIONAL" ? "Operativo" : systemStatus}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  deviceOnline
                    ? "bg-brand-soft text-brand-strong"
                    : deviceOnline === false
                      ? "bg-rose-soft text-ink"
                      : "bg-surface text-muted"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    deviceOnline ? "bg-brand" : deviceOnline === false ? "bg-coral" : "bg-muted"
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
                <span className="rounded-full bg-amber-soft px-3 py-1.5 text-xs font-semibold text-ink">
                  Errores de parseo: {parseErrors}
                </span>
              )}
              <button
                ref={themeBtn}
                type="button"
                onClick={() => {
                  pressBounce(themeBtn.current);
                  toggle();
                }}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-xs font-semibold text-ink shadow-soft transition-colors hover:bg-surface"
                aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              >
                {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 pt-5 sm:px-6 md:pl-2 md:pr-8">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ label, icon, active = false }: { label: string; icon: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200 ${
        active ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-surface hover:text-ink"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
    </button>
  );
}
