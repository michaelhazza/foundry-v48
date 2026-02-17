#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Verify all agent output dependencies exist

echo "[Phase 0] Verifying agent output dependencies..."

# Check Agent 1 output
if [[ ! -f "scope-manifest.json" ]]; then
  echo "[❌] Missing Agent 1 output: scope-manifest.json"
  exit 1
fi

# Check Agent 2 output
if [[ ! -f "env-manifest.json" ]]; then
  echo "[❌] Missing Agent 2 output: env-manifest.json"
  exit 1
fi

# Check Agent 3 output
if [[ ! -f "data-relationships.json" ]]; then
  echo "[❌] Missing Agent 3 output: data-relationships.json"
  exit 1
fi

# Check Agent 4 output
if [[ ! -f "service-contracts.json" ]]; then
  echo "[❌] Missing Agent 4 output: service-contracts.json"
  exit 1
fi

# Check Agent 5 output
if [[ ! -f "ui-api-deps.json" ]]; then
  echo "[❌] Missing Agent 5 output: ui-api-deps.json"
  exit 1
fi

echo "[✅] All agent dependencies present"
exit 0
