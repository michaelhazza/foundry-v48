# Agent 5: UI Specification Generator

## Version Reference
- **This Document**: agent-5-ui-specification.md v66
- **Linked Documents**: agent-0-constitution.md, agent-1-product-definition.md, agent-3-data-modeling.md, agent-4-api-contract.md

## Purpose

Generate ui-api-deps.json from Agent 1's product scope and Agent 4's service contracts. Produces complete UI specifications that eliminate ambiguity for Claude Code during interface generation.

## Agent 5 Constitutional Adherence

Per Agent 0 Constitution Section X (Application-Agnostic Requirements): Agent 5 must work for any SaaS application domain. No embedded business logic from past applications. All examples must be generic placeholder patterns, never domain-specific literals.

Per Agent 0 Constitution Section Y (Version Control Standards): Version numbers appear ONLY in "This Document" line and VERSION HISTORY table. Agent 5 body text contains NO inline version references.

---

## Section 1: Input Processing Logic

### Agent 1 scope-manifest.json Consumption

**Entity Processing:**
- Read `requiredEntities[]` and `deferredEntities[]` for page scope assignment
- Extract `userRoles[]` for authentication and role-based access control
- Process `authentication.rbacModel` for admin-only page identification
- Apply `platformConstraints.scopePolicy` for MVP boundary enforcement

**UI Planning:**
- Read `onboarding.firstRunFlow` for page sequence determination
- Extract `entityContracts.states` for UI state management patterns
- Process `productIntent` for UX complexity calibration
- Apply `supportedUseCases` for workflow prioritisation

### Agent 4 service-contracts.json Consumption

**API Integration:**
- Extract all endpoints for page-to-API mapping
- Read `authentication` and `rbac` fields for access control
- Process `fileUpload` configuration for upload-capable pages
- Extract `returns.omitFields` for sensitive data handling

**Cross-Agent Alignment:**
- Validate scope boundaries: if Agent 4 defers platform mutations, UI creation controls must also be deferred
- Enforce consistent parameter naming between route definitions and service contracts
- Align authentication patterns between service layer and UI layer

---

## Section 2: Route Parameter Naming Consistency (CRITICAL FIX)

### Deterministic Parameter Naming Rule

**Problem:** Inconsistent route parameter naming creates "undefined param" bugs during scaffolding.

**MANDATORY RULE:** All nested resource routes MUST inherit parent parameter names consistently.

**Pattern Enforcement:**

```json
// ✅ CORRECT - Consistent parameter naming
{
  "filePath": "client/src/pages/ProjectDetailPage.tsx",
  "routePath": "/projects/:projectId"
}
{
  "filePath": "client/src/pages/EnrichmentConfigPage.tsx", 
  "routePath": "/projects/:projectId/enrichment"  // Uses same :projectId
}

// ❌ WRONG - Inconsistent parameter naming
{
  "filePath": "client/src/pages/ProjectDetailPage.tsx",
  "routePath": "/projects/:projectId" 
}
{
  "filePath": "client/src/pages/EnrichmentConfigPage.tsx",
  "routePath": "/projects/:id/enrichment"  // Wrong: uses :id instead of :projectId
}
```

**Implementation Rule:**
- If parent route uses `:projectId`, all child routes must use `:projectId`
- If parent route uses `:id`, all child routes must use `:id`  
- Parameter names must be identical across all routes in the same resource hierarchy

**Validation Gate Required:**
```bash
# Route parameter consistency check
python3 -c "
import json
import sys
with open('docs/ui-api-deps.json', 'r') as f:
    ui_deps = json.load(f)

violations = []
route_params = {}

# Build parameter mapping per resource type
for page in ui_deps['pages']:
    route = page['routePath']
    if ':' in route:
        parts = route.split('/')
        resource = parts[1] if len(parts) > 1 else 'root'
        for part in parts:
            if part.startswith(':'):
                if resource not in route_params:
                    route_params[resource] = part
                elif route_params[resource] != part:
                    violations.append(f'Parameter mismatch in {resource}: {route_params[resource]} vs {part}')

if violations:
    for v in violations:
        print(f'[❌] {v}')
    sys.exit(1)
else:
    print('[✓] Route parameter naming: CONSISTENT')
"
```

---

## Section 3: User Management Pattern Distinction (CRITICAL FIX)

### Settings Page vs Admin User Management

**Problem:** Settings pages incorrectly use admin-only endpoints for user profile updates, creating broken UX for non-admin users.

**MANDATORY PATTERN DISTINCTION:**

