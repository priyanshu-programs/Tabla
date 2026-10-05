# Updates

The log of every change to this repository. `AGENTS.md` makes it mandatory.

**Rules**

- Add one entry for each work session, in the same turn as the change.
- Put the newest entry first.
- Do not edit or delete an older entry. Add a new entry that corrects it.
- Name the agent or the person. Give the local date and time.
- Do not put a secret in this file.
- A commit that changes `apps/` or `packages/` without this file is refused by
  `.githooks/pre-commit`.

**Entry format**

```
## YYYY-MM-DD HH:MM IST — <agent or person> — <short title>
- Changed: <files or areas>
- Why: <one sentence>
- Checked: <commands and results>
- Not done: <what is left, or "nothing">
```

---

## 2026-10-06 02:30 IST — Claude — Phase 5 check: shared Button in landing CTAs
- Changed: `apps/app/components/landing/hero.tsx`, `apps/app/components/landing/closing-cta.tsx`
- Why: Both files used raw `<Link>` styled as buttons, against `docs/design.md`. Replaced with `<Button asChild>` from `@crm/ui/components/button`, matching `landing-nav.tsx`.
- Checked: `bun run check-types` 13/13 pass. `bunx biome check` 0 errors on both files. `bun run build` 4/4 tasks pass.
- Not done: visual check skipped at owner's request. `graft build` not run.

---

## 2026-10-06 01:54 IST — Claude — Phase 8: hosting on free tiers, code only
- Changed: new `docs/hosting.md`, `infra/clock/worker.ts`,
  `infra/clock/wrangler.toml`, `apps/api/src/agent/agent-tick.controller.ts`,
  `apps/api/test/agent-tick.spec.ts`. Edited
  `apps/api/src/agent/{agent.module,agent-trigger.service,agent-dispatch.config}.ts`
  (route `POST /internal/agent/tick`, awaited `tick()`),
  `apps/agent/agent/channels/crm.ts` (route `POST /internal/crm/tick`, helper
  `drainQueues`), `apps/agent/agent/schedules/dispatch.ts` and
  `lib/dispatch-config.ts` (the schedule is daily, from `DISPATCH.schedule.cron`),
  `apps/api/vercel.json` and `apps/api/scripts/build-func.mjs` (both cron lists
  removed, region from `API_REGION`), `turbo.json`, `.env.example`, `plan.md`,
  `AGENTS.md` (one index row), `docs/{agent,api,environment,currency,tracking}.md`.
- Why: Vercel Hobby rejects a deploy that holds a cron more frequent than
  daily, and Neon's free compute cannot carry a one-minute clock. The clock is
  now a Cloudflare Worker that calls the API every 30 minutes.
- Checked: `bun run check-types` 13 of 13 tasks pass. `bun run lint:slop` pass.
  Biome pass on each new or edited file, with the line ending that the file
  has. `tsc --strict` pass on `infra/clock/worker.ts`. API tests 386 pass, 0
  fail, 5 of them new. Agent tests 358 pass, 1 fail:
  `brand-settle.integration.spec.ts`, the known local-timezone fault. Read-only
  check of Neon `portfolio-crm`: 56 of 56 migrations, same as the repository.
- Not done: nothing is deployed. No Vercel project and no Cloudflare Worker
  exists. `eve build` with `VERCEL=1` was not run, so the daily cron in the
  build output is not confirmed. No test covers `POST /internal/crm/tick` in
  the agent. The three free gateway models are not evaluated. `graft build`
  was not run. Nothing is committed.

## 2026-10-06 00:45 IST — Claude — Mandatory workflow and security rules
- Changed: new `plan.md`, `updates.md`, `docs/security-audit-prompt.md`,
  `tools/security-scan.ts`, `.githooks/pre-commit`. Edited `AGENTS.md`
  (new "Mandatory workflow" section, two index rows), `SECURITY.md` (new
  "Rules for agents that write code" and "Security audit procedure"),
  `package.json` (script `security:scan`), `.env.example` (`VIBE_GUARD_HOME`).
- Changed outside the repository: cloned vibe-guard to
  `C:\Users\USER\tools\vibe-guard` at commit `01e4ac9`. Added
  `VIBE_GUARD_HOME` to the local `.env`.
