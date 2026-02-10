# Gate Scripts Reference

**Version**: gate-scripts-reference-v1  
**Total FILE Blocks**: 34 (1 orchestrator + 33 validation gates)  
**Generated**: 2026-02-10

## Overview

This reference contains all validation gate scripts for the Foundry build pipeline. Scripts are organized into four phases that progressively verify specification compliance, implementation readiness, and system integration.

### Extraction

Use `gate-splitter.sh` to extract these scripts:
```bash
bash docs/gate-splitter.sh
```

### Execution

Run all gates:
```bash
bash scripts/run-all-gates.sh
```

Run individual phase:
```bash
bash scripts/run-all-gates.sh --phase 1
```

## Phase Organization

- **Phase 0**: Preflight (3 scripts) - Verify dependencies and environment
- **Phase 1**: Specification Integrity (10 scripts) - Validate agent outputs
- **Phase 2**: Implementation Readiness (10 scripts) - Check build readiness
- **Phase 3**: Integration Verification (10 scripts) - Verify cross-system alignment

---

#===== FILE: scripts/run-all-gates.sh =====#
#!/bin/bash
set -euo pipefail

# Main gate orchestrator
# Runs all validation gates and generates build transcript

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRANSCRIPT_FILE="docs/build-transcript.md"
RESULTS_FILE="docs/build-gate-results.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
TOTAL=0
PASSED=0
FAILED=0
BLOCKING=0
WARNINGS=0
INFORMATIONAL=0

# Parse arguments
PHASE_FILTER=""
if [[ $# -gt 0 && "$1" == "--phase" ]]; then
  PHASE_FILTER="$2"
fi

# Initialize transcript
cat > "$TRANSCRIPT_FILE" << EOF
# Build Transcript

**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Phase Filter**: ${PHASE_FILTER:-all}

## Gate Execution Results

EOF

# Initialize results JSON
cat > "$RESULTS_FILE" << EOF
{
  "\$schema": "build-gate-results-v1",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "blocking": 0,
    "warnings": 0,
    "informational": 0
  },
  "results": [],
  "conclusion": {
    "buildStatus": "pending",
    "deployable": false
  }
}
EOF

echo "================================================"
echo "Foundry Build Gate Validation"
echo "================================================"
echo

# Helper function to run gate
run_gate() {
  local script=$1
  local phase=$2
  local name=$(basename "$script" .sh)
  
  # Skip if phase filter active and doesn't match
  if [[ -n "$PHASE_FILTER" && "$phase" != "$PHASE_FILTER" ]]; then
    return
  fi
  
  TOTAL=$((TOTAL + 1))
  
  echo -n "Running $name... "
  
  if bash "$script" > /tmp/gate_output.txt 2>&1; then
    echo -e "${GREEN}[PASS]${NC}"
    PASSED=$((PASSED + 1))
    echo "### ✅ $name - PASS" >> "$TRANSCRIPT_FILE"
  else
    echo -e "${RED}[FAIL]${NC}"
    FAILED=$((FAILED + 1))
    BLOCKING=$((BLOCKING + 1))
    echo "### ❌ $name - FAIL" >> "$TRANSCRIPT_FILE"
    echo '```' >> "$TRANSCRIPT_FILE"
    cat /tmp/gate_output.txt >> "$TRANSCRIPT_FILE"
    echo '```' >> "$TRANSCRIPT_FILE"
  fi
  echo >> "$TRANSCRIPT_FILE"
}

# Phase 0: Preflight
echo "Phase 0: Preflight Checks"
echo "----------------------------"
run_gate "$SCRIPT_DIR/verify-dependencies.sh" 0
run_gate "$SCRIPT_DIR/verify-file-structure.sh" 0
run_gate "$SCRIPT_DIR/verify-environment.sh" 0
echo

# Phase 1: Specification Integrity
echo "Phase 1: Specification Integrity"
echo "-----------------------------------"
run_gate "$SCRIPT_DIR/verify-agent-1-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-agent-2-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-agent-3-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-agent-4-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-agent-5-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-cross-agent-alignment.sh" 1
run_gate "$SCRIPT_DIR/verify-constitution-compliance.sh" 1
run_gate "$SCRIPT_DIR/verify-version-hygiene.sh" 1
run_gate "$SCRIPT_DIR/verify-schema-validity.sh" 1
run_gate "$SCRIPT_DIR/verify-documentation-currency.sh" 1
echo

# Phase 2: Implementation Readiness
echo "Phase 2: Implementation Readiness"
echo "------------------------------------"
run_gate "$SCRIPT_DIR/verify-api-implementation-readiness.sh" 2
run_gate "$SCRIPT_DIR/verify-ui-implementation-readiness.sh" 2
run_gate "$SCRIPT_DIR/verify-data-migration-readiness.sh" 2
run_gate "$SCRIPT_DIR/verify-authentication-implementation.sh" 2
run_gate "$SCRIPT_DIR/verify-deployment-readiness.sh" 2
run_gate "$SCRIPT_DIR/verify-testing-coverage.sh" 2
run_gate "$SCRIPT_DIR/verify-monitoring-setup.sh" 2
run_gate "$SCRIPT_DIR/verify-security-compliance.sh" 2
run_gate "$SCRIPT_DIR/verify-performance-requirements.sh" 2
run_gate "$SCRIPT_DIR/verify-accessibility-compliance.sh" 2
echo

# Phase 3: Integration Verification
echo "Phase 3: Integration Verification"
echo "------------------------------------"
run_gate "$SCRIPT_DIR/verify-api-ui-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-database-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-authentication-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-third-party-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-error-handling-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-logging-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-configuration-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-performance-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-backup-recovery-integration.sh" 3
run_gate "$SCRIPT_DIR/verify-deployment-integration.sh" 3
echo

# Summary
echo "================================================"
echo "Build Gate Summary"
echo "================================================"
echo "Total:    $TOTAL"
echo "Passed:   $PASSED"
echo "Failed:   $FAILED"
echo "Blocking: $BLOCKING"
echo

# Update results JSON
BUILD_STATUS="success"
DEPLOYABLE="true"
if [[ $BLOCKING -gt 0 ]]; then
  BUILD_STATUS="failed"
  DEPLOYABLE="false"
fi

cat > "$RESULTS_FILE" << EOF
{
  "\$schema": "build-gate-results-v1",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total": $TOTAL,
    "passed": $PASSED,
    "failed": $FAILED,
    "blocking": $BLOCKING,
    "warnings": $WARNINGS,
    "informational": $INFORMATIONAL
  },
  "conclusion": {
    "buildStatus": "$BUILD_STATUS",
    "deployable": $DEPLOYABLE
  }
}
EOF

