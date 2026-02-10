#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate JSON schema compliance

echo "[Phase 1] Verifying JSON schema validity..."

# Validate all JSON files
JSON_FILES=(
  "scope-manifest.json"
  "env-manifest.json"
  "data-relationships.json"
  "service-contracts.json"
  "ui-api-deps.json"
)

INVALID_JSON=0

for file in "${JSON_FILES[@]}"; do
  if ! jq empty "$file" 2>/dev/null; then
    echo "[❌] Invalid JSON: $file"
    INVALID_JSON=$((INVALID_JSON + 1))
  fi
done

if [[ $INVALID_JSON -gt 0 ]]; then
  echo "[❌] $INVALID_JSON files have invalid JSON"
  exit 1
fi

# Verify required top-level keys
if ! jq -e '.requiredEntities' scope-manifest.json > /dev/null; then
  echo "[❌] scope-manifest.json missing requiredEntities"
  exit 1
fi

if ! jq -e '.tables' data-relationships.json > /dev/null; then
  echo "[❌] data-relationships.json missing tables"
  exit 1
fi

if ! jq -e '.endpoints' service-contracts.json > /dev/null; then
  echo "[❌] service-contracts.json missing endpoints"
  exit 1
fi

if ! jq -e '.pages' ui-api-deps.json > /dev/null; then
  echo "[❌] ui-api-deps.json missing pages"
  exit 1
fi

echo "[✅] JSON schema validity confirmed"
exit 0
