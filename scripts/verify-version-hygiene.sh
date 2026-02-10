#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate version reference standards

echo "[Phase 1] Verifying version hygiene..."

# Check scope-manifest schema version
SCOPE_SCHEMA=$(jq -r '."$schema"' scope-manifest.json)
if [[ "$SCOPE_SCHEMA" != "scope-manifest-v6" ]]; then
  echo "[❌] Incorrect scope-manifest schema version: $SCOPE_SCHEMA"
  exit 1
fi

# Check data-relationships schema version
DATA_SCHEMA=$(jq -r '."$schema"' data-relationships.json)
if [[ "$DATA_SCHEMA" != "data-relationships-v2" ]]; then
  echo "[❌] Incorrect data-relationships schema version: $DATA_SCHEMA"
  exit 1
fi

# Check service-contracts schema version
API_SCHEMA=$(jq -r '."$schema"' service-contracts.json)
if [[ "$API_SCHEMA" != "service-contracts-v2" ]]; then
  echo "[❌] Incorrect service-contracts schema version: $API_SCHEMA"
  exit 1
fi

# Check ui-api-deps schema version
UI_SCHEMA=$(jq -r '."$schema"' ui-api-deps.json)
if [[ "$UI_SCHEMA" != "ui-api-deps-v2" ]]; then
  echo "[❌] Incorrect ui-api-deps schema version: $UI_SCHEMA"
  exit 1
fi

# Check env-manifest schema version
ENV_SCHEMA=$(jq -r '."$schema"' env-manifest.json)
if [[ "$ENV_SCHEMA" != "env-manifest-v1" ]]; then
  echo "[❌] Incorrect env-manifest schema version: $ENV_SCHEMA"
  exit 1
fi

echo "[✅] Version hygiene validated"
exit 0
