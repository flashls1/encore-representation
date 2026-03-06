---
description: Startup protocol for the Encore Representation workspace
---

# Startup Protocol — Encore Representation

// turbo-all

Run these steps in order when Flash types `startup`.

## 0. Workspace Boundary Lock
**Before doing ANYTHING**, internalize these hard limits:
- **Working directory:** `/Users/flash/CODING PROJECTS/Encore`
- **Forbidden:** ANY file outside this workspace (TMPRO, SillCon, or any sibling)
- **Identity:** This is **Encore Representation** — NOT TMPRO, NOT SillCon
- **Server:** GCP `35.188.155.233`, Coolify project "The Girls Girl", Supabase service `s00gsowcgco444s448wskoks`
- **API:** `api.encorerepresentation.com` ONLY — NEVER `api.talentmanagementpro.com`
- **Self-correction:** Before running any server command, re-read it from PREFLIGHT.md. If a command fails, do NOT retry — check PREFLIGHT for the correct approach. Before reporting done, verify actual results.

## 1. Load Session Context
Read the session context file to restore full project awareness:
```
cat ".agent/SESSION_CONTEXT.md"
```

## 2. Load Preflight (Infrastructure, Shortcuts & Constraints)
Read infrastructure reference with CLI commands and HARD CONSTRAINTS:
```
cat ".agent/PREFLIGHT.md"
```

## 3. Load Project DNA
Read coding conventions to prevent style drift:
```
cat ".agent/PROJECT_DNA.md"
```

## 4. Load Tech Debt Radar
Check for outstanding tech debt:
```
cat ".agent/TECH_DEBT.md"
```

## 5. Check Git Status
Verify the working tree state:
```
git status --short
```

## 6. Check for Uncommitted Changes
If there are uncommitted changes, report them to Flash before proceeding.

## 7. Verify Dependencies
Ensure node_modules are installed:
```
ls node_modules/.package-lock.json 2>/dev/null && echo "✅ node_modules present" || echo "⚠️ Run npm install"
```

## 8. Verify Production Health
Check the live site is responding:
```
curl -so /dev/null -w "Live site: %{http_code}\n" https://encorerepresentation.com
```

## 9. Check Coolify App Status
Verify the deployment pipeline is healthy:
```
curl -s -H "Authorization: Bearer 1|ZQuSdx6eW3QlQXxRYva1U7nYuijWiZ2akcmbPCp92a50c908" "http://35.188.155.233:8000/api/v1/applications/po4k0ows880ss8ccg4kkgo0g" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Coolify status: {d[\"status\"]} | Last online: {d.get(\"last_online_at\",\"?\")}')"
```

## 10. Verify Supabase API
Quick check that PostgREST is responding (this is the only reliable CLI access to the DB):
```
curl -so /dev/null -w "Supabase API: %{http_code}\n" -H "apikey: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTY1MjI4MCwiZXhwIjo0OTI3MzI1ODgwLCJyb2xlIjoiYW5vbiJ9.--2EG7_4nH4OT3MNaE7dvYff8UKqkEzI9JEzUnpG4i4" "https://api.encorerepresentation.com/rest/v1/"
```

## 11. Report Ready
After loading all context, confirm readiness to Flash with a brief status:
- Current branch and git state
- Production site HTTP status
- Coolify deploy status
- Supabase API status
- Any tech debt flagged
- Any pending issues from last session
- Confirmation: "🐃 Yak is online. Encore workspace loaded. All systems green."

---

## SOPs (Standard Operating Procedures)

### After ANY code change:
1. `npm run build` — zero errors required
2. `git add -A && git commit && git push origin main`
3. Deploy: `curl -s -X POST -H "Authorization: Bearer 1|ZQuSdx6eW3QlQXxRYva1U7nYuijWiZ2akcmbPCp92a50c908" "http://35.188.155.233:8000/api/v1/deploy?uuid=po4k0ows880ss8ccg4kkgo0g&force=true"`
4. Verify live within 60s

### Data operations (CRUD on tables):
Use PostgREST curl with service role key (see PREFLIGHT.md for templates).
**NEVER use the browser for data operations.**

### Schema discovery (before writing code that references DB columns):
```bash
SVC_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTY1MjI4MCwiZXhwIjo0OTI3MzI1ODgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.82vucf3sWMdUKF5ewlvVDII-TVTiG3ItoMOyrrm-930"
curl -s -H "apikey: $SVC_KEY" -H "Authorization: Bearer $SVC_KEY" \
  "https://api.encorerepresentation.com/rest/v1/" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for name, defn in d.get('definitions', {}).items():
    cols = list(defn.get('properties', {}).keys())
    print(f'{name}: {cols}')
"
```
**ALWAYS run this before assuming column names from migration files.** Migrations may NOT have been applied.

---

## ⛔ HARD CONSTRAINTS — Do Not Violate

1. **NO `psql` direct** — Encore postgres has no host port mapping. Don't try.
2. **NO Studio pg-meta API via curl** — It uses session cookies, returns HTML 404.
3. **NO browser-based SQL as first choice** — It's 10x slower than curl.
4. **NO `supabase` CLI against Encore** — Not linked to self-hosted instance.
5. **ALWAYS verify DB schema via PostgREST `/` before writing code** — Migration files may be out of sync with actual DB.
6. **ALWAYS commit, push, and deploy after code changes** — Flash tests on production.
7. **NEVER cross-connect Encore and TMPRO credentials.**
8. **NEVER modify files outside `/Users/flash/CODING PROJECTS/Encore`.**
9. **NEVER report a task as complete without verifying the actual results.**
10. **NEVER ask Flash to do something you can do yourself.** Commits, pushes, deploys, installs, SSH commands — just do it. Only pause for destructive operations (rm -rf, dropping tables, truncating data, force-push).
