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
Goal: eventually **replace** the WordPress site entirely. Design direction
pivoted mid-build from "Luxury & High-End Wellness" to **Modern Clinical**
(light/navy/crimson, data-forward, lab-dossier feel) per Vu's feedback.
22+ age/compliance gate is live.

**Nothing on the WordPress site is touched by this project** — it's a
separate read-only reference (product data, business logic) for what to
rebuild, browsed locally at `c:\Vu\Peptide\Regenx`.

⚠️ **Not the same project as `D:\victor\Web-product-project`** — that's an
unrelated prior multi-niche dropshipping project on the same machine, same
`create-medusa-app` Turborepo template (hence identical `@dtc/*` package
naming — coincidence of template reuse, not a shared codebase). Don't
confuse the two; don't reuse its containers/ports.

GitHub: `github.com/PacificPep26/Regen-remake` (pushed, `main` branch).

---

## Where things live / URLs

| | Local | Railway (production) |
|---|---|---|
| Medusa Admin | http://localhost:9000/app | https://backend-pro.up.railway.app/app |
| Medusa API | http://localhost:9000 | https://backend-pro.up.railway.app |
| Storefront | http://localhost:8000 | https://regen-remake-production.up.railway.app (domain may get renamed — check the "Regen-remake" service's Networking tab for the current one) |
| Postgres | localhost:5434 (docker) | Railway `Postgres` service — get `DATABASE_URL`/`DATABASE_PUBLIC_URL` from its Variables tab |
| Redis | localhost:6381 (docker) | none yet — backend falls back to Medusa's in-memory event bus + fake redis, fine for current traffic level |
| Login credentials | `CREDENTIALS.local.txt` (gitignored, project root) | same admin email/password (DB was restored from local dump) |

Railway project name: **captivating-surprise**. Two GitHub-connected
services in it: **Backend** (Root Directory `apps/backend`) and
**Regen-remake** (Root Directory `apps/storefront` — confusing name, it's
actually the storefront service, not a repo-root service).

---

## Milestones — status

