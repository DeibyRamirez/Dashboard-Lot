# Configuración Node-RED — EMS Smart Class

Guía para entender o replicar manualmente los flujos importados desde [`nodered/flows/flows.json`](../nodered/flows/flows.json).

## Flujo manual vs dashboard web (puente HTTP)

Si tienes **Flow 1** (`MQTT in` → `debug`) y la web en `:8080`:

1. **Import** [`nodered/flows/flows.json`](../nodered/flows/flows.json) y **Deploy** (necesitas la pestaña **`API_Web`**).
2. `docker compose up -d --build web`
3. Wokwi publicando en `aula/grupoX/telemetria` → en ~5 s la web muestra KPIs.

| Objetivo | Qué hacer |
|----------|----------|
| Ver JSON en Node-RED | Tu flujo manual + Debug |
| Ver KPIs en la web | API `GET /api/telemetry` vía `:8080/api/...` |
| Comandos desde la web | `POST /api/comandos` con `{ "hvac_power": true }` |
| Gauges en Node-RED | Pestañas del `flows.json` + `:1880/ui` |

Verificación:

```powershell
curl http://localhost:1880/api/telemetry
curl http://localhost:8080/api/telemetry
```

## Pestaña **API_Web**

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/telemetry` | Último JSON en `global.telemetry` (**200** con `waiting: true` si aún no hay mensajes) |
| GET | `/api/status` | `{ hasTelemetry, lastTelemetryAt, deviceOnline }` — diagnóstico rápido |
| POST | `/api/comandos` | Body `{ "hvac_power": true \| false }` → publica en MQTT comandos |
| OPTIONS | `/api/*` | CORS preflight |

Nodos clave:

- **mqtt in** telemetría → **storeForWeb** → `global.set("telemetry", …)`
- **http in** GET → **getTelemetry** → **http response**
- **http in** POST → **postComandos** → **mqtt out** + **http response**

### Flow 1 manual: alimentar la API (persistForWeb)

Si tu flujo de prueba es `MQTT in` → `debug` y ves JSON en Debug pero la web sigue en “esperando telemetría”, añade un nodo **function** entre el `mqtt in` y el `debug`:

1. Duplica la salida del `MQTT in`: una a **function** `persistForWeb`, otra al `debug`.
2. Pega en la function el mismo código que **storeForWeb** (pestaña API_Web) o importa de nuevo `flows.json`.
3. **Deploy**.

Sin esto, Debug y `/api/telemetry` no comparten `global.telemetry` a menos que otra pestaña (Telemetria/API) reciba el mismo topic.

### Sin Wokwi (internet inestable)

1. Pestaña **Simulador_Semilla** → inject **Sim ON** → **Deploy**.
2. Espera ~5 s y prueba:

```powershell
curl.exe http://localhost:8080/api/status
curl.exe http://localhost:8080/api/telemetry
```

## 1. Broker MQTT (config node)

| Campo | Valor |
|-------|--------|
| Server | `broker.hivemq.com` |
| Port | `1883` |
| Protocol | MQTT v3.1.1 |
| Client ID | `nodered-lot-dashboard` (cámbialo si hay desconexiones) |
| Auto connect | Sí |
| Clean session | Sí |

No uses TLS en este broker público para el puerto 1883.

## 2. Pestaña **Telemetria**

### mqtt in — `telemetria JSON`

- **Topic:** `aula/grupoX/telemetria`
- **Output:** *a parsed JSON object*
- **QoS:** 0

Salidas conectadas a:

1. **function `normalizeTelemetry`** — valida `metrics`, rellena defaults (`location`, lux, corriente, ventana, etc.) y guarda en `flow.telemetry` / `global.telemetry`.
2. **link out `to dashboard`** — envía el mismo mensaje a la pestaña del dashboard.
3. **debug `TX telemetría`** — sidebar para verificación.

### mqtt in — `estado / LWT`

- **Topic:** `aula/grupoX/estado`
- **Output:** auto-detect

Conectado a **function `deviceOnline`**, que interpreta payloads `online`, `offline`, `OPERATIONAL` o booleanos y alimenta el **ui_led** en el dashboard.

## 3. Pestaña **Simulador_Semilla** (deshabilitada por defecto)

| Nodo | Función |
|------|---------|
| **inject Init sim flags** (once) | Lee `SEED_SIMULATOR` del entorno Docker y activa `flow.simulatorEnabled`. Default **`false`**. |
| **inject Sim ON / Sim OFF** | Control manual del simulador. |
| **inject cada 5s** | Disparo periódico (igual que Wokwi). |
| **function buildSeedPayload** | Genera JSON demo (solo pruebas sin Wokwi). Respeta `flow.hvacState` tras comandos. |
| **mqtt out publicar telemetria** | Publica en `aula/grupoX/telemetria`. |

Si `flow.simulatorEnabled === false`, `buildSeedPayload` no emite mensajes.

Variables de entorno del contenedor (ver `.env.example`):

- `SEED_SIMULATOR=false` por defecto; `true` solo para demo
- `DEVICE_ID=ESP32-AULA-101`

## 4. Pestaña **Comandos_y_Dashboard**

### link in `from telemetry`

Recibe telemetría desde la pestaña **Telemetria** y la envía a **function `fanOutDashboard`** (7 salidas, solo métricas Wokwi):

| Salida | Widget |
|--------|--------|
| 1–2 | ui_gauge temperatura, humedad |
| 3–5 | ui_text presencia, ventana, estado HVAC |
| 6 | ui_text modo + RSSI + status |
| 7 | ui_switch HVAC (solo actualización visual; `decouple: true`) |

### ui_switch HVAC → buildCommand → mqtt out

**function `buildCommand`** construye:

```json
{
  "command_id": "CMD-<timestamp>-<random>",
  "target_device": "ESP32-AULA-101",
  "action": "SET_ACTUATOR_STATE",
  "hvac_power": true,
  "reason": "MANUAL_OVERRIDE_DASHBOARD",
  "override_priority": "MANUAL"
}
```

**mqtt out `comandos`:** topic `aula/grupoX/comandos`, payload JSON, QoS 0.

**debug `CMD enviado`:** confirma publicación en el sidebar.

### Dashboard UI

- **Site:** EMS Smart Class — ruta `/ui`
- **Tab:** Aula 101
- **Grupos:** Métricas ambientales, Estado del aula, Control HVAC, Conectividad

Tema oscuro con acentos cyan (alineado al dashboard web).

## 5. Checklist de comunicación bidireccional

1. **ESP32 → Node-RED:** Debug muestra payload en telemetría; gauges en `/ui` se mueven.
2. **ESP32 → Web:** Misma telemetría en http://localhost:8080 (WebSocket al broker).
3. **Dashboard → ESP32:** Toggle HVAC; Debug muestra comando; MQTT Explorer en `aula/grupoX/comandos`; serial Wokwi (si el firmware suscribe comandos).
4. **LWT:** Al desconectar el ESP32, publicación en `estado` y LED rojo en Node-RED.

## 6. Importar / resetear flujos

1. Menú **≡ → Import** → pegar contenido de `flows.json` → **Deploy**.
2. Para reset de fábrica con Docker: eliminar volumen `nodered_data` y `docker compose up -d` de nuevo (el entrypoint copia la semilla).

## 7. Paletas instaladas en la imagen Docker

- `node-red-dashboard` — widgets `/ui`
- `node-red-contrib-ui-led` — LED de conectividad

Se instalan en el [`Dockerfile`](../nodered/Dockerfile); no hace falta **Manage palette** manual salvo que agregues nodos extra.
