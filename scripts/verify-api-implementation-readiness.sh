#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify backend API implementation readiness

echo "[Phase 2] Verifying API implementation readiness..."

# Check that all required service files are specified
REQUIRED_ENDPOINTS=$(jq '[.endpoints[] | select(.status == "required")] | length' service-contracts.json)
ENDPOINTS_WITH_SERVICES=$(jq '[.endpoints[] | select(.status == "required" and .serviceContract.serviceFile != null)] | length' service-contracts.json)

if [[ $REQUIRED_ENDPOINTS -ne $ENDPOINTS_WITH_SERVICES ]]; then
  MISSING=$((REQUIRED_ENDPOINTS - ENDPOINTS_WITH_SERVICES))
  echo "[❌] $MISSING required endpoints missing service file specifications"
  exit 1
fi

# Verify route file specifications
ENDPOINTS_WITH_ROUTES=$(jq '[.endpoints[] | select(.status == "required" and .routeFile != null)] | length' service-contracts.json)

if [[ $REQUIRED_ENDPOINTS -ne $ENDPOINTS_WITH_ROUTES ]]; then
  MISSING=$((REQUIRED_ENDPOINTS - ENDPOINTS_WITH_ROUTES))
  echo "[❌] $MISSING required endpoints missing route file specifications"
  exit 1
fi

# Verify authentication middleware specifications
PROTECTED_ENDPOINTS=$(jq '[.endpoints[] | select(.status == "required" and .authentication == "jwt")] | length' service-contracts.json)

if [[ $PROTECTED_ENDPOINTS -gt 0 ]]; then
  echo "[✅] $PROTECTED_ENDPOINTS protected endpoints require authentication middleware"
fi

echo "[✅] API implementation readiness validated"
exit 0
