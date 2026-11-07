#!/bin/sh
set -e

mkdir -p /data/flows
SEED="/data/flows/seed-flows.json"
TARGET="/data/flows.json"
SETTINGS_SEED="/opt/nodered-settings/settings.js"
SETTINGS_TARGET="/data/settings.js"

is_true() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    true|1|yes) return 0 ;;
    *) return 1 ;;
  esac
}

if is_true "$SEED_ON_START"; then
  if [ -f "$SEED" ]; then
    echo "[entrypoint] SEED_ON_START: sobrescribiendo flujos desde semilla"
    cp "$SEED" "$TARGET"
  fi
  if [ -f "$SETTINGS_SEED" ]; then
    echo "[entrypoint] SEED_ON_START: sobrescribiendo settings"
    cp "$SETTINGS_SEED" "$SETTINGS_TARGET"
  fi
else
  if [ ! -f "$TARGET" ] && [ -f "$SEED" ]; then
    echo "[entrypoint] Copiando flujos semilla a $TARGET"
    cp "$SEED" "$TARGET"
  fi
  if [ ! -f "$SETTINGS_TARGET" ] && [ -f "$SETTINGS_SEED" ]; then
    echo "[entrypoint] Copiando settings a $SETTINGS_TARGET"
    cp "$SETTINGS_SEED" "$SETTINGS_TARGET"
  fi
fi

cd /usr/src/node-red && exec ./entrypoint.sh "$@"
