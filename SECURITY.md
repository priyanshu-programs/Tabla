# Security Policy

## Reporting a vulnerability

Please report privately through **Security → Report a vulnerability** on this repository, not in a
public issue.

Include the revision, your configuration, the impact, and the steps to reproduce it. If it involves
real data, describe the shape of it rather than pasting it.

We'll acknowledge within a few working days and tell you what we intend to do. This is a small
project and there is no bounty.

## What this is, and what it assumes

This CRM is built for **one organisation of authenticated internal users**. It is not a hardened
public or multi-tenant service boundary, and the design says so out loud in a few places. The
limits below are real and worth reading before you put customer data in it.

**Sign-in is the entire authorisation model.** `ALLOWED_SIGN_IN` decides who gets in; after that,
every signed-in person can read and write every record. There are no roles, no per-record
permissions and no organizations — deliberately, because a permissions check that always returns
`true` reads like a real one at review time. If you need someone to see only part of the pipeline,
this is the wrong tool today.

An unset `ALLOWED_SIGN_IN` fails closed: nobody can sign in. A list that names a consumer domain
(`gmail.com`) is an open door, which is why single addresses are supported.

**Operators can read everything.** Whoever runs the deployment has the database, the environment
and the logs. Nothing here protects data from the person hosting it.

**The agent reads your mail.** Gmail and Calendar access is a condition of signing in, because
reading the mailbox is what the CRM is for. The research agent reads message bodies, meeting
attendees and signature blocks belonging to real people who did not sign up for this. It is
deliberately unrestricted on the *read* side and constrained on the *write* and *egress* sides —
see `apps/agent/agent/skills/data-boundaries.md`. If you deploy this, you are the data controller
for those mailboxes.

**Outbound calls send data to third parties.** Each optional key in `.env.example` turns on a
vendor the agent can query, and a query carries whatever it needs to ask the question — typically a
name, an email domain and an employer. With no keys set, nothing leaves your infrastructure except
Google's own APIs. That is the default.

**The sync route is guarded by a shared secret.** `POST /internal/sync/google` is called by a cron,
so it has no session to check; `CRON_SECRET` is the whole guard and the route refuses to run
without it. Treat it like a password.

**Session cookies depend on one shared value.** The API and the web app both verify sessions
against `BETTER_AUTH_SECRET`. Rotating it signs everyone out, which is the intended way to revoke
every session at once.

## Deploying it safely

- Set `ALLOWED_SIGN_IN` to a domain you control. Never a public mail provider.
- Generate `BETTER_AUTH_SECRET` yourself (`openssl rand -base64 32`). The value in any example file
  is not a secret.
- Serve both processes over HTTPS. Secure cookies switch on with `NODE_ENV=production`.
- Set `CRON_SECRET` if you expose the sync route at all.
- Keep the database off the public internet.
- Start with no optional API keys and add them one at a time, so you know what is leaving.

## Rules for agents that write code

These rules are mandatory for every agent and every person who changes this
repository. `AGENTS.md` points here. Read this section before you touch auth,
secrets, user input, a new route, a raw query or a dependency.

The stack is Next.js, NestJS with tRPC, Prisma on a server-only Postgres, and
Better Auth. The browser has no database client. Rules about row level security
do not apply, because no client holds a database key.

### Secrets

- Do not write a key, a token, a password or a connection string in source code.
- Do not put a secret behind `NEXT_PUBLIC_`. That prefix sends the value to the browser.
- Do not print a secret or an environment value in a log, a toast or an error.
- Declare each variable that the API reads in `apps/api/src/config/env.validation.ts`.
  A missing required variable stops the API at startup.
- Document each new variable in `.env.example`. Do not commit `.env`.
- Do not paste a real secret into `plan.md`, `updates.md`, a test or a fixture.

### Database

- Use the Prisma client, or a tagged `$queryRaw` / `$executeRaw` template. Those
  bind their values.
- Do not build SQL with string concatenation. Do not use `$queryRawUnsafe` or
  `$executeRawUnsafe`.
- `Prisma.raw()` is for a table or a column name from a fixed list in the code.
  It never receives a value that a user sent.

### Authentication and identity

- A route is protected unless `apps/app/proxy.ts` names it public. Add a route
  to the public list only when the user approves it.
- Each new tRPC procedure and each new controller checks the session, or checks
  a shared secret when a cron or a webhook calls it. A route without a guard is
  a defect.
- Take the user identity from the session. Do not read `userId` or
  `workspaceId` from the request body or the query string.
