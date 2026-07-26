# CLAUDE.md - Assistant Guidelines for Buyootna Monorepo

Welcome to the **Buyootna** codebase. This guide provides quick commands, architectural rules, and development practices for AI assistants working in this repository.

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

## 🏗️ Monorepo Structure & Package Mapping

This repository uses **PNPM Workspaces**.

| Directory | Package Name | Description |
| :--- | :--- | :--- |
| `apps/api` | `api` | NestJS REST & WebSocket Backend API (Prisma + PostgreSQL) |
| `apps/mobile` | `buyootna` | React Native & Expo Router Mobile Application |
| `apps/web/landing` | `@buyootna/web-landing` | Next.js Marketing & Landing Page |
| `apps/web/companies` | `@buyootna/web-companies` | Next.js Corporate / Company Portal |
| `apps/web/offices` | `@buyootna/web-offices` | Next.js Real Estate Agency / Office Portal |
| `apps/web/management` | `@buyootna/web-management` | Next.js Property Management Portal |
| `apps/web/admin` | `@buyootna/web-admin` | Next.js System Administrator Dashboard |
| `packages/ui` | `@buyootna/ui` | Shared UI components package |

---

## 📐 Architecture & Key Patterns

### 1. Backend API (`apps/api`)
- **Framework**: NestJS (v11) with TypeScript strict mode.
- **ORM**: Prisma (v7) with PostgreSQL (`@prisma/adapter-pg`).
- **Authentication**: Passport JWT strategy (`AuthGuard('jwt')`), Local strategy, and Twilio SMS OTP verification.
- **Testing**: Jest v29 + `ts-jest`. Always mock injected dependencies in `TestingModule` providers (`{ provide: ServiceName, useValue: {} }`).

### 2. Mobile App (`apps/mobile`)
- **Framework**: Expo (v54) + Expo Router (v6) + React Native (v0.81).
- **Styling**: NativeWind (v4) + TailwindCSS.
- **State & Validation**: Zustand + Zod (`loginSchema`, `signupSchema`).
- **Testing**: Jest v29 + `jest-expo`.

### 3. Docker & Deployment
- All web apps and API use multi-stage Dockerfiles matching the monorepo root build context (`context: .`).
- Production deployment runs automatically via GitHub Actions CD pipeline ([`.github/workflows/cd.yml`](file://.github/workflows/cd.yml)) on push to `main`.

---

## ⚠️ Important Gotchas & Rules

1. **Jest & Types Compatibility**: Both `apps/api` and `apps/mobile` must use **Jest v29** (`@types/jest@^29.5.14` and `jest@^29.7.0`). Do not upgrade Jest to v30 as `ts-jest` v29 and `jest-expo` require Jest v29.
2. **Lockfile Integrity**: Never keep individual `pnpm-lock.yaml` files inside sub-directories like `apps/api/pnpm-lock.yaml`. Always use the single root `pnpm-lock.yaml`.
3. **Branching**: Always commit and push feature work to the `dev` branch. Never push broken code directly to `main`.
