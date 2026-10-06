# Plan

This is the one plan for this repository. Every agent reads it before it writes
code. `AGENTS.md` makes that mandatory. The log of completed work is
`updates.md`.

**How to use this file**

- Do the work in the order of the "Open work" list.
- When an item changes state, change the status table in the same turn.
- When the work is new, add it here first. Then do it.
- Do not put a secret in this file.

## Goal

Tabla is an open-source CRM that a person hosts with free tools, with no credit
card. This repository began as a copy of `trycompai/crm`. Two things block the
goal:

1. The original code needs Context.dev, a paid service. Our own package,
   `packages/context`, replaces it. That work is half done.
2. The code carried the original company's name, branding and telemetry. The
   rebrand to Tabla removes them.

## Working rules from the owner

- Stop at the end of each phase. Report in simple terms. Wait.
- Ask before each commit.
- Do not push to `origin`. It is `github.com/trycompai/crm`. The owner's
  repository is the `tabla` remote.
- The branch is `feat/context-engine`.

## Status

| Phase | What | State |
| --- | --- | --- |
| 0 | Branch `feat/context-engine` | Done |
| 1 | Brand data from the company site. Key page removed | Done. Commit `96bf086` |
| 2 | Site reading for briefs and team photos | Done. Commit `b51167e` |
| 3 | People data: LinkedIn preview, search, Gravatar | Not started |
| 4 | Remove the Context.dev package, key column and old docs | Not started |
| 5 | Rename to Tabla: theme, logo, landing, sign-in, telemetry removal | Done. Commit `be68f5e` |
| 5a | Larger landing page: motion, stats, ticker, "how it works" | Committed in `be68f5e`. Not deployed. |
| 6 | Push to the `tabla` remote | Done. `f9d5d0b` on `feat/context-engine` |
| 7 | Tabla's own interface, built new | Logged. Not planned |
| 8 | Hosting on free tiers: Vercel Hobby, Neon, Cloudflare clock | `tabla-app` and `tabla-api` are live. The redirect loop is fixed. Sign-in now fails at the Google token exchange with `invalid_code`. The agent and the clock are not deployed. |
| W | Mandatory workflow: `plan.md`, `updates.md`, graft, security rules | Done. Committed in `be68f5e` |
| S | Full security audit | Not started. Procedure is in `SECURITY.md` |

## Open work, in order

### 0. Raw SQL `NOW()` writes the wrong instant on a database that is not UTC

Every timestamp column is `TIMESTAMP(3)`, with no time zone. All 159 of them.
Prisma writes a UTC instant into such a column. Raw SQL `NOW()` writes the
session wall clock instead. On a database that is not UTC the two disagree by
the offset of the zone.

1. `apps/agent/test/brand-settle.integration.spec.ts`, line 44: use
   `(NOW() AT TIME ZONE 'UTC')`. The test fails on an IST database without it.
   Done.
2. `apps/agent/agent/lib/slack-people.ts`, lines 196, 210 and 211: the same
   `NOW()` pattern runs in production. A self-hoster on a database that is not
   UTC gets a wrong `updatedAt`, `createdAt` and `classifiedAt`. Not done.
3. Decide one rule for the whole repository. Either move the columns to
   `TIMESTAMPTZ`, or forbid `NOW()` in raw SQL and add a lint rule. Not done.

### 1. Finish the checks for Phase 5

Start only when no other agent is editing `apps/app/components/landing`.

1. Put the shared `Button` back in `apps/app/components/landing/hero.tsx` and
   `closing-cta.tsx`. They style raw `<Link>` elements as buttons, against
   `docs/design.md`. The pattern is in `landing-nav.tsx`.
2. `bun run check-types`, then `bunx biome check` on the changed paths.
3. `bun run build`.
4. Start the built app. Check `/` and `/sign-in` at 320px, 768px and 1440px,
   in light and in dark. Set the theme through `next-themes` storage.
5. Check keyboard order and visible focus on both pages.
6. Read the browser network log. No request goes to an analytics host.
7. Check the signed-in screens in the new theme. The owner signs in first.
8. `graft build`.

