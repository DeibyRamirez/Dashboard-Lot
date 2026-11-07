// Copies the self-hosted Fontsource woff2 into /public so index.html can
// preload it with a stable URL and Priority Hints (fetchpriority="high").
import { copyFileSync, mkdirSync } from "node:fs";
const src =
  "node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
mkdirSync("public/fonts", { recursive: true });
copyFileSync(src, "public/fonts/plus-jakarta-sans-latin-wght-normal.woff2");
