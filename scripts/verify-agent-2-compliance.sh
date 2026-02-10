#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 2 system architecture compliance

echo "[Phase 1] Verifying Agent 2 (System Architecture) compliance..."

ENV_MANIFEST="env-manifest.json"

# Verify file exists and is valid JSON
if ! jq empty "$ENV_MANIFEST" 2>/dev/null; then
  echo "[❌] Invalid JSON in $ENV_MANIFEST"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$ENV_MANIFEST")
if [[ "$SCHEMA" != "env-manifest-v1" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: env-manifest-v1)"
  exit 1
fi

# Verify required environment variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "NODE_ENV"
  "PORT"
)

for var in "${REQUIRED_VARS[@]}"; do
  if ! jq -e ".variables[] | select(.name == \"$var\")" "$ENV_MANIFEST" > /dev/null; then
    echo "[❌] Missing required environment variable: $var"
    exit 1
  fi
done

# Verify each variable has required structure
VAR_COUNT=$(jq '.variables | length' "$ENV_MANIFEST")
INVALID_VARS=0

for ((i=0; i<VAR_COUNT; i++)); do
  NAME=$(jq -r ".variables[$i].name" "$ENV_MANIFEST")
  
  # Check required fields
  if ! jq -e ".variables[$i].required" "$ENV_MANIFEST" > /dev/null; then
    echo "[⚠️] Variable $NAME missing 'required' field"
    INVALID_VARS=$((INVALID_VARS + 1))
  fi
  
  if ! jq -e ".variables[$i].purpose" "$ENV_MANIFEST" > /dev/null; then
    echo "[⚠️] Variable $NAME missing 'purpose' field"
    INVALID_VARS=$((INVALID_VARS + 1))
  fi
done

if [[ $INVALID_VARS -gt 0 ]]; then
  echo "[❌] $INVALID_VARS variables have invalid structure"
  exit 1
fi

echo "[✅] Agent 2 compliance validated"
exit 0
