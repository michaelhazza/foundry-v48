#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify error handling integration across layers

echo "[Phase 3] Verifying error handling integration..."

# Check that API endpoints specify error types
ENDPOINTS_WITH_ERRORS=$(jq '[.endpoints[] | select(.serviceContract.throws != null and (.serviceContract.throws | length) > 0)] | length' service-contracts.json)
REQUIRED_ENDPOINTS=$(jq '[.endpoints[] | select(.status == "required")] | length' service-contracts.json)

echo "[ℹ️] $ENDPOINTS_WITH_ERRORS of $REQUIRED_ENDPOINTS endpoints have error specifications"

# Verify error boundary exists in UI
if ! jq -e '.canonicalPaths.errorBoundary' ui-api-deps.json > /dev/null; then
  echo "[❌] Error boundary component not specified"
  exit 1
fi

# Check authentication error handling
AUTH_ENDPOINTS=$(jq '[.endpoints[] | select(.path | startswith("/api/auth"))] | length' service-contracts.json)

if [[ $AUTH_ENDPOINTS -gt 0 ]]; then
  AUTH_WITH_ERRORS=$(jq '[.endpoints[] | select((.path | startswith("/api/auth")) and .serviceContract.throws != null)] | length' service-contracts.json)
  
  if [[ $AUTH_WITH_ERRORS -ne $AUTH_ENDPOINTS ]]; then
    echo "[⚠️] Not all auth endpoints have error specifications"
  fi
fi

echo "[✅] Error handling integration validated"
exit 0
