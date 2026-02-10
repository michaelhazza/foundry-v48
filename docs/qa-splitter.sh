#!/bin/bash
# QA Scripts Splitter - Extract executable scripts from qa-scripts-reference.md
set -euo pipefail

REFERENCE_FILE="docs/qa-scripts-reference.md"
OUTPUT_DIR="scripts"
EXPECTED_SCRIPTS=12

echo "=== QA Scripts Splitter ==="
echo "Reference: $REFERENCE_FILE"
echo "Output: $OUTPUT_DIR/"
echo

# Validation: Reference file exists
if [[ ! -f "$REFERENCE_FILE" ]]; then
    echo "[X] Reference file not found: $REFERENCE_FILE"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Extract FILE blocks using exact markers
echo "Extracting scripts..."

current_file=""
in_file_block=false

while IFS= read -r line; do
    # Detect file block start
    if [[ "$line" =~ ^#=====\ FILE:\ (.+)\ =====# ]]; then
        current_file="${BASH_REMATCH[1]}"
        in_file_block=true
        echo "  - $current_file"
        > "$current_file"  # Create empty file
        continue
    fi
    
    # Detect file block end
    if [[ "$line" =~ ^#=====\ END\ FILE\ =====# ]]; then
        in_file_block=false
        current_file=""
        continue
    fi
    
    # Write content to current file
    if [[ "$in_file_block" == true ]] && [[ -n "$current_file" ]]; then
        echo "$line" >> "$current_file"
    fi
done < "$REFERENCE_FILE"

echo

# Validation: Exact script count (CRITICAL - must use -ne not -lt)
file_count=$(find "$OUTPUT_DIR" -name "*.sh" -type f | wc -l)

if [[ $file_count -ne $EXPECTED_SCRIPTS ]]; then
    echo "[X] Expected exactly $EXPECTED_SCRIPTS scripts, created $file_count"
    echo "Missing or extra scripts detected - check reference file"
    exit 1
fi

echo "[✓] Script count validation: $file_count scripts (exact match)"

# Validation: Check for duplicates
echo
echo "Checking for duplicate FILE blocks..."

duplicate_check=$(grep -o '^#===== FILE: .*=====#' "$REFERENCE_FILE" | sort | uniq -d)

if [[ -n "$duplicate_check" ]]; then
    echo "[X] Duplicate FILE blocks detected:"
    echo "$duplicate_check"
    exit 1
fi

echo "[✓] No duplicate FILE blocks"

# Post-split validation
echo
echo "Validating extracted scripts..."

validation_errors=0

for script in "$OUTPUT_DIR"/*.sh; do
    # Check shebang
    if ! head -n1 "$script" | grep -q '^#!/bin/bash'; then
        echo "[X] Missing or invalid shebang in $(basename "$script")"
        validation_errors=$((validation_errors + 1))
    fi
    
    # Check basic bash syntax
    if ! bash -n "$script" 2>/dev/null; then
        echo "[X] Syntax error in $(basename "$script")"
        validation_errors=$((validation_errors + 1))
    fi
    
    # Make executable
    chmod +x "$script"
done

if [[ $validation_errors -gt 0 ]]; then
    echo
    echo "[X] Validation failed: $validation_errors errors"
    exit 1
fi

echo "[✓] All scripts validated successfully"

# QA-specific validation
echo
echo "Validating QA framework patterns..."

# Check orchestrator has required functions
ORCHESTRATOR="$OUTPUT_DIR/run-all-qa-tests.sh"

if [[ ! -f "$ORCHESTRATOR" ]]; then
    echo "[X] Orchestrator script missing: $ORCHESTRATOR"
    exit 1
fi

REQUIRED_FUNCTIONS=(
    "evaluate_deployment_readiness"
    "validate_cross_interface_consistency"
    "validate_critical_capability_coverage"
    "classify_test_result"
)

for func in "${REQUIRED_FUNCTIONS[@]}"; do
    if ! grep -q "$func" "$ORCHESTRATOR"; then
        echo "[X] Orchestrator missing required function: $func"
        validation_errors=$((validation_errors + 1))
    fi
done

if [[ $validation_errors -gt 0 ]]; then
    echo "[X] QA framework validation failed"
    exit 1
fi

echo "[✓] Orchestrator implements all governance functions"

# Verify individual QA scripts don't duplicate orchestrator functions
echo
echo "Checking for function scope violations..."

FORBIDDEN_IN_QA=(
    "evaluate_deployment_readiness"
    "validate_critical_capability_coverage"
)

for script in "$OUTPUT_DIR"/qa-*.sh; do
    [[ ! -f "$script" ]] && continue
    
    for forbidden in "${FORBIDDEN_IN_QA[@]}"; do
        if grep -q "$forbidden" "$script"; then
            echo "[X] $(basename "$script") contains orchestrator function: $forbidden"
            validation_errors=$((validation_errors + 1))
        fi
    done
done

if [[ $validation_errors -gt 0 ]]; then
    echo "[X] Function scope validation failed"
    exit 1
fi

echo "[✓] Individual QA scripts properly scoped"

# Success
echo
echo "=== Extraction Complete ==="
echo "[✓] $file_count QA scripts extracted to $OUTPUT_DIR/"
echo "[✓] All validation checks passed"
echo
echo "Run the test suite:"
echo "  bash $OUTPUT_DIR/run-all-qa-tests.sh"