### 2. Commit, on the owner's approval

Two commits at least: Phase 2 files, then rebrand and workflow files. No
`Co-Authored-By` trailer.

Stage the new hook with its executable bit, or it does not run on Linux and
macOS: `git add --chmod=+x .githooks/pre-commit`.

Phase 2 files: `packages/context/src/{host,home,site,team}.ts` and their tests,
`apps/agent/agent/tools/{research_company,write_company_brief}.ts`,
`apps/agent/agent/lib/{portrait-sources,context-config,context-dev,dispatch}.ts`,
`apps/app/lib/agent-transcript.ts`.

### 3. Close Phase 2

1. `packages/context/src/site.ts`: after `fetchPages`, drop a page whose final
   host differs from the home page host.
2. Run the context tests, the agent tests, `bun run check-types` and
   `bun run lint:slop` again.

### 4. Phase 3 — people

1. Measure first. Fetch 20 public LinkedIn profile URLs with `readPage`. Record
   the status codes. If fewer than 6 succeed, ship the search source only.
2. Add `person.ts` and `search.ts` to `packages/context`.
3. `apps/agent/agent/lib/people.ts`: remove the Context client. Use the new
   sources.
4. `lib/portrait-sources.ts`: add a Gravatar source.
5. `lib/capabilities.ts`: remove the `CONTEXT_DEV` ids. Add `COMPANY_SITE`,
   `LINKEDIN_PREVIEW` and `WEB_SEARCH`.
6. Add `SEARXNG_URL` to `.env.example` and to the turbo pass-through lists.

No LinkedIn source logs in, uses a proxy, a cookie or a retry loop.

### 5. Phase 4 — remove the vendor

1. Delete `apps/agent/agent/lib/context-dev.ts` and the `context.dev` package.
2. Remove the Context key functions from `packages/db/src/settings.ts`.
3. Migration: drop `AppSetting.contextDevApiKey`.
4. Add `docs/context.md` and its row in the `AGENTS.md` table.
5. Check: a search for `context.dev` in `apps` and `packages` finds nothing.

### 6. Security audit (item S)

Follow "Security audit procedure" in `SECURITY.md`. vibe-guard first, then
`docs/security-audit-prompt.md`.

Known from the first scan on 2026-10-06: 15 high results, all examined once and
all false positives. One site needs hardening:
`apps/api/src/crm/activity-stamp.service.ts`, `restamp()` takes the table and
the column as `string`. Change the two types to fixed unions.

### 7. Phase 6 — push

Push `feat/context-engine` to `tabla` only. Run `git remote -v` first.

### 8. Phase 8 — hosting

The whole plan, the limits and the setup steps are in `docs/hosting.md`.

1. Code: the tick route in `apps/api`, the tick route in `apps/agent`, the
   clock in `infra/clock`, and the removal of every cron that Vercel Hobby
   rejects. Done on 2026-10-06. Left: build the agent with `VERCEL=1` and
   confirm that `.vercel/output/config.json` holds only the daily cron.
2. `bun install` fails on Vercel without `DATABASE_URL`. The `postinstall` of
   `@crm/db` runs `prisma generate`, and `prisma.config.ts` resolved the
   datasource with prisma's `env()` helper, which throws at module load.
   `prisma.config.ts` now sets the datasource only when the variable exists.
   `docs/hosting.md` now says the app needs `DATABASE_URL` and the api's
   `BETTER_AUTH_SECRET`, because `apps/app/lib/session.ts` reads the database.
   Done on 2026-10-06. Commit `34dab9a`, pushed to `tabla`.
3. `tabla-app` is live at `https://tabla-app-seven.vercel.app`, from commit
   `34dab9a`, in `sin1`. Its root directory is `apps/app`, previews are off, and
   it holds `DATABASE_URL`, `BETTER_AUTH_SECRET`, `AGENT_BRIDGE_SECRET` and
   `APP_URL`. The database is the Neon project `steep-snow-81337543`, at 56 of 56
   migrations.
