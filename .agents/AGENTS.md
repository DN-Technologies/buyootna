# AGENTS.md - Agent Instructions & Coding Guidelines

This file provides rules, architectural directives, and constraints for all AI agents working on the **Buyootna** codebase.

---

## 📌 General Instructions

1. **Monorepo Execution Context**:
   - Always run commands from the repository root when using `pnpm --filter`.
   - Specify exact package names or paths when running package commands (e.g., `pnpm --filter api test`, `pnpm --filter buyootna test`).

2. **Never Guess API Schemas or Dependencies**:
   - Inspect exact source files (DTOs, Prisma schema, interfaces) before modifying or consuming data models.
   - Preserving existing API contracts and docstrings is mandatory.

3. **Empirical Verification Required**:
   - Never declare a task completed without running verification commands (`pnpm test`, `npx tsc`, or `docker compose config`).

---

## 🏗️ Code Style & Architecture Guidelines

### Backend API (`apps/api`)
- **Dependency Injection**: Always declare dependencies explicitly in NestJS modules. When creating `.spec.ts` unit tests, provide mock values for every constructor-injected service.
- **DTO Validation**: Use `class-validator` and `class-transformer` decorators for incoming payload validation.
- **Prisma Transactions**: Use `$transaction` for complex multi-table mutations (e.g., user registration with profile creation).
- **ESM/CJS Modules**: Ensure third-party libraries imported in CommonJS NestJS environments (like `uuid` v9) remain CJS-compatible.

### Mobile App (`apps/mobile`)
- **Component Architecture**: Keep components small, functional, and reusable.
- **Type Safety**: Enforce strict Zod schemas for all form inputs (`authSchemas.ts`).
- **Styling**: Use NativeWind Tailwind classes (`className="..."`). Avoid hardcoded pixel calculations for dynamic layouts.
- **RTL-First Layouts (Arabic)**: The app runs with forced RTL (`I18nManager.isRTL = true`).
  - **Child Ordering in `flex-row`**: In `flex-row`, Child 0 renders on the visual **RIGHT** (start) and subsequent children flow to the visual **LEFT** (end). Always order children in `flex-row` starting from visual RIGHT to visual LEFT.
  - **Co-linear Header Elements**: When a design specifies controls on the same horizontal level (e.g., Account Title on the visual right and Account Type selector pill on the visual left), place them in the same `flex-row items-center justify-between` container. Never displace one of them into a different row (like next to the top avatar).
  - **Action Button Rows**: In 3-button rows (`تعديل`, `معاينة`, `مشاركة`), Child 0 is visual RIGHT (`تعديل` - primary), Child 1 is middle (`معاينة`), Child 2 is visual LEFT (`مشاركة`).
  - **Avoid Hardcoded Absolute Inversions**: Avoid hardcoded absolute `left`/`right` positions that flip unexpectedly across iOS/Android. Use standard flex flows (`justify-start` for visual right, `justify-between` for split headers).

### Monorepo Workflows & CI/CD
- **Root Lockfile**: Maintain a single root `pnpm-lock.yaml`. Sub-directory lockfiles must be removed.
- **Docker Context**: Ensure all Dockerfiles in `apps/` receive the monorepo root (`context: .`) during Docker Compose builds.

---

## 🧪 Verification Commands Checklist

Before submitting changes, run:
1. `pnpm --filter api test` (Backend API Unit Tests)
2. `pnpm --filter buyootna test` (Mobile App Unit Tests)
3. `pnpm --filter buyootna exec tsc --noEmit` (TypeScript Verification)
4. `docker compose config` (Docker Validation)
