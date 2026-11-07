# Firmware Wokwi (MicroPython) — contrato MQTT

Este dashboard y Node-RED están alineados con el JSON que publica `construir_telemetria()` en el simulador ESP32. **No se rellenan** lux, corriente ni potencia si el firmware no los envía.

## Telemetría (`aula/grupoX/telemetria`)

```json
{
  "device_id": "ESP32-AULA-101",
  "grupo": "grupoX",
  "timestamp": "2026-10-29T18:00:00Z",
  "uptime_s": 123,
  "metrics": {
    "occupancy": true,
    "contact_window_open": false,
    "temperature_c": 24.0,
    "humidity_rh_pct": 55.0
  },
  "actuators": {
    "hvac_power": true,
    "mode": "AUTO"
  },
  "system": {
    "rssi_dbm": -80,
    "firmware": "wokwi-micropython-v1.27.0",
    "status": "OPERATIONAL"
  }
}
```

| Campo | Notas |
|-------|--------|
| `temperature_c` / `humidity_rh_pct` | Pueden ser `null` si el DHT falla al arranque |
| `actuators.mode` | `AUTO` (política local) o `FORCED` (override por comando) |
| `system.*` | RSSI y metadatos del nodo; no mezclar con telemetría inventada |

Campos **opcionales** si amplías el diagrama Wokwi:

- `metrics.illuminance_lux` — sensor BH1750
- `metrics.current_ac_amps` / `metrics.active_power_watts` — ACS712 / INA219
- `location` — constante en firmware si la necesitas en UI

## Cadencia de publicación

En firmware:

```python
PUBLISH_PERIOD_S = 5  # bajar a 1–2 para actualizaciones más frecuentes
```

En la web (poll HTTP vía Node-RED):

```env
VITE_POLL_INTERVAL_MS=5000
```

Alinea el poll con `PUBLISH_PERIOD_S` (mismo orden de magnitud). Valores muy bajos (< 1 s) pueden saturar broker público o CPU en Wokwi.

El **keepalive** MQTT (`KEEPALIVE_S`) controla LWT/offline, no la cadencia de telemetría.

## Comandos (`aula/grupoX/comandos`)

El handler `on_command` acepta:

1. **Toggle HVAC forzado** — `hvac_power` en la raíz **o** en `parameters`:

```json
{
  "command_id": "CMD-20261029143000-042",
  "target_device": "ESP32-AULA-101",
  "action": "SET_ACTUATOR_STATE",
  "hvac_power": false
}
```

2. **Volver a política local** — acción `SET_AUTO`:

```json
{
  "command_id": "CMD-20261029143000-099",
  "target_device": "ESP32-AULA-101",
  "action": "SET_AUTO"
}
```

El dashboard web publica ambos vía `POST /api/comandos` (Node-RED → MQTT out).

## Operación recomendada

1. **Wokwi ON**, simulador Node-RED **OFF** (`SEED_SIMULATOR=false`, pestaña Simulador_Semilla deshabilitada).
2. Verifica consola Wokwi `[TX]` y `curl http://localhost:8080/api/telemetry` — mismos campos.
3. Toggle HVAC → `[CMD]` en serial; botón **Modo automático** → `SET_AUTO` y `mode: AUTO` en la siguiente telemetría.

## Simulador semilla (solo demos)

Para datos sintéticos sin ESP32:

- `.env`: `SEED_SIMULATOR=true`
- En Node-RED: habilitar pestaña **Simulador_Semilla** y **Deploy**

No uses simulador y Wokwi en el mismo tópico salvo pruebas controladas.
