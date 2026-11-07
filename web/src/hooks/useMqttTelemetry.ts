import mqtt, { type MqttClient } from "mqtt";
import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../lib/config";
import {
  appendHistoryPoint,
  telemetryToHistoryPoint,
  type HistoryPoint,
} from "../lib/telemetryHistory";
import {
  createInitialSeedState,
  nextSeedTelemetry,
  type SeedState,
} from "../lib/seedGenerator";
import type { MqttCommand, Telemetry } from "../types/telemetry";
import { parseTelemetry } from "../types/telemetry";

export type ConnectionStatus =
  | "mock"
  | "connecting"
  | "connected"
  | "waitingTelemetry"
  | "disconnected"
  | "error";

export type { HistoryPoint };

export type UseMqttTelemetryResult = {
  telemetry: Telemetry | null;
  history: HistoryPoint[];
  connectionStatus: ConnectionStatus;
  deviceOnline: boolean | null;
  lastCommand: MqttCommand | null;
  parseErrors: number;
  setHvac: (on: boolean) => void;
  setAutoMode: () => void;
  dataSource: typeof config.dataSource;
};

function newCommandId(): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `CMD-${stamp}-${Math.floor(Math.random() * 1000)}`;
}

function buildHvacCommand(hvacPower: boolean): MqttCommand {
  return {
    command_id: newCommandId(),
    target_device: config.deviceId,
    action: "SET_ACTUATOR_STATE",
    hvac_power: hvacPower,
    reason: "MANUAL_OVERRIDE_DASHBOARD",
    override_priority: "MANUAL",
  };
}

function buildSetAutoCommand(): MqttCommand {
  return {
    command_id: newCommandId(),
    target_device: config.deviceId,
    action: "SET_AUTO",
  };
}

