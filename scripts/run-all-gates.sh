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