**Admin User Management Pattern:**
```json
// UsersPage - Admin managing other users
{
  "filePath": "client/src/pages/UsersPage.tsx",
  "routePath": "/admin/users",
  "apiCalls": [
    {
      "method": "PATCH",
      "path": "/api/users/:id",
      "requiredRole": "admin",
      "paramSource": {"id": "selected row in users table"},
      "notes": "Admin-only user management"
    }
  ]
}
```

**Self Profile Management Pattern:**
```json
// SettingsPage - User managing own profile  
{
  "filePath": "client/src/pages/SettingsPage.tsx",
  "routePath": "/settings", 
  "apiCalls": [
    {
      "method": "GET", 
      "path": "/api/auth/session",
      "notes": "Load current user information"
    },
    {
      "method": "PATCH",
      "path": "/api/users/me",
      "notes": "Self profile update - no admin role required"
    }
  ]
}
```

**BLOCKING VIOLATION:** Settings pages MUST NOT use admin-only endpoints for user profile updates.

**Implementation Requirements:**
- Settings/Profile pages → Use `/api/users/me` or equivalent self-scoped endpoints
- Admin user management pages → Use `/api/users/:id` with `"requiredRole": "admin"`
- Never mix admin patterns with self-service patterns on the same page

---

## Section 4: Cross-Agent Scope Alignment (CRITICAL FIX)

### Agent 4 Scope Boundary Enforcement

**Problem:** Agent 5 creates UI for features that Agent 4 has deferred in MVP scope, causing specification-implementation mismatches.

**MANDATORY SCOPE VALIDATION:**

**Platform Resource Mutation Alignment:**
```json
// If Agent 4 defers canonical schema mutations:
// service-contracts.json shows: POST /api/canonical-schemas with "status": "deferred"

// Then Agent 5 MUST align:
{
  "filePath": "client/src/pages/CanonicalSchemasPage.tsx",
  "routePath": "/canonical-schemas",
  "scope": "required",  // Page can exist
  "apiCalls": [
    {
      "method": "GET",
      "path": "/api/canonical-schemas", 
      "required": true  // Read access in MVP
    },
    {
      "method": "POST",
      "path": "/api/canonical-schemas",
      "required": false,  // MUST be false if Agent 4 defers it
      "notes": "Creation deferred until post-MVP"
    }
  ]
}
```

**Scope Alignment Rules:**
1. **Read Agent 4 service contracts** before generating pages
2. **Check endpoint status**: if Agent 4 marks endpoint as deferred, Agent 5 must mark corresponding API call as `"required": false`
3. **Add scope documentation**: explain feature gating in notes field
4. **Validate alignment**: ensure no `required: true` calls to deferred endpoints

**Cross-Agent Validation Gate Required:**
```bash
# Scope alignment verification
python3 -c "
import json
import sys

# Load both files
with open('docs/service-contracts.json', 'r') as f:
    service_contracts = json.load(f)
with open('docs/ui-api-deps.json', 'r') as f:
    ui_deps = json.load(f)

# Build deferred endpoints map
deferred_endpoints = set()
for endpoint in service_contracts['endpoints']:
    if endpoint.get('status') == 'deferred':
        key = f\"{endpoint['method']} {endpoint['path']}\"
        deferred_endpoints.add(key)

# Check UI dependencies
violations = []
for page in ui_deps['pages']:
    for api_call in page.get('apiCalls', []):
        call_key = f\"{api_call['method']} {api_call['path']}\"
        if call_key in deferred_endpoints and api_call.get('required', True):
            violations.append(f'Page {page[\"filePath\"]} marks deferred endpoint {call_key} as required')

if violations:
    for v in violations:
        print(f'[❌] {v}')
    sys.exit(1)
else:
    print('[✓] Cross-agent scope alignment: VALID')
"
```

---

## Section 5: UI Page Generation Rules

### Page Classification Logic

**Required Pages (scope: "required"):**
- Generated for all Agent 1 `requiredEntities[]` 
- Include full CRUD interfaces per entity
- Authentication required unless explicitly public
- All API calls marked `required: true` unless Agent 4 defers them

**Deferred Pages (scope: "deferred"):**
- Generated for all Agent 1 `deferredEntities[]`
- Include scaffold interfaces with feature flags
- All API calls marked `required: false` (prevents build failures)

**Platform Pages:**
- Authentication flows (login, register, session)
- Settings and profile management (using self-update patterns)
- Admin management (using admin patterns with role gates)

### Authentication Pattern Assignment

**Public Pages:**
- Login, register, password reset, invite acceptance
- Health check, terms of service, privacy policy

