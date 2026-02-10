#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate framework constitutional requirements

echo "[Phase 1] Verifying constitution compliance..."

CONSTITUTION="agent-0-constitution.md"

if [[ ! -f "$CONSTITUTION" ]]; then
  echo "[❌] Constitution file not found"
  exit 1
fi

# Verify multi-tenant isolation
TENANT_CONTAINERS=$(jq '[.tables[] | select(.tenantKey == "container")] | length' data-relationships.json)

if [[ $TENANT_CONTAINERS -ne 1 ]]; then
  echo "[❌] Must have exactly 1 tenant container (found: $TENANT_CONTAINERS)"
  exit 1
fi

# Verify soft-delete patterns on all tables
TABLES_WITHOUT_SOFT_DELETE=$(jq '[.tables[] | select(.softDeleteColumn == null)] | length' data-relationships.json)

if [[ $TABLES_WITHOUT_SOFT_DELETE -gt 0 ]]; then
  echo "[❌] $TABLES_WITHOUT_SOFT_DELETE tables missing soft-delete columns"
  exit 1
fi

# Verify authentication requirements
UNPROTECTED_ENDPOINTS=$(jq '[.endpoints[] | select(.status == "required" and .authentication == "none" and (.path | startswith("/api/auth") | not))] | length' service-contracts.json)

if [[ $UNPROTECTED_ENDPOINTS -gt 0 ]]; then
  echo "[⚠️] $UNPROTECTED_ENDPOINTS non-auth endpoints without authentication"
fi

# Verify RBAC patterns
ENDPOINTS_WITHOUT_RBAC=$(jq '[.endpoints[] | select(.status == "required" and .authentication == "jwt" and .serviceContract.rbac == null)] | length' service-contracts.json)

if [[ $ENDPOINTS_WITHOUT_RBAC -gt 0 ]]; then
  echo "[⚠️] $ENDPOINTS_WITHOUT_RBAC protected endpoints without RBAC specifications"
fi

echo "[✅] Constitution compliance validated"
exit 0
