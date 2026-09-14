# PROGRESS — RegenX Labs Remake

Living status + context doc. Full design/architecture plan (why this exists,
every phase, compliance posture, payment/shipping design):
`C:\Users\HP\.claude\plans\work-on-the-membership-steady-spark.md`
(yes, that filename is unrelated/historical — it's the correct plan file,
just named from an earlier unrelated task in the same Claude session).

Last updated: 2026-09-14.

---

## What this is

A ground-up rebuild of **RegenX Labs** (research peptides e-commerce,
currently WordPress + WooCommerce at `c:\Vu\Peptide\Regenx`, live at
`regenxlabs.bio`) on **Next.js + Medusa v2**, in order to fully own the
Stripe integration instead of depending on an external dev (Edwin/
lunardigital) who gatekeeps a shared/pooled Stripe account on the WP site.
Goal: eventually **replace** the WordPress site entirely. Design direction:
**Luxury & High-End Wellness**, **Mobile-First**, 22+ age/compliance gate.

**Nothing on the WordPress site is touched by this project** — it's a
separate read-only reference (product data, business logic) for what to
rebuild, browsed locally at `c:\Vu\Peptide\Regenx`.

⚠️ **Not the same project as `D:\victor\Web-product-project`** — that's an
unrelated prior multi-niche dropshipping project (Casewin/Meridian
Optic/Odd Shelf/Kesten) on the same machine, same `create-medusa-app`
Turborepo template (hence identical `@dtc/*` package naming — coincidence
of template reuse, not a shared codebase). Don't confuse the two; don't
reuse its containers/ports.

---

## Where things live / URLs

