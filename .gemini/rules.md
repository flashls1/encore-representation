# Encore Representation — Workspace Rules

> **These rules are LOCAL to the Encore Representation workspace only.**
> Last updated: 2026-03-06

---

## 🔒 WORKSPACE BOUNDARY LOCK

**This workspace is `/Users/flash/CODING PROJECTS/Encore` — NOTHING ELSE.**

- ✅ Read, write, modify files ONLY inside this directory
- ❌ NEVER touch TMPRO, SillCon, or any other project's files
- ❌ NEVER reference or use credentials from other projects
- ❌ NEVER modify files in `/Users/flash/CODING PROJECTS/TMPRO` or any sibling directory

**If you catch yourself about to access a file outside this workspace — STOP. You are wrong.**

---

## 🚨 SERVER ISOLATION — ENCORE ONLY

| Resource | Encore (✅ USE THIS) | TMPRO (❌ NEVER USE) |
|----------|---------------------|---------------------|
| **API URL** | `api.encorerepresentation.com` | `api.talentmanagementpro.com` |
| **Coolify App UUID** | `po4k0ows880ss8ccg4kkgo0g` | `togw08co0g4kcogk488skc80` |
| **Supabase Service UUID** | `s00gsowcgco444s448wskoks` | `b4ok40cwswc8cwwg44c0w0o4` |
| **DB Container** | `supabase-db-s00gsowcgco444s448wskoks` | `supabase-db-b4ok40cwswc8cwwg44c0w0o4` |
| **Coolify Project** | "The Girls Girl" → production | Different project |

**Cross-connecting these WILL break production for one or both projects.**

---

## 📋 MANDATORY PREFLIGHT

Before ANY of these operations, **re-read `.agent/PREFLIGHT.md`** — do NOT rely on memory:
- `ssh` commands
- `docker exec` commands
- `curl` to production APIs
- Database queries (DDL or DML)
- Coolify API calls (deploy, restart)
- `psql` via any method

**Copy the exact command from PREFLIGHT.md.** Do NOT type commands from memory.

---

## ⚡ JUST DO IT — No Unnecessary Questions

**If you have the ability to do something, DO IT. Do not ask Flash for permission.**

This includes:
- `git add`, `git commit`, `git push` — just do it
- `npm install` — just do it
- Coolify deploy API calls — just do it
- SSH commands for DB operations — just do it
- File reads, searches, verifications — just do it

**The only time you pause and ask** is for destructive operations defined in ALWAYS_ACTIVE.md Commandment 8 (rm -rf, dropping tables, truncating data, force-push to shared branches, major dependency upgrades).

---

## 🔄 SELF-CORRECTION PROTOCOL

1. **Before running a server command:** Check PREFLIGHT.md for the exact syntax
2. **If a command fails:** Do NOT retry the same command. Check PREFLIGHT.md "WHAT DOES NOT WORK" section for the correct alternative
3. **Before reporting a task complete:** Verify the actual results — read the output, confirm it matches expectations. If unsure, say so
4. **If you've seen this error before in this session:** Do NOT repeat the same approach. Reference the alternative from docs
5. **Schema operations:** ALWAYS run PostgREST schema discovery before assuming column names. Migration files may NOT match live DB

---

## 🚀 STARTUP REQUIREMENT

On every new session, run `/startup` to load all context files before doing any work.

---

## 🏗️ DEPLOYMENT PIPELINE

After ANY code change:
1. `npm run build` — must pass with zero errors
2. `git add -A && git commit -m "..." && git push origin main`
3. Deploy: `curl -s -X POST -H "Authorization: Bearer 1|ZQuSdx6eW3QlQXxRYva1U7nYuijWiZ2akcmbPCp92a50c908" "http://35.188.155.233:8000/api/v1/deploy?uuid=po4k0ows880ss8ccg4kkgo0g&force=true"`
4. Verify live within 60s

---

## 🎨 COLOR CONTRAST RULES (MANDATORY)

- **Gold/yellow backgrounds** → ALWAYS use black (#000000) text
- **Dark backgrounds** → ALWAYS use white/light text
- **Light backgrounds** → ALWAYS use dark text
- **Audit ALL pages** before deploying any UI change

## ADMIN CMS COLOR PALETTE
| Token | Value |
|-------|-------|
| Page background | #050505 |
| Card background | #111111 |
| Elevated surface | #1a1a1a |
| Input background | #0a0a0a |
| Accent (gold) | #d4af37 |
| Accent hover | #f5d060 |
| Primary text | #ffffff |
| Secondary text | #cccccc |
| Muted text | #888888 |
| Borders | #2a2a2a |
| Text on gold | #000000 |
| Error | #ef4444 |
| Success | #22c55e |
