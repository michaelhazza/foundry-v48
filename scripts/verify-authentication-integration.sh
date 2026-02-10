#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify authentication integration across layers

echo "[Phase 3] Verifying authentication integration..."

# Verify auth endpoints are connected to auth pages
if jq -e '.pages[] | select(.routePath == "/login" and (.apiCalls[] | select(.path == "/api/auth/login")))' ui-api-deps.json > /dev/null; then
  echo "[✅] Login page connected to auth endpoint"
else
  echo "[❌] Login page not properly connected to auth endpoint"
  exit 1
fi

if jq -e '.pages[] | select(.routePath == "/register" and (.apiCalls[] | select(.path == "/api/auth/register")))' ui-api-deps.json > /dev/null; then
  echo "[✅] Register page connected to auth endpoint"
else
  echo "[❌] Register page not properly connected to auth endpoint"
  exit 1
fi

# Verify protected routes configuration
if ! jq -e '.routingConfig.protectedRoutes.wrapper' ui-api-deps.json > /dev/null; then
  echo "[❌] Protected routes wrapper not configured"
  exit 1
fi

# Verify JWT authentication on protected endpoints
PROTECTED_ENDPOINTS=$(jq '[.endpoints[] | select(.authentication == "jwt")] | length' service-contracts.json)

if [[ $PROTECTED_ENDPOINTS -eq 0 ]]; then
  echo "[⚠️] No endpoints configured with JWT authentication"
fi

# Verify users table exists for authentication
if ! jq -e '.tables[] | select(.name == "users")' data-relationships.json > /dev/null; then
  echo "[❌] Users table not found in data model"
  exit 1
fi

echo "[✅] Authentication integration validated"
exit 0
