#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify deployment configuration readiness

echo "[Phase 2] Verifying deployment readiness..."

# Verify environment configuration
REQUIRED_ENV_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "NODE_ENV"
  "PORT"
)

MISSING_ENV=0

for var in "${REQUIRED_ENV_VARS[@]}"; do
  if ! jq -e ".variables[] | select(.name == \"$var\")" env-manifest.json > /dev/null; then
    echo "[❌] Missing required environment variable: $var"
    MISSING_ENV=$((MISSING_ENV + 1))
  fi
done

if [[ $MISSING_ENV -gt 0 ]]; then
  echo "[❌] $MISSING_ENV required environment variables not configured"
  exit 1
fi

# Verify database connection configuration
if ! jq -e '.variables[] | select(.name == "DATABASE_URL" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] DATABASE_URL not marked as required"
  exit 1
fi

# Verify health check endpoint
if ! jq -e '.scopeExceptions[] | select(.path == "/health" and .method == "GET")' scope-manifest.json > /dev/null; then
  echo "[⚠️] Health check endpoint not defined"
fi

echo "[✅] Deployment readiness validated"
exit 0
