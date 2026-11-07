# Dashboard LoT — EMS Smart Class

Telemetría y control MQTT para el nodo **ESP32-AULA-101** (Wokwi / MicroPython), con **Node-RED** en Docker y **dashboard web** React. La operación normal usa **solo telemetría Wokwi** (simulador semilla desactivado por defecto).

## Arquitectura

```
ESP32 (Wokwi) ──► broker.hivemq.com ◄── Node-RED (MQTT :1883) ──► Debug / API /ui
                                        │
                    nginx :8080/api ────┘ (poll HTTP cada 5s)
                                        │
                              Dashboard web React (:8080)
```

### Puente HTTP (modo por defecto: `VITE_DATA_SOURCE=nodered-api`)

Muchas redes **bloquean WebSocket** saliente a `broker.hivemq.com:8000` (ver consola del navegador). Node-RED sí recibe MQTT por **TCP 1883**, por eso el Debug funciona y la web no.

| Cliente | Cómo obtiene datos |
|---------|-------------------|
| Node-RED | MQTT in → `global.telemetry` + **GET `/api/telemetry`** |
| Dashboard web | **GET** `http://localhost:8080/api/telemetry` (nginx → Node-RED) |
| Comandos HVAC | **POST** `/api/comandos` → Node-RED → mqtt out `aula/grupoX/comandos` |

**Importante:** despliega la pestaña **`API_Web`** del repo: menú **Import** → [`nodered/flows/flows.json`](nodered/flows/flows.json) → **Deploy** (o merge manual de esa pestaña).

Modo alternativo `VITE_DATA_SOURCE=mqtt`: WebSocket directo al broker (solo si tu red lo permite).

| Tópico | Dirección | Contenido |
|--------|-----------|-----------|
| `aula/grupoX/telemetria` | Dispositivo → cloud | JSON de telemetría |
| `aula/grupoX/estado` | LWT / online | `online` / `offline` |
| `aula/grupoX/comandos` | Dashboard → dispositivo | `SET_ACTUATOR_STATE` (hvac) o `SET_AUTO` |

## Producción (Vercel + Render)

Frontend: **`web-redesign/web`** en Vercel; backend Node-RED en Render ([`render.yaml`](render.yaml)). **Solo la rama `main`** despliega producción en ambas plataformas. Detalle: [docs/deploy-production.md](docs/deploy-production.md).

## Requisitos

- Docker Desktop (Compose v2)
- Node.js 20+ (solo si desarrollas la web en local con `npm run dev`)

## Inicio rápido

1. Copia variables de entorno:

   ```powershell
   copy .env.example .env
   ```

2. Levanta los servicios:

   ```powershell
   docker compose up -d --build
   ```

3. Abre:

   - **Node-RED editor:** http://localhost:1880  
   - **Node-RED Dashboard:** http://localhost:1880/ui  
   - **Dashboard web:** http://localhost:8080  

4. Arranca **Wokwi** con el firmware del aula; Node-RED recibe MQTT y la web hace poll cada `VITE_POLL_INTERVAL_MS` (default 5 s). Revisa la pestaña **Debug** en Node-RED.

> **Simulador semilla:** con `SEED_SIMULATOR=true` y la pestaña **Simulador_Semilla** habilitada, Node-RED publica datos de demo cada 5 s. Por defecto está **OFF** — ver [docs/wokwi-firmware.md](docs/wokwi-firmware.md).

> **Nota:** Los flujos semilla se copian a `/data/flows.json` solo la **primera vez** (volumen vacío). Si ya desplegaste Node-RED antes, importa manualmente [`nodered/flows/flows.json`](nodered/flows/flows.json) desde el menú **Import** o borra el volumen `nodered_data`.

## Desarrollo de la web en local

```powershell
cd web
copy ..\.env.example .env
npm install
npm run dev
```

| Modo | Comando | URL |
|------|---------|-----|
| Docker | `docker compose up -d` | http://localhost:8080 |
| Dev local | `cd web` → `npm run dev` | http://localhost:5173 |

Variables útiles en `.env`:

