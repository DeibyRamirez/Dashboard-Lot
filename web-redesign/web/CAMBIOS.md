# CAMBIOS · Rediseño "amigable" del Dashboard LoT (web/)

Flujo IoT intacto: Wokwi → MQTT → Node-RED → web. **No se tocaron** `useMqttTelemetry.ts`, `config.ts`, `seedGenerator.ts`, `telemetryHistory.ts` ni `types/telemetry.ts` (lógica MQTT/API, esquemas zod y tipos). Las props públicas de todos los componentes se mantienen (solo se añadieron props opcionales: `icon` en `DashboardCard`, `label` en las zonas del gauge).

## Paleta
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--accent` (marca) | `#0d9488` | `#2dd4bf` | teal original conservado: presencia, temperatura, toggles |
| `--accent-strong` | `#0f766e` | `#5eead4` | texto de marca (AA sobre blanco) |
| `--accent-soft` | `#d5f5ef` | teal 14 % | fondos de pills/iconos |
| `--sky` | `#3b82f6` | `#60a5fa` | humedad, ventana, modo demo |
| `--amber` | `#f59e0b` | `#fbbf24` | HVAC, avisos |
| `--coral` | `#f97362` | `#fb8a7b` | errores/señal débil (suave, no rojo puro) |
| `--app-bg` / `--card-bg` | `#f5f8f7` / `#ffffff` | `#0b1514` / `#12201e` | fondo / tarjetas |
| `--text-primary` / `--text-muted` | `#10201d` / `#566a66` | `#e7f2ef` / `#9fb4af` | texto (≥ 4.5:1) |
Zonas del gauge: `#fcd34d` (bajo) · `#34d399` (confort) · `#fb923c`/`#60a5fa` (alto temp./hum.).

## Cambios visuales
- Tarjetas `rounded-3xl` (24 px), iconos en squircles de 16 px, pills (`rounded-full`) para badges, chips y botones; sombras suaves de dos capas; sin separadores duros.
- Tipografía **Plus Jakarta Sans Variable** autoalojada (`@fontsource-variable/plus-jakarta-sans`), copiada a `public/fonts` por `scripts/copy-fonts.mjs` (hook `predev`/`prebuild`) y precargada en `index.html` con `rel=preload` + **`fetchpriority="high"`** (Priority Hints) y `font-display: swap`.
- Jerarquía: título 30 px bold, valores 26–28 px bold, metadatos en gris; textos de estado humanos ("Confortable", "Ideal", "Señal débil", "Libre ahora").
- **Tema claro por defecto + oscuro opcional** (botón pill en la cabecera; respeta `prefers-color-scheme`, se guarda en `localStorage`, se aplica antes del primer pintado).
- Chart.js reestilizado (`lib/chartTheme.ts` lee los tokens CSS): barras redondeadas (`borderRadius 8`, grosor máx. 18), rejilla tenue solo en Y, leyenda con puntos, tooltip redondeado con la fuente; donuts con extremos redondeados (`RingDonut` compartido); gauge con segmentos redondeados y separados, aguja de punta redonda con anillo del color de la tarjeta.
- Mapa de estados: se eliminó la fila vacía, un color por fila, celdas `rounded-lg`, estado actual bajo cada etiqueta y leyenda.
- Control HVAC: interruptor real (`role="switch"`), modo en pill, "Volver a modo automático", JSON del último comando dentro de `<details>`.
- Estados vacíos y de conexión amables: banner con punto "vivo", texto + pista de qué hacer; estado vacío con icono y pasos Wokwi → MQTT → Node-RED.
- Grid mobile-first: 1 col → 2 (`sm`) → 4 (`xl`) para KPIs; 8/4 en `lg` para mapa/control; sidebar flotante solo desde `md`.
- `lang="es"`, título y meta description, `theme-color`, `robots.txt`. Eliminado `App.css` (restos de la plantilla Vite).

## Movimiento (stack obligatorio)
- **Tailwind v4** (ya estaba) con tokens vía `@theme inline` y variante `dark` por `data-theme`.
- **GSAP**: entrada escalonada de tarjetas (`[data-reveal]`, solo `transform`/`opacity`, una vez cuando llega la primera telemetría, no en cada tick) y `AnimatedNumber` (tween de 0,7 s solo cuando cambia el valor).
- **Lenis**: scroll suave sincronizado con `gsap.ticker`.
- **Anime.js v4**: micro-interacciones (rebote de escala al pulsar switch/botones, "pop" del punto de muestras en cada dato nuevo; un solo elemento pequeño).
- **prefers-reduced-motion**: desactiva Lenis, GSAP, Anime.js, animaciones de Chart.js (duración 0) y el pulso CSS.
- Chart.js: animación de actualización reducida a 450 ms.
- **Three.js: no se usó.** Un dashboard de telemetría no gana legibilidad con 3D; añadiría ~150 KB gzip, coste de GPU en móviles y riesgo de accesibilidad sin aportar información.

## Verificación
- `npm run build` OK (tsc + vite).
- Lighthouse móvil (vite preview, modo demo):
  - Antes: Perf 88 · A11y 100 · BP 100 · SEO 82 · LCP 2.3 s · TBT 260 ms · CLS 0.104
  - Después: Perf 91 · A11y 100 · BP 100 · SEO 91 · LCP 2.7 s · TBT 170 ms · CLS 0.004
- Capturas en `../shots/` (antes, después claro/oscuro, estado sin conexión) y video en `../video/dashlot-redesign.mp4`.

## Cómo ejecutarlo
```bash
cd web
cp .env.example .env          # Windows: copy .env.example .env
npm install                   # o pnpm install
npm run dev                   # http://localhost:5173 (proxy /api → Node-RED :1880)
# Sin broker / sin Node-RED: pon VITE_USE_MOCK=true en .env (datos semilla tipo Wokwi)
npm run build && npm run preview
```
Docker/nginx no cambian. Dependencias nuevas: `gsap`, `lenis`, `animejs`, `@fontsource-variable/plus-jakarta-sans`.

## Advertencias
- El zip original no traía `.env.example`; se creó uno con las variables del README (por defecto `VITE_USE_MOCK=false`).
- El bundle JS sigue siendo un único chunk (~313 KB gzip, antes ~264 KB) por Chart.js + mqtt + las librerías de animación; podría dividirse con `import()` si hiciera falta.
- Solo se precarga el subconjunto latino de la fuente (suficiente para español).
- `pnpm-lock.yaml` no se regeneró; `package-lock.json` sí. Ejecuta `pnpm install` si usas pnpm.
