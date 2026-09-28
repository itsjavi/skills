## Tech preferences (not rules)

Only for greenfield web projects and prototypes.

When starting a web project from scratch, my preferred tech stack is:

- TypeScript 6, or 7 when tooling allows it, React + React Compiler, React Router (SSR or SPA) with file-routes-collector and react-router-markdown, TanStack Query, zod, Fastify, Base UI, StyleX for styling, Prisma ORM, PostgreSQL, Valkey + Glide for in-memory caching
- I prefer a FE/BE split instead of using React Router's actions/loaders heavily/directly connected to DBs and holding too much business logic
- forms with React Router actions/loaders and clientAction/clientLoader (calling the BE API) + zod validation, which makes a form library almost always unnecessary
- an api-contracts package with the zod schemas shared between FE and BE, so types flow end-to-end
- OpenAPI docs for the Fastify API, generated from the same zod schemas
- Better Auth for authentication, when needed
- for jobs and queues, depending on complexity: an in-process node scheduler for simple recurring tasks, pg-boss when Postgres is enough, or BullMQ when we need a full-featured queue (it has a Glide adapter)
- env config validated with zod at startup
- Vitest for unit/integration tests, and Playwright only for a handful of critical e2e flows (they are slow in CI)
- pino for logging (comes with Fastify) and OpenTelemetry for observability
- pnpm (latest version), node (latest stable), oxlint and oxfmt
- having an AGENTS.md and CLAUDE.md file referencing it, plus backlog.md integration when we need to start planning real features and recording tech/product docs and decisions.
- a monorepo with an apps and packages dirs using pnpm workspaces, when it's a big project with many apps (e.g. BE and FE)
- storylite over storybook to showcase design systems.

Only go full-stack when needed. I usually prefer an SPA prototype with fake data first, unless asked differently.