4. `tabla-api` is live at `https://tabla-api.vercel.app`. `/api/auth/ok` returns
   200, so Nest boots and `ALLOWED_SIGN_IN` is set. `tabla-agent` does not exist.
   The owner creates it. The Vercel connector returns 403 on every
   project-creation path, and now on every read of this scope. `tabla-api` takes
   the repository root, not `apps/api`. See `docs/hosting.md`.
4a. The `build` task in `apps/app/turbo.json` declared `env` without `API_URL`.
   A package task `env` replaces the root list, so `next build` never saw the
   variable and `next.config.ts` inlined `http://localhost:3001`. Sign-in returned
   502 on the live app. The task now declares `API_URL` and `APP_URL`. Done on
   2026-10-06. Committed on 2026-10-06. `/api/auth/ok` returns 200 on
   `tabla-app-seven.vercel.app` through the proxy, so the redeploy is confirmed.
4b. The OAuth callback landed on the api host, so the session cookie never
   reached the app and sign-in returned to `/sign-in`. `packages/auth` now builds
   `baseURL`, the Slack redirect and the SSO callback from `env.authBaseUrl`,
   which is the first value of `APP_URL`. `/sign-in` also shows the OAuth error
   now. Done on 2026-10-06. Commit `b1cb833`, pushed to `tabla`. Left, for the
   owner: add
   `https://tabla-app-seven.vercel.app/api/auth/callback/google` and
   `http://localhost:3000/api/auth/callback/google` in Google Cloud, set
   `APP_URL` on `tabla-api` with the browser host first, redeploy both projects,
   then sign in. Google accepts the new URI now, and the callback reaches Tabla.
4c. Sign-in fails at the next step with `?error=invalid_code`. Better Auth raises
   it when the Google token exchange throws. Every environment value is trimmed
   now, because a padded `GOOGLE_CLIENT_SECRET` on `tabla-api` is the leading
   suspect. The cause is unconfirmed. Left, for the owner: read `tabla-api` →
   Logs for the real error from Google, re-paste `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` with no padding, and redeploy `tabla-api`.
5. After they exist: set `API_URL` and `AGENT_URL` on all three, copy
   `ALLOWED_SIGN_IN`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the root
   `.env` to `tabla-api`, set `DIRECT_DATABASE_URL`, `CRON_SECRET` and
   `API_REGION`, then add the Google redirect URI.
6. Deploy the clock to Cloudflare.
7. Pick a free model on the Tabla settings page.
8. After one week, read the Neon, Vercel and Workflow usage pages.

## Decisions that wait for the owner

1. Set the local Postgres timezone to UTC. One agent test fails without it.
2. Delete `adrs/comp-palette.md`, or mark it superseded. It describes the old
   green palette.
3. Remove the `posthog-instrumentation` skill from `.agents/skills`.
4. Install `mdn` and bind Median, or remove the Median section from `AGENTS.md`.
5. Rename the Slack, Google and Microsoft applications in their consoles.
6. Delete the unused `CRM_TELEMETRY_DISABLED` line from `.env`.
7. Change `DEFAULT_AGENT_MODEL` in `packages/db/src/settings.ts` to a free
   model. Today it is a paid model, so a fresh free install has no working
   agent until the owner picks a model in Settings.
8. Vercel Hobby allows personal, non-commercial use only. Decide what the
   README tells a business that wants to host Tabla.

## Do not change

- The `@crm/*` package scope. It is in every import.
- `AUTH_COOKIE_PREFIX = "crm"`. A change signs every user out.
- Database names and old migrations.
- `LICENSE`. The MIT notice of the original authors stays.

## Known faults on this machine

- `bun run db:test` does not read the root `.env`. Load the variables into the
  shell first.
- Full `bun run lint` fails on Windows line endings in files that nobody changed.
- The first API test file can time out on a cold run. A second run passes.
- Claude, Codex and the Antigravity agent all edit this tree. Read `updates.md`
  and check file times before you edit a shared area.
