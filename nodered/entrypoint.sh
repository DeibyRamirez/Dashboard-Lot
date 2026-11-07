#!/bin/sh
set -e

mkdir -p /data/flows
SEED="/data/flows/seed-flows.json"
TARGET="/data/flows.json"

if [ ! -f "$TARGET" ] && [ -f "$SEED" ]; then
  echo "[entrypoint] Copiando flujos semilla a $TARGET"
  cp "$SEED" "$TARGET"
fi

cd /usr/src/node-red && exec ./entrypoint.sh "$@"
