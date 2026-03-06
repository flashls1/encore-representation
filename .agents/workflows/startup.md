---
description: Startup protocol for the Encore Representation workspace
---

# /startup Workflow — Encore Representation

## Step 1: Load Workspace Context
1. Read this file for workspace rules
2. Check `git status` to understand working state
3. Read `src/index.css` admin theme section for current color system

## Step 2: Check Workspace Health
```bash
cd "/Users/flash/CODING PROJECTS/Encore" && git status && npm run build 2>&1 | tail -5
```

---

# ⚠️ STRICT CONSTRAINTS — NEVER VIOLATE

## COLOR CONTRAST RULES (MANDATORY)

**RULE 1: NEVER place light text on a light background.**
- ❌ White text on gold/yellow background
- ❌ White text on light gray background
- ✅ Black text on gold/yellow background
- ✅ White text on dark/black background

**RULE 2: NEVER place dark text on a dark background.**
- ❌ Black text on black/dark background
- ❌ Dark gray text on dark background
- ✅ White text on black background
- ✅ Gold text on black background

**RULE 3: Gold/Yellow backgrounds ALWAYS get black (#000000) text.**
- Every button, badge, pill, or element with `backgroundColor: #d4af37` or `var(--accent)` MUST have `color: #000000`
- This includes shadcn `<Button>` default variant, inline-styled buttons, tab pills, badges

**RULE 4: Audit ALL pages before deploying UI changes.**
- After any theme/color change, visually scan EVERY admin panel component for contrast violations
- Check: buttons, labels, inputs, badges, pills, cards, headings
- No "I'll fix it later" — contrast issues are blockers

## ADMIN CMS COLOR PALETTE
- **Page background**: #050505 (near-black)
- **Card background**: #111111
- **Elevated surface**: #1a1a1a
- **Input background**: #0a0a0a
- **Accent (gold)**: #d4af37
- **Accent hover**: #f5d060
- **Primary text**: #ffffff (white)
- **Secondary text**: #cccccc
- **Muted text**: #888888
- **Borders**: #2a2a2a
- **Text on gold**: #000000 (always black)
- **Error**: #ef4444
- **Success**: #22c55e

## DEPLOYMENT PIPELINE
1. `npm run build` — must pass with zero errors
2. `git add -A && git commit -m "..." && git push origin main`
3. Coolify deploy: `curl -s -X POST -H "Authorization: Bearer 1|ZQuSdx6eW3QlQXxRYva1U7nYuijWiZ2akcmbPCp92a50c908" "http://35.188.155.233:8000/api/v1/deploy?uuid=po4k0ows880ss8ccg4kkgo0g&force=true"`
4. Wait ~80s, verify: `curl -so /dev/null -w "%{http_code}" https://encorerepresentation.com`
