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

### Puerto

Render inyecta `PORT`; la imagen oficial Node-RED lo usa. Si el health check falla, revisa logs del contenedor.

## 2. Frontend en Vercel

Root del proyecto Vercel: **`web-redesign/web`** (no la raíz del monorepo).

**Git:** conecta el repo y en **Settings → Environments → Production → Branch Tracking** usa **`main`**. Los push a `develop` no generan deployment gracias a `git.deploymentEnabled` en [`vercel.json`](../web-redesign/web/vercel.json).

Variables de entorno de **build** (Production y Preview):

| Variable | Valor |
|----------|--------|
| `VITE_DATA_SOURCE` | `nodered-api` |
| `VITE_API_BASE` | `https://TU-SERVICIO.onrender.com/api` |
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
