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
  - **Absolute Positioning in RTL**: React Native's Yoga layout engine swaps `left` and `right` in RTL (`left` maps to `start` / visual RIGHT, and `right` maps to `end` / visual LEFT).
    - To position an absolute badge/element on the visual **RIGHT**, use logical `start` (e.g., `style={{ start: -4 }}` or `start-[-4px]`), NEVER `right-[-4px]` which inverts to the visual LEFT.
    - To position an absolute element on the visual **LEFT**, use logical `end` (e.g., `style={{ end: -4 }}` or `end-[-4px]`).
  - **Input Writing Direction (`writingDirection`)**:
    - **Arabic Text Inputs**: Use `style={{ writingDirection: 'rtl', textAlign: 'right' }}`.
    - **Phone Numbers, Emails, Numeric & Latin Inputs**: MUST ALWAYS use `style={{ writingDirection: 'ltr', textAlign: 'right' }}`. Applying `writingDirection: 'rtl'` to phone numbers swaps the leading `+` sign and punctuation to the wrong side (e.g. `+965` flips to `965+`).
  - **Compound Phone Number Fields**:
    - When a phone field has a country code pill (`+965`), strip any existing `+965` / `965` prefix from initial state values so users never see a duplicated `+965` prefix inside the text box.
    - On submit, ensure the phone number is formatted with `+965` before sending to the backend API.
  - **Co-linear Header Elements**: When a design specifies controls on the same horizontal level (e.g., Account Title on the visual right and Account Type selector pill on the visual left), place them in the same `flex-row items-center justify-between` container. Never displace one of them into a different row (like next to the top avatar).
  - **Centered Screen Titles**: In header rows with `[Back Button] [Title] [Spacer]`, give the title `flex-1 text-center` so it remains perfectly centered between symmetric side controls.
  - **Action Button Rows**: In 3-button rows (`تعديل`, `معاينة`, `مشاركة`), Child 0 is visual RIGHT (`تعديل` - primary), Child 1 is middle (`معاينة`), Child 2 is visual LEFT (`مشاركة`).

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
