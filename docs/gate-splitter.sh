#!/bin/bash
set -euo pipefail

# Gate Scripts Splitter
# Extracts individual validation scripts from gate-scripts-reference.md

REFERENCE_FILE="docs/gate-scripts-reference.md"
OUTPUT_DIR="scripts"
EXPECTED_SCRIPTS=34

echo "================================================"
echo "Gate Scripts Splitter"
echo "================================================"
echo

# Verify reference file exists
if [[ ! -f "$REFERENCE_FILE" ]]; then
  echo "[❌] Reference file not found: $REFERENCE_FILE"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Extract FILE blocks
echo "Extracting scripts from $REFERENCE_FILE..."

# Parse the reference file
in_file=false
file_name=""
file_content=""
file_count=0
declare -A seen_files

while IFS= read -r line; do
  if [[ "$line" =~ ^#=====\ FILE:\ (.+)\ =====# ]]; then
    # Start of new file block
    file_name="${BASH_REMATCH[1]}"
    
    # Check for duplicates
    if [[ -n "${seen_files[$file_name]:-}" ]]; then
      echo "[❌] Duplicate FILE block detected: $file_name"
      exit 1
    fi
    seen_files[$file_name]=1
    
    in_file=true
    file_content=""
    file_count=$((file_count + 1))
    
  elif [[ "$line" =~ ^#=====\ END\ FILE\ =====# ]]; then
    # End of file block
    if [[ "$in_file" == true && -n "$file_name" ]]; then
      # Write file
      echo "$file_content" > "$file_name"
      chmod +x "$file_name"
      echo "  [✓] Extracted: $file_name"
    fi
    
    in_file=false
    file_name=""
    file_content=""
    
  elif [[ "$in_file" == true ]]; then
    # Accumulate file content
    if [[ -z "$file_content" ]]; then
      file_content="$line"
    else
      file_content="$file_content"$'\n'"$line"
    fi
  fi
done < "$REFERENCE_FILE"

echo
echo "================================================"
echo "Extraction Summary"
echo "================================================"

# Validate exact script count
if [[ $file_count -ne $EXPECTED_SCRIPTS ]]; then
  echo "[❌] Expected exactly $EXPECTED_SCRIPTS FILE blocks (1 orchestrator + 33 gates), created $file_count"
  exit 1
fi

echo "Total Scripts Extracted: $file_count"
echo

# Post-extraction validation
echo "Running post-extraction validation..."
echo

validation_errors=0

for script in "$OUTPUT_DIR"/*.sh; do
  if [[ ! -f "$script" ]]; then
    continue
  fi
  
  script_name=$(basename "$script")
  
  # Check shebang
  first_line=$(head -1 "$script")
  if [[ "$first_line" != "#!/bin/bash" ]]; then
    echo "  [❌] $script_name: Missing bash shebang"
    validation_errors=$((validation_errors + 1))
  fi
  
  # Check syntax
  if ! bash -n "$script" 2>/dev/null; then
    echo "  [❌] $script_name: Syntax error"
    validation_errors=$((validation_errors + 1))
  fi
  
  # Check executability
  if [[ ! -x "$script" ]]; then
    echo "  [❌] $script_name: Not executable"
    validation_errors=$((validation_errors + 1))
  fi
done

if [[ $validation_errors -gt 0 ]]; then
  echo
  echo "[❌] Post-extraction validation failed: $validation_errors errors"
  exit 1
fi

echo "  [✓] All scripts have valid shebang"
echo "  [✓] All scripts have valid syntax"
echo "  [✓] All scripts are executable"
echo

echo "================================================"
echo "[✅] Gate scripts extraction complete"
echo "================================================"
echo "Scripts location: $OUTPUT_DIR/"
echo "Run all gates: bash scripts/run-all-gates.sh"
echo

exit 0
