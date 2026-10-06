# Hosting

Where each part of Tabla runs, on free plans that ask for no credit card. Every
limit here was read from the vendor's own page on 2026-10-06. Limits change:
check the linked page before you rely on a number.

## What hosts what

| Part | Host | Free allowance |
| --- | --- | --- |
| `apps/app` | Vercel Hobby, project `tabla-app` | 1M invocations, 100 GB transfer, 300 s functions |
| `apps/api` | Vercel Hobby, project `tabla-api` | Shares 4 CPU-hours and 360 GB-hours with the account |
| `apps/agent` | Vercel Hobby, project `tabla-agent` | The same shared pool |
| Agent run state | Vercel Workflow, automatic | 50,000 events and 1 GB written a month |
| Agent sandbox | Vercel Sandbox, automatic | 5 CPU-hours, 5,000 creations, 45-minute sessions |
| AI model | Vercel AI Gateway free tier, through OIDC | Free models only, rate-limited |
| Postgres | Neon, free plan | 100 CU-hours, 1 GB, 5 GB egress a month |
| Clock | Cloudflare Worker, `infra/clock` | 5 Cron Triggers, 100,000 requests a day |
| Sign-in and mail | Google Cloud OAuth client, or Microsoft Entra | No billing account needed |
| Domain | `*.vercel.app` | Included |

Three parts are optional and off by default. Each has a free host.

| Part | Host | Free allowance | Turn it on when |
| --- | --- | --- | --- |
| Logos and photos | Vercel Blob | 1 GB, 2,000 uploads a month | The install adds fewer than 2,000 records a month |
| Shared cache | Upstash Redis | 500,000 commands a month | Website tracking is on |
| Web search | Not chosen. See `plan.md`, Phase 3 | — | — |

## Two limits shape the design

**Vercel Hobby rejects a deploy that holds a cron more frequent than daily.**
The error names the expression. So no cron lives in `apps/api/vercel.json`, and
`DISPATCH.schedule.cron` in `apps/agent/agent/lib/dispatch-config.ts` is daily.

**Neon gives 100 compute-hours a month and sleeps after 5 idle minutes.** The
sleep timer is fixed on the free plan. Each clock tick wakes the database for
about 5.5 minutes. A fast clock keeps it awake all month, and Neon then
suspends the database until the next month.

| Clock interval | Compute-hours a month | Share of 100 |
| --- | --- | --- |
| 15 minutes | about 66 | 66 % |
| 30 minutes | about 33 | 33 % |
| 60 minutes | about 17 | 17 % |

The clock runs every 30 minutes. Work that a person starts does not wait for it:
the API pokes the agent when it writes an `AgentTask`.

## The clock

`infra/clock` is a Cloudflare Worker with two Cron Triggers. It holds one
secret, `CRON_SECRET`, and one variable, `API_URL`. It calls only the API.

| Trigger | Routes, in order |
| --- | --- |
| `*/30 * * * *` | `/internal/sync/mailboxes`, `/internal/agent/tick` |
| `0 4 * * *` | `/internal/tracking/retention`, `/internal/archive/prune`, `/internal/sync/rates` |

- **A cron expression lives in two files**: `crons` in `wrangler.toml` and the
  keys of `JOBS` in `worker.ts`. Change both. A trigger with no entry in `JOBS`
  throws, so the mistake shows in the Cloudflare dashboard.
- **A new cron route is one line in `JOBS`.** A route with no line is never
  called.
- **A failed route fails the run** after the other routes have been called.
- **The Worker never holds `AGENT_BRIDGE_SECRET`.** The API relays the tick to
  the agent. See "The clock in production is not the schedule" in
  `docs/agent.md`.

Any scheduler that sends `POST` with `authorization: Bearer <CRON_SECRET>`
works. Two fallbacks, both free and with no card:

- **cron-job.org.** One job for each route.
- **GitHub Actions**, on a public repository. A scheduled workflow runs late
  under load, and GitHub disables it after 60 days with no repository activity.

## Setup

1. **Neon.** Set autoscaling to 0.25–0.5 CU. Copy the pooled connection string
   and the direct one.
2. **Vercel.** Import the repository three times. A Hobby account connects
   only to a repository that a GitHub user owns, not an organisation.

   | Project | Root directory | Build command |
   | --- | --- | --- |
   | `tabla-api` | `apps/api` | `node scripts/build-func.mjs` |
   | `tabla-app` | `apps/app` | default |
   | `tabla-agent` | `apps/agent` | `eve build` |

3. **Regions.** Set `API_REGION` on `tabla-api` to the region of the database.
   Set the function region of the other two projects in their settings.
4. **Previews.** Turn off preview builds on all three. A preview shares the
   production database. See `docs/setup.md`.
5. **Variables.** Set them from the table below. Redeploy all three projects,
   because a changed variable needs a new build.
