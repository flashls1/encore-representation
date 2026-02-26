# SillCon 26 — Workspace Rules

> **These rules are LOCAL to the SillCon 26 workspace only.**

---

## ✅ BUILD IN PROGRESS

**Build was greenlit on 2026-02-17.** Implementation plan approved. Executing 8-phase production build per `implementation_plan.md`.

---

## 🚨 HARD RULE: DO NOT MODIFY `bun.lockb`

**Never modify, regenerate, or delete the `bun.lockb` file.** This is Lovable's build lockfile. If it is changed in any way, the site will break immediately on deploy. Treat it as a read-only, untouchable artifact.

- Do NOT run `bun install`, `bun add`, or any bun command that would regenerate it
- Do NOT delete it, move it, or overwrite it
- If dependencies need to change, they must be handled through the Lovable pipeline

---

## 🔄 Deployment Pipeline

**How this project deploys:**

```
Local Code → git push → GitHub → Lovable 2-way sync → Auto-rebuild & Deploy
```

1. We make changes locally and push to GitHub
2. GitHub has a **2-way sync** with Lovable.dev (project ID: `115c08f2-fab9-4ac7-ac04-c2f4c0b09e95`)
3. When code is pushed, Lovable picks up the changes, rebuilds, and deploys automatically
4. Changes made in the Lovable editor also sync back to GitHub

### ⚠️ CRITICAL: Lovable Rebuild Trigger

> **Lovable does NOT always auto-rebuild on push.** Its build cache can cause it to skip new commits. To **force a rebuild**, you MUST bump the build timestamp comment in `index.html` and include that in the push.

**Every push to production MUST include this step:**

```html
<!-- in index.html, line 2 -->
<!-- Build: YYYY-MM-DDTHH:MM -->
```

Update the timestamp to the current date/time before pushing. Without this, your code changes **will not deploy**.

### Git Remote

| Remote | Repo | Purpose |
|---|---|---|
| `origin` | `flashls1/sillcon-con-hub-723e12c4` | **Production** — triggers Lovable deploy |

**Standard push command:**
```bash
git push origin main
```

> **Important:** Because of the 2-way sync, the code must remain compatible with Lovable's build system. This means the `bun.lockb` lockfile and overall project structure must stay intact.

---

## ⚠️ Supabase Access Constraint

> **We have NO direct access to Supabase.** No CLI, no dashboard login, no migrations, no Edge Functions. The Supabase instance is fully managed by Lovable.dev.

**The ONLY way to modify Supabase** (schema, RLS policies, storage buckets, seed data, etc.) is through **SQL commands executed on Lovable's SQL editor dashboard.**

**Mandatory workflow for any Supabase change:**
1. Write the complete SQL snippet
2. Present it to the user with clear instructions
3. The user will copy-paste and run it on Lovable's SQL dashboard
4. Never attempt to run Supabase CLI commands, access the Supabase dashboard via browser, or assume direct DB access

This applies to: table creation, column changes, RLS policies, storage buckets, data seeding, function creation, and any other database-level operation.

## Project Context

- **Type:** Website overhaul / refresh of an existing project
- **Source:** GitHub repo `flashls1/sillcon-con-hub` (cloned into workspace)
- **Platform:** Built on Lovable.dev with GitHub 2-way sync
- **Mobile-First:** All designs and implementations MUST be mobile-friendly
  - Support all iPhone screen sizes (iPhone SE through iPhone 16 Pro Max)
  - Include proper viewport meta tags and responsive breakpoints
  - Test against all common small-screen resolutions

---

## Supabase Connection

| Key | Value |
|---|---|
| Project ID | `vyicjgxowsyerwzfirbk` |
| URL | `https://vyicjgxowsyerwzfirbk.supabase.co` |
| Anon Key | Set in `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Dashboard | `https://supabase.com/dashboard/project/vyicjgxowsyerwzfirbk` |
| Hosting | Supabase Cloud (free tier) |

---

## Design Requirements

- Responsive design targeting all modern iPhone models
- Breakpoints must cover:
  - iPhone SE (375×667)
  - iPhone 8 / SE 3rd gen (375×667)
  - iPhone 12 mini / 13 mini (375×812)
  - iPhone 12 / 13 / 14 (390×844)
  - iPhone 14 Pro / 15 / 15 Pro (393×852)
  - iPhone 14 Plus / 15 Plus (430×932)
  - iPhone 14 Pro Max / 15 Pro Max / 16 Pro Max (430×932)
  - iPhone 16 Pro (402×874)
  - Generic small screens down to 320px width
- Desktop and tablet layouts are also required but mobile is the priority
