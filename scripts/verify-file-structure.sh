#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Verify expected project structure exists

echo "[Phase 0] Verifying project file structure..."

# Check required directories
REQUIRED_DIRS=(
  "server"
  "server/db"
  "server/db/schema"
  "server/routes"
  "server/services"
  "server/middleware"
  "client"
  "client/src"
  "client/src/pages"
  "client/src/components"
  "client/src/lib"
  "docs"
  "scripts"
)

MISSING_DIRS=0
for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "[⚠️] Missing directory: $dir"
    MISSING_DIRS=$((MISSING_DIRS + 1))
  fi
done

if [[ $MISSING_DIRS -gt 0 ]]; then
  echo "[❌] $MISSING_DIRS required directories missing"
  exit 1
fi

echo "[✅] Project structure validated"
exit 0