| | URL / path |
|---|---|
| Medusa Admin | http://localhost:9000/app |
| Medusa API | http://localhost:9000 |
| Storefront | **http://localhost:8000** (NOT 3000 — template default) |
| Postgres (docker) | localhost:**5434** |
| Redis (docker) | localhost:**6381** |
| MinIO console/API (docker) | localhost:**9101** / **9102** (not wired into Medusa's File module yet — still local disk) |
| Login credentials | `CREDENTIALS.local.txt` (gitignored, at project root) |

Ports were deliberately chosen to NOT collide with `Web-product-project`'s
containers (which use 5433/6379/9001/9002) in case both need to run at once.

---

## Milestones — status

| | Status |
|---|---|
| Repo/folder scaffold at `D:\victor\regenx-remake` (clean subfolder — `D:\victor` root itself has unrelated personal files, do not use directly) | ✅ |
| `docker-compose.yml` — Postgres/Redis/MinIO on non-colliding ports | ✅ |
| Medusa v2 backend scaffolded (`create-medusa-app`), migrated, seeded with **demo** data (not RegenX products yet) | ✅ |
| Next.js storefront scaffolded (`nextjs-starter-medusa`), running against local backend | ✅ |
| Fixed: directory nesting bug from `create-medusa-app` (it treats the passed path as a full Turborepo root, not a single-app folder — see Gotchas) | ✅ |
| Fixed: duplicate/mismatched React versions (18 vs 19) across workspaces by switching npm → **pnpm** (see Gotchas) | ✅ |
| Custom Admin "View Store" sidebar link (`src/admin/routes/view-store/page.tsx`) — Medusa has no built-in admin→storefront link (unlike wp-admin's "Visit Site") since it's headless | ✅ |
| WooCommerce → JSON export script (`scripts/migration/export-from-wc.php`) — core product fields, categories, images, house-code/alias data | ✅ written, tested locally (36 products, 29 simple + 7 variable, 15 variations — counts match the live site) |
| COA (Certificate of Analysis) data migration | ⬜ **deliberately deferred** — local DB's COA data is all placeholder/pending text anyway (not real lab results), and has pre-existing charset corruption (see Gotchas). Re-enter real COA data directly in the new admin once the `coa` module is built (Plan Phase 4). |
| Import script (`scripts/migration/import-to-medusa.ts`) — products.json → Medusa Admin API | ⬜ not started |
| Product categories (8), house-code masking module, compliance gate, payment providers (Stripe card first, then manual-QR suite), Shippo shipping, VIP billing | ⬜ not started — see the plan file's phases 1–8 |

---

## Run it

```bash
cd D:\victor\regenx-remake

# 1. infra (first time or after reboot)
docker compose up -d

# 2. backend (admin at :9000/app) — separate terminal
pnpm run backend:dev

# 3. storefront (:8000) — separate terminal
pnpm run storefront:dev
```

Admin login: see `CREDENTIALS.local.txt`.

### Regenerate the WooCommerce product export

```bash
D:\xampp\php\php.exe D:\victor\regenx-remake\scripts\migration\export-from-wc.php > D:\victor\regenx-remake\scripts\migration\products.json
```
Reads the **local** WordPress DB (`regenx_local`) read-only — safe to
re-run anytime, touches nothing on the WP side.

---

## Gotchas (learned the hard way, this session)

- **`create-medusa-app <path>` treats `<path>` as a whole Turborepo root**,
  not "install a backend app here" — passing `apps/backend` as the target
  produced a nested `apps/backend/apps/backend` + `apps/backend/apps/storefront`
  structure. Had to manually move the real backend/storefront up and the
  wrapper's `node_modules`/`package.json`/`turbo.json`/etc. up to the true
  project root. If re-scaffolding anything similar, pass the **project
  root** as the target, not a sub-path.
- **npm hoists a single React version across the whole workspace; pnpm
  doesn't.** Medusa's admin dashboard needs React 18, the Next.js
  storefront needs React 19 — under npm both got tangled into one hoisted
  copy per package, causing `Uncaught Error: Objects are not valid as a
  React child` (the classic dual-React-instance symptom) and a blank admin
  page. Fixed by deleting all `node_modules` + `package-lock.json` and
  reinstalling with **pnpm** (added `pnpm-workspace.yaml`, set
  `packageManager: pnpm@12.3.4` in root `package.json`) — pnpm keeps each
  workspace's own resolved versions properly isolated. Confirmed after fix:
  backend resolves React 18.3.1, storefront resolves React 19.0.5,
  independently, no more crash.
- **pnpm's `ERR_PNPM_IGNORED_BUILDS`** — newer pnpm requires explicit
  approval for dependencies with postinstall scripts. Added an
  `allowBuilds:` block to `pnpm-workspace.yaml` (set to `true` for
  `@medusajs/telemetry`, `@swc/core`, `esbuild`, `msgpackr-extract`,
  `protobufjs`, `unrs-resolver` — all legitimate toolchain deps).
- **Storefront runs on port 8000, not 3000** — the scaffolded
  `nextjs-starter-medusa` here is configured `next dev --turbopack -p 8000`.
  Don't assume 3000.
- **Local DB's `_regenx_coa_records` has charset corruption** in some
  placeholder text (an em-dash got double-UTF8-encoded at some point
  pre-dating this project), which breaks PHP's strict-length
  `unserialize()` and makes `get_post_meta()` silently return `false` for
  affected products. Since all current COA data is confirmed placeholder/
  pending anyway, the export script **skips COA entirely** rather than
  fighting the corruption — real COA data gets entered fresh in the new
  admin later.
- **House-code slugs live on WooCommerce *variations*, not parent
  products** — e.g. parent product `smg1`'s slug is just "smg1"; its
  children are slugged `rp-100-10mg`/`rp-100-20mg` etc. (the actual
  house-code strings). The export script checks variation slugs against
  the redirect map, not the parent's slug — an earlier version of the
  script checked only the parent and found zero masked products, which
  was wrong.
- **Docker Desktop doesn't auto-start** on this machine and isn't always
  running — launch it manually (`"C:\Program Files\Docker\Docker\Docker
  Desktop.exe"`) and poll `docker ps` until it responds (~5-15s) before
  `docker compose up -d`.
- **Killing node processes on Windows**: `taskkill //F //IM node.exe` (kills
  ALL node processes — backend AND storefront both die, need to restart
  both after).

---

## Next up

1. Build `scripts/migration/import-to-medusa.ts` — read `products.json`,
   create categories then products/variants via Medusa's Admin API,
   byte-copy real image files (Vu's explicit "exact clone" requirement —
   no placeholder/regenerated images or paraphrased titles).
2. Before publishing anything live: **verify actual production publish/
   draft status** for the 4 Bundle SKUs and the GLP-1 products (SMG1/TRZ2)
   — local dev DB shows them all `publish`, but `CLAUDE.md` (WP project)
   documents them as `draft` on production for trademark/compliance
   reasons. Default every imported product to Medusa `draft` if unverified.
3. Then continue the plan file's phases in order: storefront re-skin
   (Luxury/Mobile-First) → compliance gate middleware → COA module →
   house-code module → Stripe card payment (priority) → manual-QR payment
   suite → VIP billing → Shippo shipping.