| Variable | Descripción |
|----------|-------------|
| `VITE_DATA_SOURCE` | `nodered-api` (default) o `mqtt` |
| `VITE_API_BASE` | Prefijo API, default `/api` |
| `VITE_MQTT_WS_URL` | Solo si `VITE_DATA_SOURCE=mqtt` |
| `VITE_USE_MOCK` | `true` = datos Wokwi-like sin broker (solo UI dev) |
| `VITE_POLL_INTERVAL_MS` | Intervalo poll HTTP (default `5000`) |
| `SEED_SIMULATOR` | `false` por defecto; `true` solo para demo en Node-RED |

## Esquema JSON (telemetría Wokwi)

Campos principales: `device_id`, `grupo`, `timestamp`, `uptime_s`, `metrics` (ocupación, ventana, temperatura/humedad nullable), `actuators` (`hvac_power`, `mode`: `AUTO` | `FORCED`), `system` (`rssi_dbm`, `firmware`, `status`). Sin lux/corriente/potencia salvo que los añadas en firmware.

Detalle, cadencia y comandos: [docs/wokwi-firmware.md](docs/wokwi-firmware.md).

Comando HVAC (publicado en `aula/grupoX/comandos`):

```json
{
  "command_id": "CMD-20261029143000-042",
  "target_device": "ESP32-AULA-101",
  "action": "SET_ACTUATOR_STATE",
  "hvac_power": false
}
```

Modo automático (restaura política local en el ESP32):

```json
{
  "command_id": "CMD-20261029143000-099",
  "target_device": "ESP32-AULA-101",
  "action": "SET_AUTO"
}
```

## Verificación bidireccional

| Paso | Comprobación |
|------|----------------|
| 1 | `docker compose ps` → `lot-nodered` healthy |
| 2 | Debug en Node-RED muestra JSON Wokwi cada ~5 s (o tu `PUBLISH_PERIOD_S`) |
| 3 | http://localhost:1880/ui → gauges actualizados |
| 4 | http://localhost:8080 → banner **Conectado vía Node-RED API** + KPIs |
| 4b | `curl http://localhost:8080/api/telemetry` → JSON (404 hasta que llegue Wokwi/simulador) |
| 5 | Toggle HVAC (web o Node-RED) → Debug **CMD enviado** y mensaje en `aula/grupoX/comandos` |
| 6 | Wokwi activo → `SEED_SIMULATOR=false` y simulador deshabilitado; serial `[TX]` = API |
| 7 | Toggle HVAC + **SET_AUTO** en web → `[CMD]` en Wokwi |
| 8 | Detén Wokwi → mensaje en `aula/grupoX/estado` → badge offline |

Herramienta recomendada: [MQTT Explorer](https://mqtt-explorer.com/) suscrito a `aula/grupoX/#`.

### Problemas frecuentes

- **Client ID duplicado:** usa IDs únicos en ESP32, Node-RED y navegador (ya configurado con prefijos distintos).
- **Web sin datos con Debug OK:** pestaña **API_Web** + Wokwi publicando; `curl.exe http://localhost:8080/api/status`.
- **404 en `/api/telemetry` (antiguo):** tras actualizar flows, la API devuelve **200** con `waiting: true` — no es fallo de ruta.
- **Web sin datos:** firewall bloqueando WebSocket 8000 → usa `VITE_DATA_SOURCE=nodered-api` (default).
- **Dos fuentes en el mismo tópico:** no ejecutes simulador y Wokwi a la vez en `grupoX` salvo pruebas controladas.
- **Flujos viejos en volumen:** `docker volume rm dashboardlot_nodered_data` (ajusta el nombre con `docker volume ls`) y vuelve a `compose up`.

## Documentación Node-RED

Detalle nodo a nodo: [docs/node-red-setup.md](docs/node-red-setup.md). Contrato firmware: [docs/wokwi-firmware.md](docs/wokwi-firmware.md).

## Estructura del repo

```
docker-compose.yml
.env.example
nodered/          # Dockerfile, flows, entrypoint
web/              # React + Vite + Tailwind
docs/
```
