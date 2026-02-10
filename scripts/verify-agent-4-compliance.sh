#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 4 API contract compliance

echo "[Phase 1] Verifying Agent 4 (API Contract) compliance..."

API_CONTRACT="service-contracts.json"

# Verify file exists and is valid JSON
if ! jq empty "$API_CONTRACT" 2>/dev/null; then
  echo "[❌] Invalid JSON in $API_CONTRACT"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$API_CONTRACT")
if [[ "$SCHEMA" != "service-contracts-v2" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: service-contracts-v2)"
  exit 1
fi

# Verify required endpoints exist
REQUIRED_ENDPOINTS=(
  "POST:/api/auth/register"
  "POST:/api/auth/login"
  "GET:/api/organisations"
  "POST:/api/organisations"
  "GET:/api/projects"
  "POST:/api/projects"
  "GET:/api/sources"
  "POST:/api/sources"
  "POST:/api/jobs"
  "GET:/api/datasets"
)

for endpoint in "${REQUIRED_ENDPOINTS[@]}"; do
  METHOD="${endpoint%%:*}"
  PATH="${endpoint#*:}"
  
  if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$PATH\")" "$API_CONTRACT" > /dev/null; then
    echo "[❌] Missing required endpoint: $METHOD $PATH"
    exit 1
  fi
done

# Verify authentication patterns
ENDPOINT_COUNT=$(jq '.endpoints | length' "$API_CONTRACT")
ENDPOINTS_WITHOUT_AUTH_SPEC=0

for ((i=0; i<ENDPOINT_COUNT; i++)); do
  PATH=$(jq -r ".endpoints[$i].path" "$API_CONTRACT")
  
  if ! jq -e ".endpoints[$i].authentication" "$API_CONTRACT" > /dev/null; then
    echo "[⚠️] Endpoint $PATH missing authentication specification"
    ENDPOINTS_WITHOUT_AUTH_SPEC=$((ENDPOINTS_WITHOUT_AUTH_SPEC + 1))
  fi
done

if [[ $ENDPOINTS_WITHOUT_AUTH_SPEC -gt 0 ]]; then
  echo "[❌] $ENDPOINTS_WITHOUT_AUTH_SPEC endpoints missing authentication specs"
  exit 1
fi

# Verify service contract structure
MISSING_SERVICE_CONTRACTS=0

for ((i=0; i<ENDPOINT_COUNT; i++)); do
  PATH=$(jq -r ".endpoints[$i].path" "$API_CONTRACT")
  STATUS=$(jq -r ".endpoints[$i].status" "$API_CONTRACT")
  
  if [[ "$STATUS" == "required" ]]; then
    if ! jq -e ".endpoints[$i].serviceContract.serviceFile" "$API_CONTRACT" > /dev/null; then
      echo "[⚠️] Required endpoint $PATH missing serviceFile"
      MISSING_SERVICE_CONTRACTS=$((MISSING_SERVICE_CONTRACTS + 1))
    fi
    
    if ! jq -e ".endpoints[$i].serviceContract.methodName" "$API_CONTRACT" > /dev/null; then
      echo "[⚠️] Required endpoint $PATH missing methodName"
      MISSING_SERVICE_CONTRACTS=$((MISSING_SERVICE_CONTRACTS + 1))
    fi
  fi
done

if [[ $MISSING_SERVICE_CONTRACTS -gt 0 ]]; then
  echo "[❌] $MISSING_SERVICE_CONTRACTS endpoints have incomplete service contracts"
  exit 1
fi

echo "[✅] Agent 4 compliance validated"
exit 0
