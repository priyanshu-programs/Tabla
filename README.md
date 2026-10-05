# Tabla

Tabla is the AI-native CRM that keeps customer work moving.

It combines current customer records, on-demand context, and agent-driven work in one workspace.

## What Tabla includes

- Company, contact, deal, activity, and conversation records.
- Google and Microsoft mailbox synchronization.
- Google, Microsoft, and SSO sign-in through Better Auth.
- Slack connections for agent workflows.
- A durable research agent built with Eve.
- Website tracking and form intake for first-party customer activity.

## Sign in

Tabla does not use a separate sign-up route.

An approved first Google, Microsoft, or SSO sign-in creates the account.

The `ALLOWED_SIGN_IN` setting controls approved email addresses and domains.

## Local setup

Read [docs/setup.md](docs/setup.md) before starting local services.

```bash
bun install
cp .env.example .env
bun run db:deploy
bun run db:seed
bun run dev
```

The web app uses port `3000` by default.

The API uses port `3001` by default.

The agent uses port `2000` by default.

## Repository structure

```text
apps/app       Next.js web application
apps/api       NestJS API and tRPC server
apps/agent     Eve agent runtime
packages/auth  Better Auth configuration
packages/db    Prisma schema and database helpers
packages/ui    Shared components and theme
packages/validation  Shared boundary schemas
```

## Development

```bash
bun run check-types
bun run lint
bun run test
bun run build
```

Run `bun run db:test` before database-backed test suites.

## Documentation

- [Local setup](docs/setup.md)
- [API architecture](docs/api.md)
- [Agent architecture](docs/agent.md)
- [Environment variables](docs/environment.md)
- [Connections](docs/connections.md)
- [Design system](docs/design.md)
- [Telemetry policy](docs/telemetry.md)

## License

Tabla is available under the MIT License.

See [LICENSE](LICENSE) for the complete notice.