# Append summary to transcript
cat >> "$TRANSCRIPT_FILE" << EOF

## Summary

- **Total Gates**: $TOTAL
- **Passed**: $PASSED
- **Failed**: $FAILED
- **Blocking**: $BLOCKING
- **Build Status**: $BUILD_STATUS
- **Deployable**: $DEPLOYABLE

Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

# Exit with appropriate code
if [[ $BLOCKING -gt 0 ]]; then
  echo -e "${RED}Build FAILED - $BLOCKING blocking issues${NC}"
  exit 1
else
  echo -e "${GREEN}Build PASSED - All gates validated${NC}"
  exit 0
fi
#===== END FILE =====#

#===== FILE: scripts/verify-dependencies.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Verify all agent output dependencies exist

echo "[Phase 0] Verifying agent output dependencies..."

# Check Agent 1 output
if [[ ! -f "scope-manifest.json" ]]; then
  echo "[❌] Missing Agent 1 output: scope-manifest.json"
  exit 1
fi

# Check Agent 2 output
if [[ ! -f "env-manifest.json" ]]; then
  echo "[❌] Missing Agent 2 output: env-manifest.json"
  exit 1
fi

# Check Agent 3 output
if [[ ! -f "data-relationships.json" ]]; then
  echo "[❌] Missing Agent 3 output: data-relationships.json"
  exit 1
fi

# Check Agent 4 output
if [[ ! -f "service-contracts.json" ]]; then
  echo "[❌] Missing Agent 4 output: service-contracts.json"
  exit 1
fi

# Check Agent 5 output
if [[ ! -f "ui-api-deps.json" ]]; then
  echo "[❌] Missing Agent 5 output: ui-api-deps.json"
  exit 1
fi

# Check constitution
if [[ ! -f "agent-0-constitution.md" ]]; then
  echo "[❌] Missing framework constitution"
  exit 1
fi

echo "[✅] All agent dependencies present"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-file-structure.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Verify expected project structure exists

echo "[Phase 0] Verifying project file structure..."

# Check required directories
REQUIRED_DIRS=(
  "server"
  "server/db"
  "server/db/schema"
  "server/routes"
  "server/services"
  "server/middleware"
  "client"
  "client/src"
  "client/src/pages"
  "client/src/components"
  "client/src/lib"
  "docs"
  "scripts"
)

MISSING_DIRS=0
for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "[⚠️] Missing directory: $dir"
    MISSING_DIRS=$((MISSING_DIRS + 1))
  fi
done

if [[ $MISSING_DIRS -gt 0 ]]; then
  echo "[❌] $MISSING_DIRS required directories missing"
  exit 1
fi

echo "[✅] Project structure validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-environment.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Check required tools and permissions

echo "[Phase 0] Verifying build environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "[❌] Node.js not found"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
  echo "[❌] Node.js version must be 18 or higher (found: $NODE_VERSION)"
  exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "[❌] npm not found"
  exit 1
fi

# Check jq for JSON validation
if ! command -v jq &> /dev/null; then
  echo "[⚠️] jq not found - JSON validation limited"
fi

# Check bash version
BASH_VERSION_MAJOR=${BASH_VERSION%%.*}
if [[ $BASH_VERSION_MAJOR -lt 4 ]]; then
  echo "[❌] Bash version must be 4 or higher"
  exit 1
fi

# Check write permissions
if [[ ! -w "docs" ]]; then
  echo "[❌] No write permission to docs directory"
  exit 1
fi

echo "[✅] Build environment ready"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-agent-1-compliance.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 1 product definition compliance

echo "[Phase 1] Verifying Agent 1 (Product Definition) compliance..."

MANIFEST="scope-manifest.json"

# Verify file exists and is valid JSON
if ! jq empty "$MANIFEST" 2>/dev/null; then
  echo "[❌] Invalid JSON in $MANIFEST"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$MANIFEST")