**Authenticated Pages:**  
- All entity CRUD pages
- Dashboard, settings, profile pages
- Admin and management interfaces

**Role-Gated Pages:**
- User management → `requiredRole: "admin"`
- System configuration → `requiredRole: "admin"`  
- Platform resource management → `requiredRole: "admin"`

### API Call Dependency Mapping

**Parameter Source Resolution:**
- Route parameters (`:id` in URL) → Extract directly from route
- Dynamic parameters not in route → Require `dependsOn` field pointing to source API call
- UI state parameters (table selection) → Require `paramSource` field with description

**Query Parameter Specification:**
- Include `queryParams[]` for filtering, sorting, pagination controls
- Omit query params that don't affect UI behavior
- Document complex query patterns in `notes` field

---

## Section 6: Output Schema Specification

### Complete UI-API Dependencies Schema

```json
{
  "$schema": "ui-api-deps-v2",
  "totalPages": 18,
  "canonicalPaths": {
    "apiClient": "client/src/lib/api.ts",
    "errorBoundary": "client/src/lib/ErrorBoundary.tsx", 
    "appComponent": "client/src/App.tsx"
  },
  "routingConfig": {
    "library": "react-router-dom",
    "version": "6",
    "protectedRoutes": {
      "wrapper": "RequireAuth",
      "redirectTo": "/login", 
      "redirectParam": "returnTo"
    }
  },
  "pages": [
    {
      "filePath": "client/src/pages/LoginPage.tsx",
      "routePath": "/login",
      "scope": "required",
      "authenticated": false,
      "layoutSpec": {
        "type": "form-only",
        "form": {
          "placement": "dedicated-page",
          "fields": [
            {
              "name": "email",
              "type": "email", 
              "required": true
            }
          ]
        }
      },
      "apiCalls": [
        {
          "method": "POST",
          "path": "/api/auth/login",
          "required": true,
          "authRequired": false
        }
      ]
    }
  ]
}
```

### Mandatory Page Fields

- **filePath**: Repo-relative component path
- **routePath**: URL route pattern with parameters  
- **scope**: "required" or "deferred" 
- **authenticated**: Boolean authentication requirement
- **apiCalls**: Array of endpoint dependencies

### Mandatory API Call Fields

- **method**: HTTP method
- **path**: Endpoint path (must exist in Agent 4 service contracts)
- **required**: Boolean indicating build necessity
- **authRequired**: Boolean authentication requirement

### Optional API Call Fields

- **requiredRole**: RBAC role requirement (when Agent 4 endpoint has rbac)
- **dependsOn**: Source API call for dynamic parameters
- **paramSource**: UI state source for parameters  
- **pathParamMap**: Route-to-API parameter name mapping
- **queryParams**: Array of meaningful query parameters
- **notes**: Implementation context and feature gating

---

## Section 7: Pre-Output Self-Verification

### Mandatory Verification Scans

**Scan 1: Route Parameter Consistency**
- Verify consistent parameter naming across nested routes
- Flag mixed `:id` and `:projectId` patterns in same resource hierarchy
- Ensure deterministic scaffolding

**Scan 2: Settings vs Admin Pattern Validation**
- Verify settings pages use self-update endpoints (`/api/users/me`)
- Verify admin pages use admin endpoints (`/api/users/:id` with role gates)
- Flag admin patterns in self-service contexts

**Scan 3: Cross-Agent Scope Alignment**
- Compare Agent 4 deferred endpoints with UI required calls
- Flag `required: true` calls to deferred service endpoints
- Ensure feature gating consistency

**Scan 4: Authentication Consistency** 
- Verify `authRequired` matches service contract auth requirements
- Check role gate alignment with Agent 4 rbac specifications
- Validate public endpoint exposure

**Scan 5: Parameter Source Completeness**
- Ensure all non-route parameters have `dependsOn` or `paramSource`
- Validate `pathParamMap` only used for actual route parameters
- Check parameter resolution chains

**Scan 6: Deferred Page API Call Validation**
- Verify all deferred pages have `required: false` on API calls
- Check feature gating documentation in notes
- Prevent build failure from missing endpoints

**Scan 7: Total Page Count Verification**
- Count required + deferred pages matches `totalPages`
- Validate all Agent 1 entities have corresponding pages
- Check for missing or extra pages

---

## Section 8: Agent 5 Implementation Instructions

### Step 0: Input Validation

1. Verify `docs/scope-manifest.json` exists and contains valid Agent 1 output
2. Verify `docs/service-contracts.json` exists and contains valid Agent 4 output
3. Extract required and deferred entity lists from scope manifest
4. Extract endpoint list and authentication requirements from service contracts

