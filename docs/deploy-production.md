# Producción: Vercel (frontend) + Render (Node-RED)

Flujo recomendado: **Render primero** → URL de la API → **Vercel** con `VITE_API_BASE`. **Wokwi** no se despliega; solo se ejecuta en wokwi.com.

## Arquitectura

```
Wokwi ──MQTT──► broker.hivemq.com ◄── Node-RED (Render)
                                          │ GET/POST /api/*
                                          ▼
Usuario ──HTTPS──► Dashboard (Vercel, web-redesign/web)
```

## Ramas (producción)

| Rama | Render | Vercel |
|------|--------|--------|
| `main` | Auto-deploy del servicio (Blueprint enlazado a `main`) | Production deployment |
| `develop` | No usar para prod; servicio fijado a `main` en `render.yaml` | Sin auto-deploy (`develop: false` en `vercel.json`) |

Solo los cambios mergeados en **`main`** deben desplegar producción.

## 1. Backend en Render

1. Push a **`main`** (incluye [`render.yaml`](../render.yaml) con `branch: main`).
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → repo `Dashboard-Lot`.
3. En **Branch**, elige **`main`** (no `develop`) → Blueprint path `render.yaml`.
4. Confirmar el servicio `dashboard-lot-nodered` y variables del blueprint.
5. Esperar build Docker y health check en `/api/status`.
6. Si el Blueprint ya existía con otra rama: **Blueprint → Settings** y **servicio → Build & Deploy** → branch **`main`**, luego **Sync Blueprint**.
7. Copiar la URL pública, por ejemplo `https://dashboard-lot-nodered.onrender.com`.

### Comprobaciones

```powershell
curl.exe https://TU-SERVICIO.onrender.com/api/status
curl.exe https://TU-SERVICIO.onrender.com/api/telemetry
```

Sin Wokwi, `/api/telemetry` puede responder `waiting: true` — normal.

### Plan free

El servicio se duerme tras inactividad. Antes de una demo, despiértalo:

```powershell
curl.exe https://TU-SERVICIO.onrender.com/api/status
```

### Disco persistente (opcional)

En planes con disco, monta `/data` para conservar cambios del editor Node-RED. Los flujos **API_Web** ya van en la imagen (`nodered/flows/flows.json` → seed en el entrypoint).

### Puerto y bind (Render)

Render inyecta `PORT` (habitualmente `10000`). Node-RED debe usar `HOST=0.0.0.0` (definido en [`render.yaml`](../render.yaml)) y [`nodered/settings.js`](../nodered/settings.js) copiado a `/data` en el arranque.

### Troubleshooting: `Deploy timed out`

El build Docker **no** es el problema: el fallo es `==> Timed Out` porque Render no recibe **HTTP 2xx** en `GET /api/status` durante el despliegue.

| Síntoma en logs | Causa habitual | Qué hacer |
|-----------------|----------------|-----------|
| Build OK pero `==> Timed Out` | Health check sin 2xx | Ver filas siguientes |
| Copia `settings` pero **no** copia `flujos semilla` | `/data/flows.json` ya existía (disco en `/data`) sin pestaña **API_Web** → `/api/status` 404 | `SEED_ON_START=true` en Render o quita el disco persistente |
| `SEED_ON_START: sobrescribiendo flujos` en logs | Comportamiento correcto en prod | Debe pasar health check |
| `Server now running at http://127.0.0.1:10000/` | Suele ser mensaje cosmético; revisa `curl /api/status` | `settings.js` con `uiHost: "0.0.0.0"` |
| Tras fix, deploy Live | — | `curl .../api/status` |

1. En Render, variable **`SEED_ON_START=true`** (en [`render.yaml`](../render.yaml)) fuerza flows + settings del repo en cada arranque.
2. **Manual Deploy** tras push a `main`; en logs busca las dos líneas `SEED_ON_START: sobrescribiendo...`.
3. Si tienes **disco persistente** en `/data` y no usas `SEED_ON_START`, elimina el disco o borra `flows.json` / `settings.js` viejos.
4. Si `/api/status` responde 200 en el navegador pero el deploy falla, revisa **Settings → Health Check Path** = `/api/status`.

