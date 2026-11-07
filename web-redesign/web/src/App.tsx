import { useEffect, useRef } from "react";
import { ConnectionBanner } from "./components/ConnectionBanner";
import { ControlPanel } from "./components/ControlPanel";
import { KpiStrip } from "./components/KpiStrip";
import { OccupancyDonut } from "./components/charts/OccupancyDonut";
import { SemiGauge, HUM_ZONES, TEMP_ZONES } from "./components/charts/SemiGauge";
import { SessionHeatmap } from "./components/charts/SessionHeatmap";
import { SignalDonut } from "./components/charts/SignalDonut";
import { TelemetryBarChart } from "./components/charts/TelemetryBarChart";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardCard } from "./components/ui/DashboardCard";
import { EmptyState } from "./components/ui/EmptyState";
import { IconChart, IconDrop, IconGrid, IconPlug, IconThermo, IconUsers, IconWifi } from "./components/ui/Icons";
import { useMqttTelemetry } from "./hooks/useMqttTelemetry";
import { initSmoothScroll, revealIn, softPop } from "./lib/motion";
import { occupancyPercent, rssiToPercent } from "./lib/telemetryHistory";

function App() {
  const {
    telemetry,
    history,
    connectionStatus,
    deviceOnline,
    lastCommand,
    parseErrors,
    setHvac,
    setAutoMode,
    dataSource,
  } = useMqttTelemetry();

  const hvacOn = telemetry?.actuators.hvac_power ?? false;
  const mode = telemetry?.actuators.mode ?? "AUTO";
  const m = telemetry?.metrics;
  const sys = telemetry?.system;
  const hasData = telemetry != null;

  const scope = useRef<HTMLDivElement>(null);
  const liveDot = useRef<HTMLSpanElement>(null);

  useEffect(() => initSmoothScroll(), []);

  // Entrance animation runs once per "has data" transition, never per tick.
  useEffect(() => {
    if (!scope.current) return;
    return revealIn(scope.current);
  }, [hasData]);

  // Tiny Anime.js pop on each new sample (single small element).
  useEffect(() => {
    softPop(liveDot.current);
  }, [telemetry?.timestamp, history.length]);

  const emptyState = (
    <EmptyState
      icon={<IconPlug className="h-7 w-7" />}
      title={
        connectionStatus === "waitingTelemetry"
          ? "Todo listo, solo falta la primera lectura"
          : "Esperando la primera telemetría"
      }
      text={
        connectionStatus === "waitingTelemetry" ? (
          <>
            La API responde pero aún no llegan datos. Arranca Wokwi en el tópico configurado o revisa{" "}
            <code className="rounded-md bg-surface px-1.5 py-0.5 text-brand-strong">/api/status</code>.
          </>
        ) : (
          <>
            Confirma que Node-RED tiene desplegada la pestaña <strong className="text-ink">API_Web</strong> y
            que la simulación de Wokwi está corriendo.
          </>
        )
      }
    >
      <ol className="mt-6 grid w-full max-w-lg gap-2 text-left text-sm sm:grid-cols-3">
        {["Wokwi publica", "MQTT transporta", "Node-RED expone /api"].map((s, i) => (
          <li key={s} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 text-ink">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </EmptyState>
  );

  return (
    <DashboardLayout deviceOnline={deviceOnline} systemStatus={sys?.status} parseErrors={parseErrors}>
      <div ref={scope}>
        <div className="mb-5 space-y-3">
          <ConnectionBanner status={connectionStatus} dataSource={dataSource} />
          <KpiStrip telemetry={telemetry} />
        </div>

        {!telemetry ? (
          emptyState
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
              <DashboardCard title="Temperatura" subtitle="Ambiente · sensor DHT" icon={<IconThermo />}>
                <SemiGauge title="Temperatura" value={m?.temperature_c} min={10} max={40} unit="°C" zones={TEMP_ZONES} />
              </DashboardCard>
              <DashboardCard title="Humedad relativa" subtitle="Ambiente · sensor DHT" icon={<IconDrop />}>
                <SemiGauge title="Humedad" value={m?.humidity_rh_pct} min={0} max={100} unit="% RH" zones={HUM_ZONES} />
              </DashboardCard>
              <DashboardCard title="Conectividad" subtitle="Calidad de la señal Wi‑Fi" icon={<IconWifi />}>
                <SignalDonut percent={rssiToPercent(sys?.rssi_dbm)} rssiDbm={sys?.rssi_dbm} />
              </DashboardCard>
              <DashboardCard title="Uso del aula" subtitle="Ocupación en la sesión" icon={<IconUsers />}>
                <OccupancyDonut percentOccupied={occupancyPercent(history)} currentlyOccupied={m?.occupancy ?? false} />
              </DashboardCard>
            </div>

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
              <DashboardCard
                title="Mapa de estados"
                subtitle="Presencia, ventana y HVAC en la sesión"
                icon={<IconGrid />}
                className="lg:col-span-8"
              >
                <SessionHeatmap history={history} />
              </DashboardCard>
              <div className="lg:col-span-4">
                <ControlPanel
                  hvacOn={hvacOn}
                  mode={mode}
                  lastCommand={lastCommand}
                  onToggleHvac={setHvac}
                  onSetAuto={setAutoMode}
                />
              </div>
            </div>

            <DashboardCard
              title="Historial ambiental"
              subtitle="Últimas muestras de esta sesión"
              icon={<IconChart />}
              action={
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                  <span ref={liveDot} className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  {history.length} muestras
                </span>
              }
            >
              <TelemetryBarChart history={history} />
            </DashboardCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default App;