6. **Google Cloud.** Enable the Gmail API and the Calendar API. Make the
   consent screen External and publish it to "In production". Add the redirect
   URI `<API_URL>/api/auth/callback/google`.
7. **Cloudflare.** Put the API URL in `infra/clock/wrangler.toml`. Then:

   ```sh
   cd infra/clock
   bunx wrangler deploy
   bunx wrangler secret put CRON_SECRET
   ```

8. **Tabla.** Sign in. Open Settings and pick a model whose price is zero.

| Variable | app | api | agent |
| --- | --- | --- | --- |
| `DATABASE_URL` (pooled) | yes | yes | yes |
| `DIRECT_DATABASE_URL` | — | yes | — |
| `BETTER_AUTH_SECRET` | yes, the same value | yes | — |
| `ALLOWED_SIGN_IN` | — | yes | — |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | — | yes | — |
| `API_URL`, `APP_URL`, `AGENT_URL` | yes | yes | — |
| `AGENT_BRIDGE_SECRET` | yes | yes | yes |
| `CRON_SECRET` | — | yes | — |
| `API_REGION` | — | yes, at build | — |

The app reads the database and verifies the session itself. `apps/app/lib/session.ts`
imports the Prisma client, and `apps/app/turbo.json` passes both variables to the
build. So the app needs `DATABASE_URL` at build time and at run time, and
`BETTER_AUTH_SECRET` must hold the same value as the api. A different value makes
the app reject the api's cookie, and the browser bounces between `/sign-in` and
`/`.

Do not set `AUTH_COOKIE_DOMAIN`. `vercel.app` is a public suffix, and the app
proxies the API, so the cookie is same-origin already. Do not set
`AI_GATEWAY_API_KEY` on Vercel: OIDC covers the gateway.

## Checks after a deploy

```sh
curl -s -o /dev/null -w "%{http_code}\n" "$AGENT_URL/eve/v1/health"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$API_URL/internal/agent/tick"
curl -s -X POST -H "authorization: Bearer $CRON_SECRET" "$API_URL/internal/agent/tick"
bunx wrangler tail tabla-clock
```

The first prints `200`. The second prints `403`. The third prints
`{"agent":"reached"}`. The fourth shows each route and its status on the next
tick.

After one week, read three usage pages: Neon compute-hours, Vercel Active CPU,
and Vercel Workflow events. Lengthen the clock interval if Neon passes 50 %.

## Limits that a user meets

- **A passed limit pauses that feature for up to 30 days.** Nothing is billed.
  This holds for Vercel functions, Workflow, Sandbox and Blob, and for Neon
  compute until the month ends.
- **About 250 to 500 agent research runs a month.** This is an estimate from
  the 50,000 Workflow events. Measure it in the first week.
- **The free models are rate-limited**, and Vercel decides which models are
  free. A request over the limit gets `429` and eve retries it.
- **`DEFAULT_AGENT_MODEL` is a paid model.** A fresh install has no working
  agent until someone picks a free model in Settings.
- **Google sign-in holds 100 users for the life of the OAuth project**, and
  shows an "unverified app" screen. Verification removes both and is not free.
  Do not leave the consent screen in "Testing": a refresh token then expires in
  7 days and the mailbox sync stops.
- **Blob stops serving stored images** when the 2,000 uploads are passed. That
  is why it is off by default.
- **Without Redis the tracking rate limit counts per instance.** A serverless
  deployment has many instances.
- **Vercel Hobby is for personal, non-commercial use.** A business needs Vercel
  Pro, or its own Node host with `eve start`.

## Hosts that do not fit

| Host | Reason |
| --- | --- |
| Cloudflare Workers, for the apps | eve builds for Vercel or for a Node server. The sandbox and the workflow state need an operating system. |
| Cloudflare R2 | Asks for a payment method to enable the free tier. |
| Render free | Sleeps after 15 minutes. No disk, so agent run state is lost on restart. |
| Koyeb, Fly.io, Railway, Oracle Cloud, Google Cloud Run | Card or paid trial. |
| Supabase Postgres | Pauses a free project after 7 idle days. |
| AI Gateway with your own provider key | Needs purchased credits. |
| A direct Gemini, Groq or OpenRouter key | Free, but needs new code in `apps/agent`. |

## Sources

- Vercel: `/docs/plans/hobby`, `/docs/cron-jobs/usage-and-pricing`,
  `/docs/limits`, `/docs/limits/fair-use-guidelines`, `/docs/ai-gateway/pricing`,
  `/docs/sandbox/pricing`, `/docs/workflows/pricing`,
  `/docs/vercel-blob/usage-and-pricing`
- Free models: `https://ai-gateway.vercel.sh/v1/models`, entries tagged `free`
- Neon: `https://neon.com/pricing`
- Cloudflare: `https://developers.cloudflare.com/workers/platform/limits/`
- Upstash: `https://upstash.com/pricing/redis`
- eve: `apps/agent/node_modules/eve/docs/guides/deployment/` and `schedules.mdx`
