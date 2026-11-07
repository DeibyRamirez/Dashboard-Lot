#!/bin/sh
set -e

mkdir -p /data/flows
SEED="/data/flows/seed-flows.json"
TARGET="/data/flows.json"

if [ ! -f "$TARGET" ] && [ -f "$SEED" ]; then
  echo "[entrypoint] Copiando flujos semilla a $TARGET"
  cp "$SEED" "$TARGET"
fi

SETTINGS_SEED="/opt/nodered-settings/settings.js"
SETTINGS_TARGET="/data/settings.js"
if [ ! -f "$SETTINGS_TARGET" ] && [ -f "$SETTINGS_SEED" ]; then
  echo "[entrypoint] Copiando settings a $SETTINGS_TARGET"
  cp "$SETTINGS_SEED" "$SETTINGS_TARGET"
fi

cd /usr/src/node-red && exec ./entrypoint.sh "$@"
