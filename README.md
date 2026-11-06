# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), hosted on Cloudflare Workers, with data in Neon Postgres and sign-in through Neon Auth.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- **Hosting:** Cloudflare Workers (`wrangler.deploy.jsonc`)
- **Data:** Neon Postgres. `lib/db.ts` connects with `@neondatabase/serverless` over HTTP; `lib/db-core.ts` keeps the `DB.prepare(sql).bind(...).first()/all()/run()` and `DB.batch()` API the routes use and rewrites `?` placeholders for Postgres
- **Schema:** `db/postgres/schema.sql` (tables) and `db/postgres/seed.sql` (starter resources). The old D1 migrations in `drizzle/` are kept for history only
- **Sign-in:** Neon Auth (`@neon/auth`). `lib/auth/server.ts` sets it up, `app/auth/*` handles the forms, `middleware.ts` finishes Google sign-in and refreshes sessions, and `lib/access.ts` maps the Neon user to a `neon:<id>` row in `users`
- `cloudflare-env.d.ts` lists every runtime variable

## Neon setup

Current project: Neon `careeros` (`divine-band-41792701`, AWS Singapore `aws-ap-southeast-1`, Postgres 18), with Neon Auth on the `neondb` database.

1. **Create the project.** At [neon.tech](https://neon.tech) (or `npx neonctl projects create`), create a project in a region close to your users. Copy the **pooled** connection string from **Connect**.
2. **Load the data.** Export the live D1 database, then import it:
   ```sh
   pnpm exec wrangler d1 export careeros-db --remote --config wrangler.deploy.jsonc --output careeros-d1.sql
   DATABASE_URL='postgresql://...' node scripts/neon-import.mjs careeros-d1.sql
   ```
   The import creates the tables, copies every row, adds starter content and prints source vs. target row counts. It refuses to run if the Neon database already has users. Rehearse first with `node scripts/neon-import.mjs careeros-d1.sql --local` (nothing is sent anywhere). For a fresh database with no old data, run `db/postgres/schema.sql` then `db/postgres/seed.sql` in the Neon SQL Editor instead.
3. **Turn on Neon Auth.** In the Neon Console open **Auth** and enable it (or `neonctl neon-auth enable`), and copy the **Auth URL**. Add `https://careeros.nmtricone.workers.dev` as a trusted domain, keep **Google** enabled under OAuth providers, and turn on **require email verification** with the **OTP** method (the shared email sender only supports codes). Neon's shared Google keys and email sender are for development: they show Neon branding. For production, add your own Google OAuth client and email provider.
4. **Set the Worker secrets**, then deploy:
   ```sh
   pnpm exec wrangler secret put DATABASE_URL --config wrangler.deploy.jsonc
   pnpm exec wrangler secret put NEON_AUTH_BASE_URL --config wrangler.deploy.jsonc
   pnpm exec wrangler secret put NEON_AUTH_COOKIE_SECRET --config wrangler.deploy.jsonc   # 32+ random characters: openssl rand -base64 32
   pnpm exec wrangler secret put APP_URL --config wrangler.deploy.jsonc                   # https://careeros.nmtricone.workers.dev
   pnpm exec wrangler secret put ADMIN_EMAIL --config wrangler.deploy.jsonc               # your sign-in email
   pnpm build && pnpm exec wrangler deploy --config wrangler.deploy.jsonc
   ```
   For local preview, put the same names in `.dev.vars` (git-ignored).

## Accounts and existing data

Workspace pages require sign-in; signed-out visitors go to `/login` and return to the page they asked for. API routes answer `401` instead of redirecting.

- **Email and password** or **Google**, both through Neon Auth. New password accounts confirm their email with a 6-digit code (`/verify-email`); password reset also uses an emailed code (`/forgot-password` → `/reset-password`).
- **Earlier Supabase accounts:** when someone signs in with the same email, their old resumes, jobs and history move to the new account, but only after Neon Auth has verified the email address.
- **Guest workspaces** (from the no-sign-in period): the browser's `careeros_guest` cookie is still recognised, and that guest's work moves into the account on first sign-in.
- **Admin:** set `ADMIN_EMAIL` to a verified email (or `ADMIN_USER_ID` to the Neon user ID shown on `/admin`).

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally (needs `DATABASE_URL` and the Neon Auth values in `.dev.vars`)
- `node scripts/neon-import.mjs <d1-export.sql> [--local]`: load a D1 export into Neon

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon Auth](https://neon.com/docs/auth/overview)
