#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify deployment pipeline integration

echo "[Phase 3] Verifying deployment integration..."

# Verify all required environment variables are documented
REQUIRED_ENV_VARS=$(jq '[.variables[] | select(.required == true)] | length' env-manifest.json)

if [[ $REQUIRED_ENV_VARS -eq 0 ]]; then
  echo "[❌] No required environment variables documented"
  exit 1
fi

echo "[ℹ️] $REQUIRED_ENV_VARS required environment variables need deployment configuration"

# Check health check endpoint for deployment verification
if jq -e '.scopeExceptions[] | select(.path == "/health")' scope-manifest.json > /dev/null; then
  echo "[✅] Health check endpoint available for deployment verification"
else
  echo "[⚠️] No health check endpoint for deployment verification"
fi

# Verify database migration readiness
TABLE_COUNT=$(jq '.tables | length' data-relationships.json)

echo "[ℹ️] $TABLE_COUNT tables require migration scripts for deployment"

# Check for production-ready error handling
ENDPOINTS_WITH_ERRORS=$(jq '[.endpoints[] | select(.serviceContract.throws != null)] | length' service-contracts.json)

echo "[ℹ️] $ENDPOINTS_WITH_ERRORS endpoints have error specifications for production monitoring"

# Verify authentication is production-ready
if ! jq -e '.variables[] | select(.name == "JWT_SECRET" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] JWT_SECRET not properly configured for production"
  exit 1
fi

echo "[✅] Deployment integration requirements validated"
exit 0
