#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify authentication implementation readiness

echo "[Phase 2] Verifying authentication implementation..."

# Verify JWT secret is required
if ! jq -e '.variables[] | select(.name == "JWT_SECRET" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] JWT_SECRET not marked as required"
  exit 1
fi

# Verify auth endpoints exist
AUTH_ENDPOINTS=(
  "POST:/api/auth/register"
  "POST:/api/auth/login"
  "POST:/api/auth/refresh"
)

MISSING_AUTH=0

for endpoint in "${AUTH_ENDPOINTS[@]}"; do
  METHOD="${endpoint%%:*}"
  PATH="${endpoint#*:}"
  
  if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$PATH\")" service-contracts.json > /dev/null; then
    echo "[⚠️] Missing authentication endpoint: $METHOD $PATH"
    MISSING_AUTH=$((MISSING_AUTH + 1))
  fi
done

# Verify protected endpoints have JWT authentication
PROTECTED_COUNT=$(jq '[.endpoints[] | select(.authentication == "jwt")] | length' service-contracts.json)

if [[ $PROTECTED_COUNT -eq 0 ]]; then
  echo "[⚠️] No endpoints configured with JWT authentication"
fi

# Verify login and register pages exist
if ! jq -e '.pages[] | select(.routePath == "/login")' ui-api-deps.json > /dev/null; then
  echo "[❌] Login page not defined"
  exit 1
fi

if ! jq -e '.pages[] | select(.routePath == "/register")' ui-api-deps.json > /dev/null; then
  echo "[❌] Register page not defined"
  exit 1
fi

echo "[✅] Authentication implementation validated"
exit 0