- `ALLOWED_SIGN_IN` is the whole authorisation model. Do not add a path that
  creates a session without that check.
- Session tokens stay in httpOnly cookies. Do not put a token in
  `localStorage`, `sessionStorage` or a URL.

### Input and output

- Parse each input on the server with Zod. A check in the browser is not a
  security control. See "Parse at the boundary" in `AGENTS.md`.
- Do not use `dangerouslySetInnerHTML` or `innerHTML` with content that a user
  or an outside page supplies.
- A request that changes data uses POST, PUT, PATCH or DELETE. It never uses GET.
- An error that reaches the client contains no stack trace, no SQL, no file
  path and no variable name.
- A webhook handler verifies the signature before it reads the body.
- Fetch an outside URL through `@crm/db/safe-fetch`. A URL from a vendor or a
  user is a request-forgery risk.

### Dependencies

- Before you install a package, confirm that it exists, that it is the
  well-known one, and that the name has no spelling error. Agents invent
  package names, and attackers publish malware under those names.
- Commit `bun.lock` with each dependency change.
- Remove a package that no file imports. `bun run lint:dead` lists them.

### Limits and boundaries

- A route that calls a paid service has a server-side rate limit. A sign-in
  route has one also. A limit that lives only in process memory resets on each
  deploy, so it does not count.
- CORS names our own origins. Do not send `Access-Control-Allow-Origin: *` on a
  route that reads a session.
- Check the type and the size of an uploaded file on the server. Check the
  content type, not only the file extension.

**Don't** — trust the body for identity, and build the query by hand:

```ts
const { userId, name } = req.body;
await db.$queryRawUnsafe(`UPDATE "user" SET name = '${name}' WHERE id = '${userId}'`);
```

**Do** — parse the input, take identity from the session, bind the values:

```ts
const { name } = updateNameInput.parse(input);
await db.user.update({ where: { id: ctx.session.user.id }, data: { name } });
```

## Security audit procedure

Run the audit before a release, and after a change to auth, to a route guard or
to a raw query. Use this order.

### 1. Run vibe-guard first

[vibe-guard](https://github.com/IAmUnbounded/vibe-guard) is an MIT pattern
scanner for code that an AI assistant wrote. It has no dependencies, it reads
files only, and it makes no network call. The reviewed commit is
`01e4ac9c07d6f2a7a7fb6b59ee4c512d55f80e96`. Read the diff before you move to a
later commit.

```
git clone https://github.com/IAmUnbounded/vibe-guard <a folder outside this repository>
```

Set `VIBE_GUARD_HOME` in `.env` to that folder. Then:

```
bun run security:scan
bun run security:scan --min-severity medium
bun run security:scan --min-severity high --fail-on high
```

The script is `tools/security-scan.ts`. It scans `apps` and `packages` only.

**Do not point vibe-guard at the repository root.** It reads `.env` files and
prints each line that matches. A scan of the root prints your secrets into the
terminal and into the agent transcript.

The scanner matches text. It does not understand Prisma. These results are
known false positives:

- `VG003` on a tagged `$queryRaw` or `$executeRaw` template. Prisma binds those values.
- Any result in `packages/db/src/generated`.
- `VG007` in `packages/ui/src/components/chart.tsx`. The style block is built
  from the chart config in code, not from user content.

Examine each remaining result. Do not dismiss a result without a reason.

### 2. Run the full audit prompt

Give the agent `docs/security-audit-prompt.md`, unchanged. It contains eight
sections and a report format. Each checklist item gets its own verdict.

Notes for this repository:

- Items 2.1 to 2.6 and 3.3 are about Supabase. Mark them "not applicable:
  server-only Postgres through Prisma, no client database key". Item 2.7 and
  item 2.8 still apply.
- Item 3.1 and item 3.2: the middleware is `apps/app/proxy.ts`. The API guards
  are in `apps/api/src`.
- Item 5.1: the command is `bun audit`.

### 3. Record the result

Add an entry to `updates.md` with the date, the vibe-guard counts, the posture
rating and each finding that is still open. Add each fix that is not done to
`plan.md`.

## Supported versions

`main` is the only supported branch. There are no backports.

## Dependencies

Dependencies are updated deliberately rather than automatically. If you spot a vulnerable
transitive dependency, report it the same way as anything else — a PR bumping it is welcome, but
tell us what the exposure is, since a CVE in a dev-only tool and one in the request path deserve
different urgency.