| | Status |
|---|---|
| Repo/folder scaffold, Docker infra, Medusa + Next.js scaffolded, npm→pnpm React-version fix | ✅ |
| WooCommerce → JSON export + import into Medusa — **36/36 real products, 9 categories, real images byte-copied** | ✅ |
| Storefront re-skinned end to end in Modern Clinical style (Nav, Hero, Footer, product cards, PDP, cart, search, side menu, trust bar, USA badge) | ✅ |
| US region + Standard ($8)/Express ($25) shipping (placeholder rates — real Shippo integration is Phase 8, not done) | ✅ |
| Payments: Stripe card provider registered (needs Vu's real `STRIPE_API_KEY`/`STRIPE_WEBHOOK_SECRET` — currently unset, provider auto-skips registration until then) + custom `manual-payment` module for **PayPal / Zelle / USDT** (real accounts from WalletUp, QR + address shown at checkout, staff confirm/capture manually in admin) | ✅ |
| 22+ / RUO entry gate (`middleware.ts` + `/[countryCode]/gate`) — researcher type + 2 checkboxes, signed cookie, redirects back to the originally-requested page | ✅ |
| Deployed to Railway (Backend + Storefront services + Postgres), local DB dumped and restored into Railway Postgres | ✅ (see Gotchas for the 3 build/runtime bugs that had to be fixed to get there) |
| COA module, house-code/trademark-masking module, VIP subscription billing, real Shippo live-rate shipping | ⬜ not started |
| Redirect-back-to-page after login/register | ⬜ not started |

---

## Run it locally

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

### Dump/restore the local DB (used to seed Railway's Postgres)

```bash
docker exec regenx-remake-postgres-1 pg_dump -U medusa -d regenx_remake --no-owner --no-privileges -F c -f /tmp/regenx_remake.dump
docker cp regenx-remake-postgres-1:/tmp/regenx_remake.dump ./regenx_remake.dump

# restore into any Postgres (e.g. Railway's public proxy URL):
docker run --rm -v "$(pwd)/regenx_remake.dump:/dump.dump" postgres:16-alpine \
  pg_restore --no-owner --no-privileges --clean --if-exists -d "<DATABASE_URL>" /dump.dump
```
`regenx_remake.dump` is gitignored — don't commit it (contains real data).

---

## Gotchas (learned the hard way)

- **`create-medusa-app <path>` treats `<path>` as a whole Turborepo root** —
  had to manually flatten the resulting nested structure. Pass the project
  root, not a sub-path, if re-scaffolding anything similar.
- **npm hoists one React version workspace-wide; pnpm doesn't.** Medusa
  admin needs React 18, Next.js storefront needs React 19 — fixed by
  switching the whole monorepo to pnpm.
- **Storefront runs on port 8000, not 3000.**
- **`medusa exec <script>` needs the dev servers stopped first** — it boots
  its own instance and fights over the Redis/in-memory workflow lock
  otherwise (`taskkill //F //IM node.exe` on Windows, then restart both
  dev servers after).
- **Docker Desktop doesn't auto-start** on this machine — launch manually
  and poll `docker ps` before `docker compose up -d`.
- **House-code slugs live on WooCommerce *variations*, not parent
  products** — export script checks variation slugs against the redirect
  map, not the parent's.
- **Local DB's `_regenx_coa_records` has charset corruption** in
  placeholder text — export skips COA entirely; real COA gets entered
  fresh once the `coa` module exists (Phase 4).
- **Custom payment providers need an explicit public constructor** —
  `AbstractPaymentProvider`'s constructor is typed `protected`, so a
  subclass with no explicit constructor gets inferred as `protected` too
  and fails `ModuleProvider`'s `Constructor<any>` type check at build time
  (`Cannot assign a 'protected' constructor type to a 'public' constructor
  type`). Fix: add `constructor(...args: any[]) { super(...args) }`
  explicitly (see `src/modules/manual-payment/service.ts`).
- **Stripe's payment module crashes the *entire* Medusa server at boot**
  if `apiKey` is an empty string (not just "Stripe won't work" — nothing
  starts). `medusa-config.ts` only registers the Stripe provider when
  `process.env.STRIPE_API_KEY` is actually set; add the real key to make
  card payments live.
- **Medusa's `medusa build` output must be deployed from `.medusa/server`,
  not the source root** — `medusa start` run directly from
  `apps/backend` can't find the built admin UI ("Could not find index.html
  in the admin build directory"). Railway's Backend service Build Command
  is `npm run build && cd .medusa/server && npm install`, Start Command is
  `cd .medusa/server && npm run start`.
- **`eslint-disable-next-line` referencing a rule that isn't in the
  project's eslint config fails lint itself** ("Definition for rule ...
  was not found") — `medusa build` runs lint as part of the build step, so
  this broke the Railway build. Don't reference rules unless they're
  actually configured.
- **Next.js's `next start -p 8000` ignores Railway's assigned `PORT`** —
  container was healthy/"Online" but Railway's proxy got 502
  ("Application failed to respond") because it routes to `$PORT`, not
  8000. Storefront's `start` script is now
  `next start -p ${PORT:-8000}` (falls back to 8000 locally where `PORT`
  isn't set).
- **A Railway service's "Suggested Variables" list scans the whole repo**,
  not just that service's Root Directory — don't blindly add everything
  it suggests to the Backend service; the `NEXT_PUBLIC_*` ones belong to
  the storefront service only.

---

## Next up

1. Confirm the Railway storefront deploy is actually reachable end-to-end
   (product browse → cart → checkout → payment) after the PORT fix.
2. Set real domains: once both Railway services have stable public URLs,
   update `NEXT_PUBLIC_BASE_URL` (storefront) and `STORE_CORS`/`ADMIN_CORS`/
   `AUTH_CORS` (backend) from the temporary `*`/placeholder values to the
   real ones.
3. Add Vu's real `STRIPE_API_KEY`/`STRIPE_WEBHOOK_SECRET` once his own
   Stripe account is ready — card payments go live automatically, no code
   change needed.
4. Continue the plan file's remaining phases: COA module → house-code
   module → real Shippo shipping → VIP subscription billing.
5. Redirect-back-to-page after login/register (`src/lib/data/customer.ts`
   `completeLogin`) — requested but not yet implemented.