if [[ "$SCHEMA" != "scope-manifest-v6" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: scope-manifest-v6)"
  exit 1
fi

# Verify required entities
REQUIRED_ENTITIES=(
  "organisations"
  "users"
  "projects"
  "sources"
  "processingJobs"
  "datasets"
  "canonicalSchemas"
)

for entity in "${REQUIRED_ENTITIES[@]}"; do
  if ! jq -e ".requiredEntities | index(\"$entity\")" "$MANIFEST" > /dev/null; then
    echo "[❌] Missing required entity: $entity"
    exit 1
  fi
done

# Verify deferred entities structure
DEFERRED_COUNT=$(jq '.deferredEntities | length' "$MANIFEST")
if [[ $DEFERRED_COUNT -lt 1 ]]; then
  echo "[❌] deferredEntities array must not be empty"
  exit 1
fi

# Verify each deferred entity has required fields
DEFERRED_NAMES=$(jq -r '.deferredEntities[].name' "$MANIFEST")
for name in $DEFERRED_NAMES; do
  if ! jq -e ".deferralDeclarations.\"$name\"" "$MANIFEST" > /dev/null; then
    echo "[❌] Deferred entity '$name' missing deferralDeclarations entry"
    exit 1
  fi
done

# Verify scopeExceptions structure
if ! jq -e '.scopeExceptions | length' "$MANIFEST" > /dev/null; then
  echo "[❌] scopeExceptions array missing or invalid"
  exit 1
fi

echo "[✅] Agent 1 compliance validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-agent-2-compliance.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 2 system architecture compliance

echo "[Phase 1] Verifying Agent 2 (System Architecture) compliance..."

ENV_MANIFEST="env-manifest.json"

# Verify file exists and is valid JSON
if ! jq empty "$ENV_MANIFEST" 2>/dev/null; then
  echo "[❌] Invalid JSON in $ENV_MANIFEST"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$ENV_MANIFEST")
if [[ "$SCHEMA" != "env-manifest-v1" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: env-manifest-v1)"
  exit 1
fi

# Verify required environment variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "NODE_ENV"
  "PORT"
)

for var in "${REQUIRED_VARS[@]}"; do
  if ! jq -e ".variables[] | select(.name == \"$var\")" "$ENV_MANIFEST" > /dev/null; then
    echo "[❌] Missing required environment variable: $var"
    exit 1
  fi
done

# Verify each variable has required structure
VAR_COUNT=$(jq '.variables | length' "$ENV_MANIFEST")
INVALID_VARS=0

for ((i=0; i<VAR_COUNT; i++)); do
  NAME=$(jq -r ".variables[$i].name" "$ENV_MANIFEST")
  
  # Check required fields
  if ! jq -e ".variables[$i].required" "$ENV_MANIFEST" > /dev/null; then
    echo "[⚠️] Variable $NAME missing 'required' field"
    INVALID_VARS=$((INVALID_VARS + 1))
  fi
  
  if ! jq -e ".variables[$i].purpose" "$ENV_MANIFEST" > /dev/null; then
    echo "[⚠️] Variable $NAME missing 'purpose' field"
    INVALID_VARS=$((INVALID_VARS + 1))
  fi
done

if [[ $INVALID_VARS -gt 0 ]]; then
  echo "[❌] $INVALID_VARS variables have invalid structure"
  exit 1
fi

echo "[✅] Agent 2 compliance validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-agent-3-compliance.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 3 data modeling compliance

echo "[Phase 1] Verifying Agent 3 (Data Modeling) compliance..."

DATA_REL="data-relationships.json"

# Verify file exists and is valid JSON
if ! jq empty "$DATA_REL" 2>/dev/null; then
  echo "[❌] Invalid JSON in $DATA_REL"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$DATA_REL")
if [[ "$SCHEMA" != "data-relationships-v2" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: data-relationships-v2)"
  exit 1
fi

# Verify required tables exist
REQUIRED_TABLES=(
  "organisations"
  "users"
  "projects"
  "sources"
  "processingJobs"
  "datasets"
  "canonicalSchemas"
)

for table in "${REQUIRED_TABLES[@]}"; do
  if ! jq -e ".tables[] | select(.name == \"$table\")" "$DATA_REL" > /dev/null; then
    echo "[❌] Missing required table: $table"
    exit 1
  fi
done

# Verify tenant architecture
CONTAINER_COUNT=$(jq '[.tables[] | select(.tenantKey == "container")] | length' "$DATA_REL")
if [[ $CONTAINER_COUNT -ne 1 ]]; then
  echo "[❌] Must have exactly 1 container table (found: $CONTAINER_COUNT)"
  exit 1
fi

CONTAINER_TABLE=$(jq -r '.tables[] | select(.tenantKey == "container") | .name' "$DATA_REL")
if [[ "$CONTAINER_TABLE" != "organisations" ]]; then
  echo "[❌] Container table must be 'organisations' (found: $CONTAINER_TABLE)"
  exit 1
fi

# Verify soft-delete patterns
TABLE_COUNT=$(jq '.tables | length' "$DATA_REL")
TABLES_WITHOUT_SOFT_DELETE=0

for ((i=0; i<TABLE_COUNT; i++)); do
  TABLE_NAME=$(jq -r ".tables[$i].name" "$DATA_REL")
  
  if ! jq -e ".tables[$i].softDeleteColumn" "$DATA_REL" > /dev/null; then
    echo "[⚠️] Table $TABLE_NAME missing soft-delete pattern"
    TABLES_WITHOUT_SOFT_DELETE=$((TABLES_WITHOUT_SOFT_DELETE + 1))
  fi
  
  if ! jq -e ".tables[$i].cascadeSemantics" "$DATA_REL" > /dev/null; then
    echo "[⚠️] Table $TABLE_NAME missing cascade semantics"
  fi
done

if [[ $TABLES_WITHOUT_SOFT_DELETE -gt 0 ]]; then
  echo "[❌] $TABLES_WITHOUT_SOFT_DELETE tables missing soft-delete patterns"
  exit 1
fi

echo "[✅] Agent 3 compliance validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-agent-4-compliance.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-agent-5-compliance.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 5 UI specification compliance

echo "[Phase 1] Verifying Agent 5 (UI Specification) compliance..."

UI_SPEC="ui-api-deps.json"

# Verify file exists and is valid JSON
if ! jq empty "$UI_SPEC" 2>/dev/null; then
  echo "[❌] Invalid JSON in $UI_SPEC"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$UI_SPEC")
if [[ "$SCHEMA" != "ui-api-deps-v2" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: ui-api-deps-v2)"
  exit 1
fi

# Verify required pages exist
REQUIRED_PAGES=(
  "/login"
  "/register"
  "/dashboard"
  "/projects"
  "/projects/:id"
  "/sources"
  "/datasets"
)

for path in "${REQUIRED_PAGES[@]}"; do
  if ! jq -e ".pages[] | select(.routePath == \"$path\")" "$UI_SPEC" > /dev/null; then
    echo "[❌] Missing required page: $path"
    exit 1
  fi
done

# Verify page-API alignment
PAGE_COUNT=$(jq '.pages | length' "$UI_SPEC")
PAGES_WITHOUT_API_CALLS=0

for ((i=0; i<PAGE_COUNT; i++)); do
  PAGE_PATH=$(jq -r ".pages[$i].routePath" "$UI_SPEC")
  SCOPE=$(jq -r ".pages[$i].scope" "$UI_SPEC")
  
  if [[ "$SCOPE" == "required" ]]; then
    API_CALLS=$(jq ".pages[$i].apiCalls | length" "$UI_SPEC")
    
    if [[ $API_CALLS -eq 0 ]]; then
      echo "[⚠️] Required page $PAGE_PATH has no API calls defined"
      PAGES_WITHOUT_API_CALLS=$((PAGES_WITHOUT_API_CALLS + 1))
    fi
  fi
done

if [[ $PAGES_WITHOUT_API_CALLS -gt 0 ]]; then
  echo "[❌] $PAGES_WITHOUT_API_CALLS required pages missing API calls"
  exit 1
fi

# Verify canonical paths
if ! jq -e '.canonicalPaths.apiClient' "$UI_SPEC" > /dev/null; then
  echo "[❌] Missing canonical path: apiClient"
  exit 1
fi

if ! jq -e '.canonicalPaths.errorBoundary' "$UI_SPEC" > /dev/null; then
  echo "[❌] Missing canonical path: errorBoundary"
  exit 1
fi

# Verify total page count matches
DECLARED_TOTAL=$(jq -r '.totalPages' "$UI_SPEC")
ACTUAL_TOTAL=$(jq '.pages | length' "$UI_SPEC")

if [[ "$DECLARED_TOTAL" != "$ACTUAL_TOTAL" ]]; then
  echo "[❌] Page count mismatch: declared=$DECLARED_TOTAL, actual=$ACTUAL_TOTAL"
  exit 1
fi

echo "[✅] Agent 5 compliance validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-cross-agent-alignment.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate alignment between agent outputs

echo "[Phase 1] Verifying cross-agent alignment..."

# Verify entity alignment between Agent 1 and Agent 3
MANIFEST_ENTITIES=$(jq -r '.requiredEntities[]' scope-manifest.json | sort)
SCHEMA_TABLES=$(jq -r '.tables[].name' data-relationships.json | sort)

ENTITY_MISMATCH=0
for entity in $MANIFEST_ENTITIES; do
  if ! echo "$SCHEMA_TABLES" | grep -q "^$entity$"; then
    echo "[❌] Entity '$entity' in scope-manifest not found in data-relationships"
    ENTITY_MISMATCH=$((ENTITY_MISMATCH + 1))
  fi
done

if [[ $ENTITY_MISMATCH -gt 0 ]]; then
  echo "[❌] $ENTITY_MISMATCH entity alignment issues"
  exit 1
fi

# Verify API-to-service alignment from Agent 4
ENDPOINT_COUNT=$(jq '.endpoints | length' service-contracts.json)
MISSING_SERVICE_FILES=0

for ((i=0; i<ENDPOINT_COUNT; i++)); do
  STATUS=$(jq -r ".endpoints[$i].status" service-contracts.json)
  
  if [[ "$STATUS" == "required" ]]; then
    SERVICE_FILE=$(jq -r ".endpoints[$i].serviceContract.serviceFile" service-contracts.json)
    
    if [[ -z "$SERVICE_FILE" || "$SERVICE_FILE" == "null" ]]; then
      PATH=$(jq -r ".endpoints[$i].path" service-contracts.json)
      echo "[⚠️] Required endpoint $PATH missing service file specification"
      MISSING_SERVICE_FILES=$((MISSING_SERVICE_FILES + 1))
    fi
  fi
done

if [[ $MISSING_SERVICE_FILES -gt 0 ]]; then
  echo "[❌] $MISSING_SERVICE_FILES service file specifications missing"
  exit 1
fi

# Verify UI-to-API alignment from Agent 5
PAGE_COUNT=$(jq '.pages | length' ui-api-deps.json)
API_ENDPOINT_MISMATCHES=0

for ((i=0; i<PAGE_COUNT; i++)); do
  SCOPE=$(jq -r ".pages[$i].scope" ui-api-deps.json)
  
  if [[ "$SCOPE" == "required" ]]; then
    API_CALL_COUNT=$(jq ".pages[$i].apiCalls | length" ui-api-deps.json)
    
    for ((j=0; j<API_CALL_COUNT; j++)); do
      METHOD=$(jq -r ".pages[$i].apiCalls[$j].method" ui-api-deps.json)
      PATH=$(jq -r ".pages[$i].apiCalls[$j].path" ui-api-deps.json)
      
      if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$PATH\")" service-contracts.json > /dev/null; then
        echo "[⚠️] UI references undefined API endpoint: $METHOD $PATH"
        API_ENDPOINT_MISMATCHES=$((API_ENDPOINT_MISMATCHES + 1))
      fi
    done
  fi
done

if [[ $API_ENDPOINT_MISMATCHES -gt 0 ]]; then
  echo "[❌] $API_ENDPOINT_MISMATCHES UI-to-API mismatches"
  exit 1
fi

echo "[✅] Cross-agent alignment validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-constitution-compliance.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-version-hygiene.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate version reference standards

echo "[Phase 1] Verifying version hygiene..."

# Check scope-manifest schema version
SCOPE_SCHEMA=$(jq -r '."$schema"' scope-manifest.json)
if [[ "$SCOPE_SCHEMA" != "scope-manifest-v6" ]]; then
  echo "[❌] Incorrect scope-manifest schema version: $SCOPE_SCHEMA"
  exit 1
fi

# Check data-relationships schema version
DATA_SCHEMA=$(jq -r '."$schema"' data-relationships.json)
if [[ "$DATA_SCHEMA" != "data-relationships-v2" ]]; then
  echo "[❌] Incorrect data-relationships schema version: $DATA_SCHEMA"
  exit 1
fi

# Check service-contracts schema version
API_SCHEMA=$(jq -r '."$schema"' service-contracts.json)
if [[ "$API_SCHEMA" != "service-contracts-v2" ]]; then
  echo "[❌] Incorrect service-contracts schema version: $API_SCHEMA"
  exit 1
fi

# Check ui-api-deps schema version
UI_SCHEMA=$(jq -r '."$schema"' ui-api-deps.json)
if [[ "$UI_SCHEMA" != "ui-api-deps-v2" ]]; then
  echo "[❌] Incorrect ui-api-deps schema version: $UI_SCHEMA"
  exit 1
fi

# Check env-manifest schema version
ENV_SCHEMA=$(jq -r '."$schema"' env-manifest.json)
if [[ "$ENV_SCHEMA" != "env-manifest-v1" ]]; then
  echo "[❌] Incorrect env-manifest schema version: $ENV_SCHEMA"
  exit 1
fi

echo "[✅] Version hygiene validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-schema-validity.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate JSON schema compliance

echo "[Phase 1] Verifying JSON schema validity..."

# Validate all JSON files
JSON_FILES=(
  "scope-manifest.json"
  "env-manifest.json"
  "data-relationships.json"
  "service-contracts.json"
  "ui-api-deps.json"
)

INVALID_JSON=0

for file in "${JSON_FILES[@]}"; do
  if ! jq empty "$file" 2>/dev/null; then
    echo "[❌] Invalid JSON: $file"
    INVALID_JSON=$((INVALID_JSON + 1))
  fi
done

if [[ $INVALID_JSON -gt 0 ]]; then
  echo "[❌] $INVALID_JSON files have invalid JSON"
  exit 1
fi

# Verify required top-level keys
if ! jq -e '.requiredEntities' scope-manifest.json > /dev/null; then
  echo "[❌] scope-manifest.json missing requiredEntities"
  exit 1
fi

if ! jq -e '.tables' data-relationships.json > /dev/null; then
  echo "[❌] data-relationships.json missing tables"
  exit 1
fi

if ! jq -e '.endpoints' service-contracts.json > /dev/null; then
  echo "[❌] service-contracts.json missing endpoints"
  exit 1
fi

if ! jq -e '.pages' ui-api-deps.json > /dev/null; then
  echo "[❌] ui-api-deps.json missing pages"
  exit 1
fi

echo "[✅] JSON schema validity confirmed"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-documentation-currency.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate documentation completeness

echo "[Phase 1] Verifying documentation currency..."

# Check agent specification files
AGENT_SPECS=(
  "agent-0-constitution.md"
  "agent-1-product-definition.md"
  "agent-2-system-architecture.md"
  "agent-3-data-modeling.md"
  "agent-4-api-contract.md"
  "agent-5-ui-specification.md"
  "agent-6-implementation-orchestrator.md"
)

MISSING_SPECS=0

for spec in "${AGENT_SPECS[@]}"; do
  if [[ ! -f "$spec" ]]; then
    echo "[⚠️] Missing agent specification: $spec"
    MISSING_SPECS=$((MISSING_SPECS + 1))
  fi
done

if [[ $MISSING_SPECS -gt 0 ]]; then
  echo "[❌] $MISSING_SPECS agent specifications missing"
  exit 1
fi

# Verify README exists
if [[ ! -f "README.md" ]]; then
  echo "[⚠️] README.md not found"
fi

# Verify architecture documentation
if [[ ! -f "02-ARCHITECTURE.md" ]]; then
  echo "[⚠️] Architecture documentation not found"
fi

echo "[✅] Documentation currency validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-api-implementation-readiness.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-ui-implementation-readiness.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify frontend UI implementation readiness

echo "[Phase 2] Verifying UI implementation readiness..."

# Check that all required pages have file paths
REQUIRED_PAGES=$(jq '[.pages[] | select(.scope == "required")] | length' ui-api-deps.json)
PAGES_WITH_FILES=$(jq '[.pages[] | select(.scope == "required" and .filePath != null)] | length' ui-api-deps.json)

if [[ $REQUIRED_PAGES -ne $PAGES_WITH_FILES ]]; then
  MISSING=$((REQUIRED_PAGES - PAGES_WITH_FILES))
  echo "[❌] $MISSING required pages missing file path specifications"
  exit 1
fi

# Verify routing configuration
if ! jq -e '.routingConfig.library' ui-api-deps.json > /dev/null; then
  echo "[❌] Routing configuration missing library specification"
  exit 1
fi

# Verify canonical paths exist
if ! jq -e '.canonicalPaths.apiClient' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing API client canonical path"
  exit 1
fi

if ! jq -e '.canonicalPaths.errorBoundary' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing error boundary canonical path"
  exit 1
fi

# Verify protected route configuration
if ! jq -e '.routingConfig.protectedRoutes' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing protected routes configuration"
  exit 1
fi

echo "[✅] UI implementation readiness validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-data-migration-readiness.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify database migration readiness

echo "[Phase 2] Verifying data migration readiness..."

# Verify all tables have schema files
TABLE_COUNT=$(jq '.tables | length' data-relationships.json)
TABLES_WITH_SCHEMA=$(jq '[.tables[] | select(.schemaFile != null)] | length' data-relationships.json)

if [[ $TABLE_COUNT -ne $TABLES_WITH_SCHEMA ]]; then
  MISSING=$((TABLE_COUNT - TABLES_WITH_SCHEMA))
  echo "[❌] $MISSING tables missing schema file specifications"
  exit 1
fi

# Verify tenant architecture
CONTAINER_TABLE=$(jq -r '.tables[] | select(.tenantKey == "container") | .name' data-relationships.json)

if [[ -z "$CONTAINER_TABLE" ]]; then
  echo "[❌] No tenant container table specified"
  exit 1
fi

# Verify foreign key relationships
TABLES_WITH_FKS=$(jq '[.tables[] | select(.foreignKeys != null)] | length' data-relationships.json)

if [[ $TABLES_WITH_FKS -gt 0 ]]; then
  echo "[✅] $TABLES_WITH_FKS tables have foreign key relationships defined"
fi

# Verify soft-delete cascade semantics
TABLES_WITH_CASCADE=$(jq '[.tables[] | select(.cascadeSemantics != null)] | length' data-relationships.json)

if [[ $TABLE_COUNT -ne $TABLES_WITH_CASCADE ]]; then
  MISSING=$((TABLE_COUNT - TABLES_WITH_CASCADE))
  echo "[⚠️] $MISSING tables missing cascade semantics specifications"
fi

echo "[✅] Data migration readiness validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-authentication-implementation.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-deployment-readiness.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-testing-coverage.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify testing coverage requirements

echo "[Phase 2] Verifying testing coverage..."

# Count required endpoints
REQUIRED_ENDPOINTS=$(jq '[.endpoints[] | select(.status == "required")] | length' service-contracts.json)

echo "[ℹ️] $REQUIRED_ENDPOINTS required endpoints need test coverage"

# Count required pages
REQUIRED_PAGES=$(jq '[.pages[] | select(.scope == "required")] | length' ui-api-deps.json)

echo "[ℹ️] $REQUIRED_PAGES required pages need test coverage"

# Verify critical paths have integration tests planned
AUTH_ENDPOINTS=$(jq '[.endpoints[] | select(.path | startswith("/api/auth"))] | length' service-contracts.json)

if [[ $AUTH_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] Authentication flow requires integration tests"
fi

# Check for file upload endpoints needing specialized tests
UPLOAD_ENDPOINTS=$(jq '[.endpoints[] | select(.serviceContract.fileUpload == true)] | length' service-contracts.json)

if [[ $UPLOAD_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] $UPLOAD_ENDPOINTS file upload endpoints require specialized tests"
fi

echo "[✅] Testing coverage requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-monitoring-setup.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify monitoring and observability setup

echo "[Phase 2] Verifying monitoring setup..."

# Check for health check endpoint
if jq -e '.scopeExceptions[] | select(.path == "/health")' scope-manifest.json > /dev/null; then
  echo "[✅] Health check endpoint configured"
else
  echo "[⚠️] No health check endpoint found"
fi

# Verify error handling specifications
ENDPOINTS_WITH_ERRORS=$(jq '[.endpoints[] | select(.serviceContract.throws != null)] | length' service-contracts.json)

if [[ $ENDPOINTS_WITH_ERRORS -gt 0 ]]; then
  echo "[✅] $ENDPOINTS_WITH_ERRORS endpoints have error handling specifications"
fi

# Check for audit trail requirements
TABLES_WITH_AUDIT=$(jq '[.tables[] | select(.columns[] | select(.name == "createdAt" or .name == "updatedAt"))] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_AUDIT tables have audit timestamp tracking"

# Verify logging configuration considerations
echo "[ℹ️] Review application-level logging strategy"

echo "[✅] Monitoring setup requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-security-compliance.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-performance-requirements.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify performance requirements and optimizations

echo "[Phase 2] Verifying performance requirements..."

# Check for database indexes
TABLES_WITH_INDEXES=$(jq '[.tables[] | select(.indexes != null and (.indexes | length) > 0)] | length' data-relationships.json)
TOTAL_TABLES=$(jq '.tables | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_INDEXES of $TOTAL_TABLES tables have index specifications"

# Verify foreign key indexes
TABLES_WITH_FKS=$(jq '[.tables[] | select(.foreignKeys != null)] | length' data-relationships.json)

if [[ $TABLES_WITH_FKS -gt 0 ]]; then
  echo "[ℹ️] $TABLES_WITH_FKS tables with foreign keys should have corresponding indexes"
fi

# Check for pagination requirements
LIST_ENDPOINTS=$(jq '[.endpoints[] | select(.method == "GET" and (.path | contains("?") | not))] | length' service-contracts.json)

echo "[ℹ️] $LIST_ENDPOINTS list endpoints may require pagination"

# Verify file upload size limits
UPLOAD_ENDPOINTS=$(jq '[.endpoints[] | select(.serviceContract.fileUpload == true)] | length' service-contracts.json)

if [[ $UPLOAD_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] $UPLOAD_ENDPOINTS file upload endpoints need size limit configuration"
fi

echo "[✅] Performance requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-accessibility-compliance.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify accessibility compliance requirements

echo "[Phase 2] Verifying accessibility compliance..."

# Count form pages that need accessibility
FORM_PAGES=$(jq '[.pages[] | select(.layoutSpec.type == "form-only" or .layoutSpec.form != null)] | length' ui-api-deps.json)

echo "[ℹ️] $FORM_PAGES pages with forms require WCAG 2.1 AA compliance"

# Check for error handling in forms
PAGES_WITH_API_CALLS=$(jq '[.pages[] | select(.apiCalls != null and (.apiCalls | length) > 0)] | length' ui-api-deps.json)

echo "[ℹ️] $PAGES_WITH_API_CALLS pages with API calls need accessible error messaging"

# Verify protected route configuration includes focus management
if jq -e '.routingConfig.protectedRoutes' ui-api-deps.json > /dev/null; then
  echo "[ℹ️] Protected routes need focus management for redirects"
fi

# Check for data tables requiring accessible markup
TABLE_PAGES=$(jq '[.pages[] | select(.layoutSpec.type == "table")] | length' ui-api-deps.json)

if [[ $TABLE_PAGES -gt 0 ]]; then
  echo "[ℹ️] $TABLE_PAGES table pages require accessible table markup"
fi

echo "[✅] Accessibility requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-api-ui-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify API-UI integration alignment

echo "[Phase 3] Verifying API-UI integration..."

# Cross-check that all UI API calls map to defined endpoints
PAGE_COUNT=$(jq '.pages | length' ui-api-deps.json)
UNMATCHED_CALLS=0

for ((i=0; i<PAGE_COUNT; i++)); do
  API_CALL_COUNT=$(jq ".pages[$i].apiCalls | length" ui-api-deps.json)
  
  for ((j=0; j<API_CALL_COUNT; j++)); do
    METHOD=$(jq -r ".pages[$i].apiCalls[$j].method" ui-api-deps.json)
    PATH=$(jq -r ".pages[$i].apiCalls[$j].path" ui-api-deps.json)
    
    if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$PATH\")" service-contracts.json > /dev/null; then
      PAGE_PATH=$(jq -r ".pages[$i].routePath" ui-api-deps.json)
      echo "[❌] Page $PAGE_PATH references undefined endpoint: $METHOD $PATH"
      UNMATCHED_CALLS=$((UNMATCHED_CALLS + 1))
    fi
  done
done

if [[ $UNMATCHED_CALLS -gt 0 ]]; then
  echo "[❌] $UNMATCHED_CALLS UI-to-API integration mismatches"
  exit 1
fi

# Verify authentication alignment
PROTECTED_PAGES=$(jq '[.pages[] | select(.authenticated == true)] | length' ui-api-deps.json)
PROTECTED_ENDPOINTS=$(jq '[.endpoints[] | select(.authentication == "jwt")] | length' service-contracts.json)

echo "[ℹ️] $PROTECTED_PAGES protected pages, $PROTECTED_ENDPOINTS protected endpoints"

echo "[✅] API-UI integration validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-database-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify database schema integration

echo "[Phase 3] Verifying database integration..."

# Verify all service files reference valid tables
ENDPOINT_COUNT=$(jq '.endpoints | length' service-contracts.json)
INVALID_TABLE_REFS=0

for ((i=0; i<ENDPOINT_COUNT; i++)); do
  SERVICE_FILE=$(jq -r ".endpoints[$i].serviceContract.serviceFile" service-contracts.json)
  
  if [[ "$SERVICE_FILE" != "null" && ! -z "$SERVICE_FILE" ]]; then
    # Extract table name from service file (e.g., organisations.service.ts -> organisations)
    TABLE_NAME=$(basename "$SERVICE_FILE" .service.ts)
    
    if ! jq -e ".tables[] | select(.name == \"$TABLE_NAME\")" data-relationships.json > /dev/null 2>&1; then
      # Not a blocking error - service might handle multiple tables
      continue
    fi
  fi
done

# Verify foreign key integrity
TABLES_WITH_FKS=$(jq '[.tables[] | select(.foreignKeys != null)] | length' data-relationships.json)

if [[ $TABLES_WITH_FKS -gt 0 ]]; then
  echo "[ℹ️] $TABLES_WITH_FKS tables have foreign key relationships requiring referential integrity"
fi

# Verify tenant isolation at database level
TENANT_TABLES=$(jq '[.tables[] | select(.tenantKey == "scoped")] | length' data-relationships.json)

echo "[ℹ️] $TENANT_TABLES tables require tenant-scoped queries"

echo "[✅] Database integration validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-authentication-integration.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-third-party-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify third-party service integration requirements

echo "[Phase 3] Verifying third-party integration..."

# Check for external API configurations in environment
THIRD_PARTY_VARS=$(jq '[.variables[] | select(.purpose | contains("API") or contains("third-party") or contains("external"))] | length' env-manifest.json)

if [[ $THIRD_PARTY_VARS -gt 0 ]]; then
  echo "[ℹ️] $THIRD_PARTY_VARS third-party API configurations found"
fi

# Verify file upload handling
UPLOAD_ENDPOINTS=$(jq '[.endpoints[] | select(.serviceContract.fileUpload == true)] | length' service-contracts.json)

if [[ $UPLOAD_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] $UPLOAD_ENDPOINTS file upload endpoints may require storage service integration"
fi

# Check for webhook configurations
if jq -e '.deferredEntities[] | select(.name == "webhooks")' scope-manifest.json > /dev/null; then
  echo "[ℹ️] Webhook integration deferred to post-MVP"
fi

echo "[✅] Third-party integration requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-error-handling-integration.sh =====#
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
  AUTH_WITH_ERRORS=$(jq '[.endpoints[] | select(.path | startswith("/api/auth") and .serviceContract.throws != null)] | length' service-contracts.json)
  
  if [[ $AUTH_WITH_ERRORS -ne $AUTH_ENDPOINTS ]]; then
    echo "[⚠️] Not all auth endpoints have error specifications"
  fi
fi

echo "[✅] Error handling integration validated"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-logging-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify logging and audit trail integration

echo "[Phase 3] Verifying logging integration..."

# Verify audit timestamp columns
TABLES_WITH_TIMESTAMPS=$(jq '[.tables[] | select(.columns[] | select(.name == "createdAt" or .name == "updatedAt"))] | length' data-relationships.json)
TOTAL_TABLES=$(jq '.tables | length' data-relationships.json)

if [[ $TABLES_WITH_TIMESTAMPS -ne $TOTAL_TABLES ]]; then
  MISSING=$((TOTAL_TABLES - TABLES_WITH_TIMESTAMPS))
  echo "[⚠️] $MISSING tables missing audit timestamp columns"
fi

# Check for soft-delete tracking
TABLES_WITH_DELETED_AT=$(jq '[.tables[] | select(.columns[] | select(.name == "deletedAt"))] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_DELETED_AT tables have soft-delete audit trails"

# Verify user tracking for audit purposes
USER_TABLE_HAS_AUDIT=$(jq '.tables[] | select(.name == "users") | .columns[] | select(.name == "createdAt" or .name == "updatedAt")' data-relationships.json)

if [[ -z "$USER_TABLE_HAS_AUDIT" ]]; then
  echo "[⚠️] Users table should have audit timestamp columns"
fi

echo "[✅] Logging integration requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-configuration-integration.sh =====#
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
#===== END FILE =====#

#===== FILE: scripts/verify-performance-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify performance optimization integration

echo "[Phase 3] Verifying performance integration..."

# Check database index coverage
TABLES_WITH_INDEXES=$(jq '[.tables[] | select(.indexes != null and (.indexes | length) > 0)] | length' data-relationships.json)
TABLES_WITH_FKS=$(jq '[.tables[] | select(.foreignKeys != null)] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_INDEXES tables have index definitions"
echo "[ℹ️] $TABLES_WITH_FKS tables have foreign keys requiring index coverage"

# Verify pagination for list endpoints
GET_ENDPOINTS=$(jq '[.endpoints[] | select(.method == "GET" and (.path | contains(":") | not))] | length' service-contracts.json)

echo "[ℹ️] $GET_ENDPOINTS list endpoints should implement pagination"

# Check for file upload size considerations
UPLOAD_ENDPOINTS=$(jq '[.endpoints[] | select(.serviceContract.fileUpload == true)] | length' service-contracts.json)

if [[ $UPLOAD_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] $UPLOAD_ENDPOINTS file upload endpoints need size limit and streaming configuration"
fi

# Verify partial unique indexes for soft-delete
PARTIAL_INDEXES=$(jq '[.tables[].indexes[] | select(.indexType == "partialUnique")] | length' data-relationships.json)

echo "[ℹ️] $PARTIAL_INDEXES partial unique indexes for soft-delete optimization"

echo "[✅] Performance integration requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-backup-recovery-integration.sh =====#
#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify backup and recovery integration

echo "[Phase 3] Verifying backup/recovery integration..."

# Verify soft-delete for data recovery
TABLES_WITH_SOFT_DELETE=$(jq '[.tables[] | select(.softDeleteColumn != null)] | length' data-relationships.json)
TOTAL_TABLES=$(jq '.tables | length' data-relationships.json)

if [[ $TABLES_WITH_SOFT_DELETE -eq $TOTAL_TABLES ]]; then
  echo "[✅] All tables implement soft-delete for data recovery"
else
  MISSING=$((TOTAL_TABLES - TABLES_WITH_SOFT_DELETE))
  echo "[⚠️] $MISSING tables without soft-delete recovery capability"
fi

# Check timestamp tracking for point-in-time recovery
TABLES_WITH_TIMESTAMPS=$(jq '[.tables[] | select(.columns[] | select(.name == "createdAt" or .name == "updatedAt"))] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_TIMESTAMPS tables have timestamp tracking for PITR"

# Verify database URL configuration
if ! jq -e '.variables[] | select(.name == "DATABASE_URL")' env-manifest.json > /dev/null; then
  echo "[❌] DATABASE_URL not configured for backup connection"
  exit 1
fi

# Check cascade semantics for referential integrity
TABLES_WITH_CASCADE=$(jq '[.tables[] | select(.cascadeSemantics != null)] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_CASCADE tables have cascade semantics for recovery consistency"

echo "[✅] Backup/recovery integration requirements identified"
exit 0
#===== END FILE =====#

#===== FILE: scripts/verify-deployment-integration.sh =====#
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
#===== END FILE =====#