async function postComandoApi(
  body: Record<string, unknown>,
): Promise<MqttCommand> {
  const res = await fetch(`${config.apiBase}/comandos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const parsed = (await res.json()) as {
    ok?: boolean;
    command?: MqttCommand;
    error?: string;
  };
  if (!res.ok || !parsed.command) {
    throw new Error(parsed.error ?? `HTTP ${res.status}`);
  }
  return parsed.command;
}

export function useMqttTelemetry(): UseMqttTelemetryResult {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [deviceOnline, setDeviceOnline] = useState<boolean | null>(null);
  const [lastCommand, setLastCommand] = useState<MqttCommand | null>(null);
  const [parseErrors, setParseErrors] = useState(0);
  const clientRef = useRef<MqttClient | null>(null);
  const seedRef = useRef<SeedState>(createInitialSeedState());
  const lastMessageAt = useRef<number>(0);
  const lastTimestampRef = useRef<string | null>(null);

  const recordTelemetry = useCallback((parsed: Telemetry) => {
    const now = Date.now();
    lastMessageAt.current = now;
    seedRef.current = {
      ...seedRef.current,
      hvacPower: parsed.actuators.hvac_power,
      mode: parsed.actuators.mode ?? "AUTO",
    };
    setTelemetry(parsed);
    setHistory((prev) =>
      appendHistoryPoint(
        prev,
        telemetryToHistoryPoint(parsed, now),
        config.historyMaxPoints,
        lastTimestampRef.current,
        parsed.timestamp,
        config.pollIntervalMs,
      ),
    );
    lastTimestampRef.current = parsed.timestamp ?? null;
  }, []);

  const publishCommand = useCallback(
    async (body: Record<string, unknown>, mqttCmd: MqttCommand) => {
      if (config.dataSource === "mock") {
        setLastCommand(mqttCmd);
        return;
      }

      try {
        if (config.dataSource === "nodered-api") {
          const cmd = await postComandoApi(body);
          setLastCommand(cmd);
          return;
        }

        setLastCommand(mqttCmd);
        const client = clientRef.current;
        if (client?.connected) {
          client.publish(config.topicComandos, JSON.stringify(mqttCmd), {
            qos: 0,
          });
        }
      } catch {
        setConnectionStatus("error");
      }
    },
    [],
  );

  const setHvac = useCallback(
    async (on: boolean) => {
      seedRef.current = {
        ...seedRef.current,
        hvacPower: on,
        mode: "FORCED",
      };
      setTelemetry((prev) =>
        prev
          ? {
              ...prev,
              actuators: {
                ...prev.actuators,
                hvac_power: on,
                mode: "FORCED",
              },
            }
          : prev,
      );

      const cmd = buildHvacCommand(on);
      await publishCommand({ hvac_power: on }, cmd);
    },
    [publishCommand],
  );

  const setAutoMode = useCallback(async () => {
    seedRef.current = { ...seedRef.current, mode: "AUTO" };
    setTelemetry((prev) =>
      prev
        ? {
            ...prev,
            actuators: { ...prev.actuators, mode: "AUTO" },
          }
        : prev,
    );

    const cmd = buildSetAutoCommand();
    await publishCommand({ action: "SET_AUTO" }, cmd);
  }, [publishCommand]);

  useEffect(() => {
    if (config.dataSource === "mock") {
      setConnectionStatus("mock");
      const push = () => {
        const { telemetry: next, state } = nextSeedTelemetry(
          seedRef.current,
          config.deviceId,
        );
        seedRef.current = state;
        recordTelemetry(next);
        setDeviceOnline(true);
      };
      const interval = window.setInterval(push, config.pollIntervalMs);
      push();
      return () => window.clearInterval(interval);
    }

    if (config.dataSource === "nodered-api") {
      let cancelled = false;

      const poll = async () => {
        try {
          const res = await fetch(`${config.apiBase}/telemetry`);
          if (cancelled) return;
          if (!res.ok) {
            setConnectionStatus("error");
            return;
          }
          const raw = (await res.json()) as Record<string, unknown> & {
            ok?: boolean;
            waiting?: boolean;
            _meta?: { deviceOnline?: boolean; lastTelemetryAt?: number };
          };

          if (raw.waiting === true || raw.ok === false) {
            setConnectionStatus("waitingTelemetry");
            return;
          }

          setConnectionStatus("connected");
          const meta = raw._meta;
          delete raw._meta;
          delete raw.ok;
          delete raw.waiting;
          if (meta && typeof meta.deviceOnline === "boolean") {
            setDeviceOnline(meta.deviceOnline);
          }
          const parsed = parseTelemetry(raw);
          if (!parsed) {
            setParseErrors((n) => n + 1);
            return;
          }
          recordTelemetry(parsed);
          if (meta?.deviceOnline === undefined) {
            setDeviceOnline(true);
          }
        } catch {
          if (!cancelled) setConnectionStatus("error");
        }
      };

      setConnectionStatus("connecting");
      void poll();
      const interval = window.setInterval(poll, config.pollIntervalMs);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
      };
    }

    const clientId = `web-lot-${Math.random().toString(16).slice(2, 10)}`;
    setConnectionStatus("connecting");

    const client = mqtt.connect(config.mqttWsUrl, {
      clientId,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10_000,
    });
    clientRef.current = client;

    client.on("connect", () => {
      setConnectionStatus("connected");
      client.subscribe([config.topicTelemetria, config.topicEstado], {
        qos: 0,
      });
    });

    client.on("reconnect", () => setConnectionStatus("connecting"));
    client.on("close", () => setConnectionStatus("disconnected"));
    client.on("error", () => setConnectionStatus("error"));

    client.on("message", (topic, payload) => {
      const text = payload.toString();
      if (topic === config.topicEstado) {
        const lower = text.toLowerCase();
        setDeviceOnline(
          lower === "online" ||
            lower === "operational" ||
            text === "true" ||
            text === "1",
        );
        return;
      }

      if (topic !== config.topicTelemetria) return;

      try {
        const parsed = parseTelemetry(JSON.parse(text));
        if (!parsed) {
          setParseErrors((n) => n + 1);
          return;
        }
        recordTelemetry(parsed);
      } catch {
        setParseErrors((n) => n + 1);
      }
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, [recordTelemetry]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (config.dataSource !== "mqtt") return;
      if (!lastMessageAt.current) return;
      const stale = Date.now() - lastMessageAt.current > config.staleMs;
      if (stale && deviceOnline !== false) {
        setDeviceOnline(false);
      } else if (!stale && telemetry && deviceOnline === false) {
        setDeviceOnline(true);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [deviceOnline, telemetry]);

  return {
    telemetry,
    history,
    connectionStatus,
    deviceOnline,
    lastCommand,
    parseErrors,
    setHvac,
    setAutoMode,
    dataSource: config.dataSource,
  };
}
