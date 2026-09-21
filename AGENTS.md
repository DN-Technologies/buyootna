# AGENTS.md - Agent Instructions for Buyootna Monorepo

Welcome to the **Buyootna** codebase. This file is an entry point, not the
full picture — read [`docs/ai/context.md`](docs/ai/context.md) first, on
every task, before touching any code. It has the project overview, the
routing table for the rest of `docs/ai/`, and the rules that apply
regardless of task type. This file exists mainly to make sure that
happens, plus a quick command reference below.

`CLAUDE.md` at the repo root is this file's twin for Claude Code — same
routing, same commands, kept in sync. Don't let the two drift; update
both together.

---

## 🛠️ Common Commands

### Development
```bash
# Backend API (NestJS)
pnpm --filter api start:dev

# Mobile App (Expo / React Native)
pnpm --filter buyootna start

# Web Workspace Applications (Next.js)
pnpm --filter "./apps/web/*" dev
```

### Building
```bash
# Build Backend API
pnpm --filter api build

# Build Web Applications
pnpm --filter "./apps/web/*" build

# Generate Prisma ORM Client
pnpm --filter api exec prisma generate --schema=prisma
```

### Testing & Verification
```bash
# Run Backend API Unit Tests (Jest v29)
pnpm --filter api test

# Run Mobile App Unit Tests (Jest v29)
pnpm --filter buyootna test --passWithNoTests

# Type Check Mobile App
npx --prefix apps/mobile tsc --noEmit
```

### Database Operations
```bash
# Push schema changes to database (Development)
pnpm --filter api db:push

# Create / Apply Prisma migrations
pnpm --filter api prisma:migrate

# Apply production migrations
pnpm --filter api prisma:migrate:deploy
```

### Docker Commands
```bash
# Validate Compose file configuration
docker compose config

# Build all production Docker images
docker compose build
```

---

## Start here: `docs/ai/`

Read [`docs/ai/context.md`](docs/ai/context.md) before starting any task.
It routes you to the rest — architecture, testing, security, release, code
review, glossary — only reading what's relevant to the task at hand
instead of loading everything up front. It also has the monorepo package
map and the handful of rules that apply to every task regardless of type
(Jest v29 pin, single lockfile, branching, empirical verification).

If a task would change something documented as a rule or contract in one
of those files, stop and get explicit approval before proceeding — see
`context.md`'s closing section for the exact expectation.