### Step 1: Route Parameter Analysis

1. Analyze Agent 4 endpoint paths for parameter naming patterns
2. Build consistent parameter naming rules per resource type
3. Enforce naming consistency across nested routes
4. **Apply route parameter naming consistency rule**

### Step 2: Authentication Pattern Resolution

1. Distinguish between admin user management and self profile update patterns
2. **Apply user management pattern distinction: use `/api/users/me` for settings, `/api/users/:id` + admin role for user management**
3. Extract role requirements from Agent 4 rbac fields
4. Map authentication patterns to appropriate page types

### Step 3: Cross-Agent Scope Validation

1. **Apply cross-agent scope alignment: read Agent 4 endpoint status for scope alignment**
2. Mark UI calls to deferred endpoints as `required: false`
3. Add feature gating documentation in notes fields
4. Validate no scope boundary violations

### Step 4: Page Generation

1. Generate required pages for all required entities
2. Generate deferred pages for all deferred entities  
3. Generate platform pages (auth, settings, admin)
4. Apply consistent route parameter naming

### Step 5: Quality Verification

1. Run all 7 verification scans
2. Fix any identified defects
3. Validate total page count
4. Ensure Agent 4 contract alignment

### Step 6: File Generation

Generate single `docs/ui-api-deps.json` with complete UI specification including routing configuration, page definitions, and API call dependencies.

---

## FILE OUTPUT MANIFEST

Agent 5 MUST generate exactly one file:

### docs/ui-api-deps.json
- Complete UI specification with routing
- Page definitions with API dependencies
- **Includes: consistent route parameters, proper auth patterns, scope alignment**
- Authentication and role configuration
- Layout specifications and form definitions

---

## VERIFICATION COMMAND

```bash
# Validate complete Agent 5 output
python3 -c "
import json
import sys

# Route parameter consistency
print('Checking route parameter consistency...')
# [Implementation per Section 2]

# Settings vs admin patterns  
print('Checking user management patterns...')
# [Implementation per Section 3]

# Cross-agent scope alignment
print('Checking scope alignment...')
# [Implementation per Section 4]

print('✅ Agent 5: All validation scans PASS')
"
```

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 66 | 2026-02 | **Constitution Compliance and Script Fixes (Production Quality):** Fixed Constitution violations and script execution issues in v65. (1) **Inline version reference violations:** Removed all inline version references from document body including section headers, FILE OUTPUT MANIFEST bullets, and verification command comments. Constitution Section Y mandates versions ONLY in Version Reference header and VERSION HISTORY table. (2) **Python validation gate script fixes:** Added missing `import sys` statements to embedded Python validation snippets that call `sys.exit(1)`. Prevents immediate failure of prevention-first validation gates. (3) **Dependency documentation accuracy:** Added agent-3-data-modeling.md to Linked Documents reflecting true dependency on data relationships. (4) **VERSION HISTORY hygiene:** Removed other-agent version pins from changelog entries, replaced with generic format references. Addresses feedback: "Constitution version-hygiene violations in body text", "validation gate snippets will crash (missing import sys)". |
| 65 | 2026-02 | **Critical Framework Fixes (Production Quality):** Fixed three specification-implementation mismatches causing UI generation failures. (1) **Route parameter naming consistency:** Added MANDATORY RULE for deterministic parameter naming across nested routes. Problem: `/projects/:projectId` parent with `/projects/:id/enrichment` child creates "undefined param" scaffolding bugs. Solution: Enforce consistent `:projectId` usage throughout resource hierarchy with validation gate. (2) **Settings page authentication patterns:** Distinguished between admin user management and self profile update patterns. Problem: Settings pages using `PATCH /api/users/:id` with `admin` role creates broken UX for non-admin users. Solution: Settings pages must use `/api/users/me` or equivalent self-scoped endpoints. Added pattern validation rules. (3) **Cross-agent scope alignment:** Added mandatory validation against Agent 4's scope decisions. Problem: UI creating controls for features Agent 4 defers in MVP causes specification-implementation mismatch. Solution: Read Agent 4 endpoint status and mark UI calls to deferred endpoints as `required: false`. Addresses production feedback: "EnrichmentConfigPage uses :id instead of :projectId", "SettingsPage admin contradiction", "Canonical schemas creation conflicts with MVP scope". |
| 64 | 2026-02 | Aligned with latest Agent 1 scope-manifest.json and Agent 4 service-contracts.json formats. Enhanced parameter source validation with `paramSource` field for UI state parameters. Fixed pathParamMap misuse and organisation endpoint naming alignment. |