## 2. Frontend en Vercel

Root del proyecto Vercel: **`web-redesign/web`** (no la raíz del monorepo).

**Git:** conecta el repo y en **Settings → Environments → Production → Branch Tracking** usa **`main`**. Los push a `develop` no generan deployment gracias a `git.deploymentEnabled` en [`vercel.json`](../web-redesign/web/vercel.json).

Variables de entorno de **build** (Production y Preview):

| Variable | Valor |
|----------|--------|
| `VITE_DATA_SOURCE` | `nodered-api` |
| `VITE_API_BASE` | Opcional si el servicio Render se llama `dashboard-lot-nodered` (el frontend usa esa URL por defecto en producción). Si renombraste el servicio, pon `https://TU-SERVICIO.onrender.com/api`. También puedes dejar `/api` y usar el proxy en `vercel.json`. |
| `VITE_USE_MOCK` | `false` |
| `VITE_DEVICE_ID` | `ESP32-AULA-101` |
| `VITE_MQTT_TOPIC_*` | Igual que [`.env.example`](../web-redesign/web/.env.example) |
| `VITE_POLL_INTERVAL_MS` | `5000` |

`vercel.json` en esa carpeta define SPA fallback y build Vite.

### CLI (desarrollo)

```powershell
cd web-redesign/web
vercel link
vercel env add VITE_API_BASE production
vercel --prod
```

Si Render aún no existe: despliegue temporal con `VITE_USE_MOCK=true`, luego redeploy con API real.

### Tres nombres distintos (SEED / MOCK)

Confundir estos nombres hace pensar que “semilla” = datos falsos en pantalla. **No es así.**

| Variable | Plataforma | ¿Genera telemetría falsa? | Producción recomendada |
|----------|------------|---------------------------|-------------------------|
| **`SEED_ON_START`** | Render | **No.** Solo copia `flows.json` y `settings.js` del repo al arrancar. | `true` (deploy estable con `/api/status`) |
| **`SEED_SIMULATOR`** | Render / Node-RED | **Sí.** Activa pestaña **Simulador_Semilla** y publica MQTT sintético. | `false` |
| **`VITE_USE_MOCK`** | Vercel (build) | **Sí.** El navegador usa [`seedGenerator`](../web-redesign/web/src/lib/seedGenerator.ts) sin llamar a la API. | `false` cuando Render esté Live |

Datos **reales**: `VITE_USE_MOCK=false`, `SEED_SIMULATOR=false`, **`SEED_ON_START`** puede quedar `true`, **Wokwi** en Play y `VITE_API_BASE` apuntando a `https://TU-SERVICIO.onrender.com/api`.

### Señales en el dashboard

| Banner / estado | Causa |
|---------------|--------|
| Modo demo / mock | `VITE_USE_MOCK=true` en el último build de Vercel → redeploy con `false` |
| Node-RED — esperando Wokwi | Correcto con API real y sin telemetría aún |
| KPIs sin Wokwi | Revisa `SEED_SIMULATOR` o simulador manual en editor Node-RED |

## 3. Wokwi

1. Arranca la simulación en Wokwi (mismos tópicos `aula/grupoX/...`).
2. Verifica telemetría en Render: `curl .../api/telemetry`.
3. Abre la URL de Vercel; en ~5 s deberían aparecer KPIs.

## 4. Checklist final

| Paso | OK si |
|------|--------|
| Render | `GET /api/status` → 200 JSON |
| Vercel | Build correcto; sin CORS errors en consola |
| Wokwi ON | Dashboard muestra datos |
| HVAC | Toggle envía comando (firmware suscrito a comandos) |

## Referencia local

Desarrollo con Docker sigue en el [README principal](../README.md) (`docker compose up`).
