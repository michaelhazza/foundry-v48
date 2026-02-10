#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify environment configuration integration

echo "[Phase 3] Verifying configuration integration..."

# Cross-check required environment variables are documented
ENV_VAR_COUNT=$(jq '.variables | length' env-manifest.json)
REQUIRED_VAR_COUNT=$(jq '[.variables[] | select(.required == true)] | length' env-manifest.json)

echo "[ℹ️] $REQUIRED_VAR_COUNT of $ENV_VAR_COUNT environment variables are required"

# Verify database configuration
if ! jq -e '.variables[] | select(.name == "DATABASE_URL" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] DATABASE_URL not properly configured as required"
  exit 1
fi

# Verify JWT configuration
if ! jq -e '.variables[] | select(.name == "JWT_SECRET" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] JWT_SECRET not properly configured as required"
  exit 1
fi

# Check for environment-specific variables
ENV_VARS_WITH_ENV=$(jq '[.variables[] | select(.purpose | contains("environment") or contains("mode"))] | length' env-manifest.json)

echo "[ℹ️] $ENV_VARS_WITH_ENV environment-specific configuration variables"

echo "[✅] Configuration integration validated"
exit 0
