# Buyootna (بيوتنا) Real Estate Platform Monorepo

Welcome to the **Buyootna** codebase—a multi-platform real estate management ecosystem supporting mobile applications, backend services, and web administration portals.

---

## 🏛️ Architecture & Monorepo Overview

This repository is structured as a **PNPM Workspace** containing the following applications and packages:

```
buyootna/
├── apps/
│   ├── api/             # NestJS REST & WebSocket API (Prisma + PostgreSQL)
│   ├── mobile/          # React Native & Expo Router Mobile App (iOS / Android)
│   └── web/             # Next.js Web Portals Workspace
│       ├── landing/     # Marketing & Landing Web Application
│       ├── companies/   # Corporate & Company Real Estate Portal
│       ├── offices/     # Real Estate Agencies & Offices Portal
│       ├── management/  # Property Management Portal
│       └── admin/       # System Administrator Dashboard
├── packages/
│   └── ui/              # Shared UI Component Library
├── .github/
│   └── workflows/       # CI/CD GitHub Actions Pipelines (ci.yml, cd.yml)
└── DEVELOPMENT_AND_DEPLOYMENT.md
```

---

## 🚀 Technology Stack

- **Backend**: NestJS 11, Prisma ORM 7, PostgreSQL, AWS S3 Storage, Twilio SMS/OTP, Socket.io
- **Mobile**: React Native 0.81, Expo 54, Expo Router 6, NativeWind, Zustand, Zod
- **Web Applications**: Next.js 15, React 19, TailwindCSS
- **Monorepo Tools**: PNPM Workspaces, Docker & Docker Compose, GitHub Actions CI/CD

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v22 LTS
- **Package Manager**: `pnpm` (v10)
- **Container Engine**: Docker & Docker Compose

### 1. Installation
Clone the repository and install workspace dependencies:
```bash
git clone git@github.com:constyoussef/buyootna.git
cd buyootna
pnpm install
```

### 2. Database & Environment Setup
Generate the Prisma ORM Client and sync the database schema:
```bash
# Generate Prisma Client
pnpm --filter api exec prisma generate --schema=prisma

# Sync schema with local/dev database
pnpm --filter api db:push
```

### 3. Running Services Locally

- **Backend API**:
  ```bash
  pnpm --filter api start:dev
  ```
- **Mobile Application**:
  ```bash
  pnpm --filter buyootna start
  ```
- **Web Applications**:
  ```bash
  pnpm --filter "./apps/web/*" dev
  ```

---

## 🧪 Testing & Verification

Run verification commands prior to submitting pull requests:

```bash
# Test Backend API Unit Tests
pnpm --filter api test

# Test Mobile App Unit Tests
pnpm --filter buyootna test --passWithNoTests

# Static Type Check (Mobile App)
npx --prefix apps/mobile tsc --noEmit

# Validate Docker Compose Configuration
docker compose config
```

---

## 🚢 CI/CD & Deployment

- **Continuous Integration (CI)**: Automatically runs unit tests, type-checks, and Docker builds on pull requests via [`.github/workflows/ci.yml`](file://.github/workflows/ci.yml).
- **Continuous Deployment (CD)**: Automatically deploys to production servers via SSH on push/merge to `main` via [`.github/workflows/cd.yml`](file://.github/workflows/cd.yml).

For full details on the development lifecycle, refer to [`DEVELOPMENT_AND_DEPLOYMENT.md`](file://DEVELOPMENT_AND_DEPLOYMENT.md).

---

## 📚 Project Documentation

- [`DEVELOPMENT_AND_DEPLOYMENT.md`](file://DEVELOPMENT_AND_DEPLOYMENT.md) - End-to-end development, testing, and deployment guide.
- [`CLAUDE.md`](file://CLAUDE.md) - Quick reference for AI assistants working in this repository.
- [`.agents/AGENTS.md`](file://.agents/AGENTS.md) - Coding guidelines, monorepo constraints, and architectural directives.
