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
import { useMqttTelemetry } from "./hooks/useMqttTelemetry";
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

  const emptyState = (
    <div className="rounded-lg border border-dashed border-[var(--card-border)] bg-white p-12 text-center text-[var(--text-muted)]">
      {connectionStatus === "waitingTelemetry" ? (
        <>
          La API responde pero aún no hay telemetría. Arranca Wokwi en el tópico
          configurado o revisa{" "}
          <code className="text-teal-700">/api/status</code>.
        </>
      ) : (
        <>
          Esperando primera telemetría desde Wokwi. Confirma que Node-RED tiene
          desplegada la pestaña <strong>API_Web</strong>.
        </>
      )}
    </div>
  );

  return (
    <DashboardLayout
      deviceOnline={deviceOnline}
      systemStatus={sys?.status}
      parseErrors={parseErrors}
    >
      <div className="mb-4 space-y-3">
        <ConnectionBanner status={connectionStatus} dataSource={dataSource} />
        <KpiStrip telemetry={telemetry} />
      </div>

      {!telemetry ? (
        emptyState
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <DashboardCard
              title="Temperatura ambiente"
              subtitle="Tensiómetro · contrato Wokwi"
              className="lg:col-span-3"
            >
              <SemiGauge
                title="Temperatura"
                value={m?.temperature_c}
                min={10}
                max={40}
                unit="°C"
                zones={TEMP_ZONES}
              />
            </DashboardCard>
            <DashboardCard
              title="Humedad relativa"
              subtitle="Tensiómetro · DHT"
              className="lg:col-span-3"
            >
              <SemiGauge
                title="Humedad"
                value={m?.humidity_rh_pct}
                min={0}
                max={100}
                unit="% RH"
                zones={HUM_ZONES}
              />
            </DashboardCard>
            <DashboardCard
              title="Conectividad"
              subtitle="system.rssi_dbm"
              className="lg:col-span-3"
            >
              <SignalDonut
                percent={rssiToPercent(sys?.rssi_dbm)}
                rssiDbm={sys?.rssi_dbm}
              />
            </DashboardCard>
            <DashboardCard
              title="Uso del aula"
              subtitle="Métrica de sesión"
              className="lg:col-span-3"
            >
              <OccupancyDonut
                percentOccupied={occupancyPercent(history)}
                currentlyOccupied={m?.occupancy ?? false}
              />
            </DashboardCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <DashboardCard
              title="Mapa de estados (sesión)"
              subtitle="Presencia, ventana y HVAC"
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
            subtitle="Últimas muestras en esta sesión"
          >
            <TelemetryBarChart history={history} />
          </DashboardCard>
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;
