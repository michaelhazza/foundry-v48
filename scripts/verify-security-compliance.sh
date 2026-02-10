#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify security compliance requirements

echo "[Phase 2] Verifying security compliance..."

# Verify JWT secret is required and secure
if ! jq -e '.variables[] | select(.name == "JWT_SECRET" and .required == true)' env-manifest.json > /dev/null; then
  echo "[❌] JWT_SECRET not properly configured"
  exit 1
fi

# Check password handling
if ! jq -e '.endpoints[] | select(.path == "/api/auth/register" and .serviceContract.returns.omitFields[] == "password")' service-contracts.json > /dev/null; then
  echo "[⚠️] Password field should be omitted from registration response"
fi

# Verify protected endpoints have authentication
UNPROTECTED_NON_AUTH=$(jq '[.endpoints[] | select(.status == "required" and .authentication == "none" and (.path | startswith("/api/auth") | not) and (.path != "/health"))] | length' service-contracts.json)

if [[ $UNPROTECTED_NON_AUTH -gt 0 ]]; then
  echo "[⚠️] $UNPROTECTED_NON_AUTH non-auth endpoints without authentication"
fi

# Check for RBAC specifications
ENDPOINTS_WITH_RBAC=$(jq '[.endpoints[] | select(.serviceContract.rbac != null)] | length' service-contracts.json)

echo "[ℹ️] $ENDPOINTS_WITH_RBAC endpoints have RBAC specifications"

# Verify soft-delete for data protection
TABLES_WITH_SOFT_DELETE=$(jq '[.tables[] | select(.softDeleteColumn != null)] | length' data-relationships.json)
TOTAL_TABLES=$(jq '.tables | length' data-relationships.json)

if [[ $TABLES_WITH_SOFT_DELETE -ne $TOTAL_TABLES ]]; then
  echo "[⚠️] Not all tables implement soft-delete pattern"
fi

echo "[✅] Security compliance requirements validated"
exit 0
