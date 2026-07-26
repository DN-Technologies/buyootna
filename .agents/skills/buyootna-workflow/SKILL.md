---
name: buyootna-workflow
description: Custom skill for building, testing, database migrating, and validating Docker containers in the Buyootna monorepo.
---

# Buyootna Monorepo Operational Skill

Use this skill when developing, testing, or preparing production deployments for the Buyootna monorepo workspace.

---

## ⚡ Workflow Procedures

### 1. Database Schema Synchronization
When modifying `apps/api/prisma/schema.prisma`:
```bash
# Generate updated TypeScript Prisma Client
pnpm --filter api exec prisma generate --schema=prisma

# Push schema changes to development database
pnpm --filter api db:push
```

### 2. Running Test Suites
Execute test suites across both backend and mobile applications:
```bash
# Run NestJS Backend API tests
pnpm --filter api test

# Run Expo Mobile App tests
pnpm --filter buyootna test --passWithNoTests
```

### 3. TypeScript Type Checking
Verify static type safety before committing:
```bash
# Mobile application type check
npx --prefix apps/mobile tsc --noEmit

# Backend API type check
pnpm --filter api exec tsc --noEmit
```

### 4. Docker Build & Compose Validation
Validate Docker containers prior to deployment:
```bash
# Validate compose configuration
docker compose config

# Test local Docker image builds
docker compose build
```

---

## 🛑 Common Issues & Troubleshooting

- **`ts-jest` or Jest Version Mismatch**: Keep `jest` at `^29.7.0` and `@types/jest` at `^29.5.14` in both `apps/api` and `apps/mobile`.
- **NestJS Testing Injector Errors**: Ensure all constructor dependencies of tested controllers or services have matching `{ provide: Service, useValue: {} }` mock providers in `Test.createTestingModule`.
- **Docker Lockfile Mismatch**: Do not create or retain `pnpm-lock.yaml` inside `apps/api/`. All Docker builds use the monorepo root `pnpm-lock.yaml`.