- Why: three agents edit this tree and no file recorded the plan or the changes.
- Checked: read the vibe-guard source before the first run. It has no
  dependencies and makes no network call. `bun run security:scan`: 879 files,
  0 critical, 15 high. All 15 examined once: 10 are Prisma tagged templates or
  test scripts, 4 are generated Prisma code, 1 is the chart style block.
  `.githooks/pre-commit` tested in six cases against a temporary index: it
  refuses a source change without `updates.md` and passes the other five.
  Biome lint, oxlint and `tsc --strict` pass on `tools/security-scan.ts`.
- Not done: the full audit with `docs/security-audit-prompt.md`. Hardening of
  `restamp()` in `apps/api/src/crm/activity-stamp.service.ts`. Nothing is
  committed.

## 2026-10-06 00:30 IST — Claude — Tabla rebrand repair and first full test run
- Changed: `apps/agent/test/workspace.spec.ts` and
  `packages/db/test/workspace-slug.spec.ts` (inputs and expected values that
  the rename left inconsistent). `apps/agent/agent/lib/socials.ts` (the
  `user-agent` header named the original company).
  `apps/app/components/enrichment-queue.tsx`,
  `agent-builder/new-agent-dialog.tsx`, `packages/ui/src/components/field.tsx`
  and `empty.tsx` (lime used as a text colour).
  `landing/product-shot/company-mark.tsx` (unused import).
  `agent-builder/agent-scope-badges.tsx` (alias `CompLogo`).
  `landing/landing-nav.tsx` (shared `Button`). `docs/api.md`,
  `docs/crm-plan.md`, `docs/plan/crm-plan.md` (upstream names).
- Why: Codex stopped on a usage limit before it verified the rebrand, and its
  rename was case-sensitive.
- Checked: `bun run check-types` pass. `bun run lint:slop` pass. Biome pass on
  the touched files. Tests: env 17, db 115, validation 5, context 31, auth 43,
  app 159, api 381 pass. Agent 358 pass, 1 fail:
  `brand-settle.integration.spec.ts`, because the local Postgres timezone is
  `Asia/Calcutta`. It passes with a UTC session. Created the `crm_test`
  database. Stopped a headless Chrome that Codex left on port 9224.
- Not done: `bun run build`, visual checks, keyboard check, network check,
  signed-in screens, `graft build`. The shared `Button` fix in `hero.tsx` and
  `closing-cta.tsx` was overwritten by the Antigravity agent at 00:26.

## 2026-10-06 00:26 IST — Antigravity agent — Larger landing page (logged by Claude from file times)
- Changed: new `packages/ui/src/components/motion/{config,marker,reveal,counter,marquee}.tsx`.
  New `apps/app/components/landing/{stats,signal-ticker}.tsx` and
  `landing/how-it-works/*`. Edited `landing/hero.tsx`, `closing-cta.tsx`,
  `product-shot/product-shot.tsx`, `apps/app/app/(landing)/page.tsx`,
  `packages/ui/src/styles/globals.css`.
- Why: not recorded. That agent wrote no log.
- Checked: nothing by Claude. Not type-checked and not built after these edits.
- Not done: review against `docs/design.md`. `hero.tsx` and `closing-cta.tsx`
  style raw links as buttons.

## 2026-10-05 22:40 to 2026-10-06 00:13 IST — Codex — Tabla rebrand (logged by Claude from the Codex session file)
- Changed: theme tokens in `packages/ui/src/styles/globals.css`, Inter font,
  `docs/design.md`. Tabla logo and wordmark in `packages/ui`. Favicons,
  manifest and metadata. New landing page and sign-in shell. `/` made public in
  `apps/app/proxy.ts`. Removed `packages/telemetry`, the API telemetry module,
  the agent telemetry hook, PostHog and three environment variables. Renamed
  the product in the interface, Slack flows, seed data, agent prompts, README
  and docs. About 125 files.
- Why: the owner approved the plan "Tabla product rebrand and landing entry".
- Checked: `bun run check-types`, app tests (159) and `bun run build` passed
  before its last two patches. One screenshot at 320px in light theme.
- Not done: Codex hit its usage limit and wrote no report. It ran no agent,
  API, auth, db or context test.
