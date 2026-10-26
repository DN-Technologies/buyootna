# Development, Testing, & Deployment Workflow Guide

This document outlines the end-to-end workflow for developing, testing, pushing, and deploying the **Buyootna** monorepo application.

---

## 📋 Overview of Workflow Lifecycle

```mermaid
flowchart LR
    A[1. Local Development] --> B[2. Push to Dev Branch]
    B --> C[3. Automated CI Testing]
    C --> D[4. Merge PR into Main]
    D --> E[5. Automated CD Deployment]
```

---

## 🛠️ Phase 1: Local Development

### Prerequisites
- **Node.js**: v22 LTS
- **Package Manager**: `pnpm` (v10)
- **Container Engine**: Docker & Docker Compose

### 1. Install Workspace Dependencies
Run from the repository root:
```bash
pnpm install
```

### 2. Local Service Execution
- **Run Backend API**:
  ```bash
  pnpm --filter api start:dev
  ```
- **Run Mobile App (Expo)**:
  ```bash
  pnpm --filter buyootna start
  ```
- **Run Web Workspace Applications**:
  ```bash
  pnpm --filter "./apps/web/*" dev
  ```

### 3. Local Verification Before Pushing
Run type-checking and unit tests locally before committing changes:
```bash
# Type check TypeScript in Mobile App
pnpm --filter buyootna exec tsc --noEmit

# Run Backend API Unit Tests
pnpm --filter api test

# Run Mobile App Unit Tests
pnpm --filter buyootna test
```

---

## 🚀 Phase 2: Commit & Push

### Branching Strategy
- **`dev`**: Primary integration branch for active development and feature updates.
- **`main` / `master`**: Production-ready branch. Code merged here triggers production deployment.

### Commands to Commit and Push
```bash
# 1. Stage modified files
git add .

# 2. Commit with descriptive message
git commit -m "feat(module): description of feature or bugfix"

# 3. Push changes to dev branch
git push origin dev
```

---

## 🧪 Phase 3: Automated CI Pipeline (Continuous Integration)

When code is pushed to `dev` or a Pull Request is opened, GitHub Actions automatically runs the **CI Pipeline** ([`.github/workflows/ci.yml`](file://.github/workflows/ci.yml)).

### CI Pipeline Jobs
1. **Lint & Build Web Workspace** (`lint-and-build-workspace`):
   - Installs workspace dependencies with `--frozen-lockfile`.
   - Builds all Next.js applications located in `apps/web/*`.
2. **Test & Build Backend API** (`test-api`):
   - Generates Prisma ORM client (`pnpm --filter api exec prisma generate`).
   - Executes NestJS unit tests with Jest (`pnpm --filter api test`).
   - Builds production NestJS dist outputs.
3. **Test Mobile App** (`test-mobile`):
   - Executes Jest unit test suite for the Expo/React Native app (`pnpm --filter buyootna test`).
4. **Validate Docker Build** (`docker-build`):
   - Validates `docker-compose.yaml` configuration.
   - Builds all service Docker images (`docker compose build`).

---

## 🚢 Phase 4: Production Deployment (CD Pipeline)

When a Pull Request is merged from `dev` into `main` (or code is pushed directly to `main`), GitHub Actions automatically triggers the **CD Pipeline** ([`.github/workflows/cd.yml`](file://.github/workflows/cd.yml)).

### Automated CD Deployment Steps
1. **SSH Connection**: Establishes a secure SSH connection to the production server (`secrets.SSH_HOST`).
2. **Pull Code**: Navigates to target directory and pulls latest changes:
   ```bash
   git pull origin main
   ```
3. **Build & Re-launch Containers**:
   ```bash
   docker compose up -d --build
   ```
4. **Apply Database Migrations**:
   ```bash
   docker compose exec -T api pnpm prisma:migrate:deploy
   ```
5. **Clean Old Images**:
   ```bash
   docker system prune -f
   ```

---

## ⚡ Manual Deployment (Fallback)

If you ever need to trigger a deployment manually without pushing new code:

1. Go to the **GitHub Repository** -> **Actions** tab.
2. Select **CD Pipeline** from the left sidebar menu.
3. Click the **Run workflow** dropdown on the top right.
4. Select the `main` branch and click **Run workflow**.

---

## 🔐 Docs Portal Setup (docs.buyootna.cloud)

The QA docs portal signs people in with one password per role (QA, Developer,
UI/UX, Client, Admin). One-time setup per environment:

1. Generate a secret (`openssl rand -hex 32`) and put the **same value** in
   `apps/api/.env` and `apps/web/docs/.env` as `DOCS_JWT_SECRET`. Without it
   the portal stays locked.
2. Deploy (the CD run applies the `docs_portal_access` migration).
3. Set the passwords on the server, one role at a time (hidden prompt):
   ```bash
   docker compose run --rm api node dist/src/scripts/docs-set-password.js ADMIN
   ```
   After that, the admin can change every role's password from the portal
   (Role passwords page). Changing a password signs that role out everywhere.

Locally: `pnpm --filter api docs:set-password ADMIN`, and run the docs site
with `API_URL=http://localhost:8000` in `apps/web/docs/.env`.

## 🧪 Testing Portal Setup (testing.buyootna.cloud / .com)

The testers' portal (`apps/web/testing`, mobile-first, installable as an app).
One-time setup, **in this order** (nginx can't start with a site whose
certificate doesn't exist yet, and then every site is down):

1. DNS: A records for `testing.buyootna.cloud` and `testing.buyootna.com` →
   the server.
2. Generate a secret (`openssl rand -hex 32`) and put the **same value** in
   `apps/api/.env` and `apps/web/testing/.env` as `TESTING_JWT_SECRET`.
   Optional in `apps/api/.env`: `TESTFLIGHT_URL`, `ANDROID_BUILD_URL`
   (install links + QR codes on المزيد).
3. Merge and run CD (applies the `testing_portal` migration, builds
   `web-testing`). nginx keeps running its old config.
4. Right away: `./init-letsencrypt.sh` on the server — answer **N** for the
   existing domains; it issues the two testing certificates and restarts nginx.
5. Set the passwords (hidden prompt):
   ```bash
   docker compose run --rm api node dist/src/scripts/testing-set-password.js LOGIN
   docker compose run --rm api node dist/src/scripts/testing-set-password.js DANGER
   ```
   LOGIN signs testers in (a new one signs everyone out); DANGER is asked
   again before wiping the database.

6. **Before the first wipe**, make `backups/` private in the S3 bucket
   policy: add `"arn:aws:s3:::<bucket>/backups/*"` to the
   `PublicReadGetObject` statement's `NotResource` list (next to `chat/*`
   and `stories/*`). Until then every wipe stops after the backup: the API
   checks the backup isn't readable anonymously, and if it is, removes it
   and deletes nothing.

### Wipe backups and restoring one

الأدوات › قاعدة البيانات › مسح كل البيانات runs `pg_dump --format=custom`
in the API container and uploads it to `s3://<bucket>/backups/<time>-<commit>.dump`
before emptying anything; the key is shown on the screen and in سجل البوابة
(`DATABASE_WIPED`). It keeps `_prisma_migrations` and the `Testing*` tables
(portal passwords, audit log, bug reports). Backups aren't deleted
automatically. To put a backup back (it replaces what's there now, the
`Testing*` tables included, as they were at backup time):

```bash
aws s3 cp s3://<bucket>/backups/<file>.dump ./restore.dump
docker compose cp restore.dump postgres:/tmp/restore.dump
docker compose exec postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --clean --if-exists --no-owner --single-transaction /tmp/restore.dump && rm /tmp/restore.dump'
rm restore.dump
```

`--single-transaction` means a failed restore changes nothing. The daily
`postgres-backup` dumps are a second way back.

Locally: `pnpm --filter api testing:set-password LOGIN`, then run the site
with `API_URL=http://localhost:8000` and the same `TESTING_JWT_SECRET` in
`apps/web/testing/.env.local` (`pnpm --filter @buyootna/web-testing dev`, port 3007).

## 🔍 Server Verification Commands

After deployment completes, connect to your server via SSH to inspect container status and logs:

```bash
# Check status of running containers
docker ps

# Stream logs for the backend API
docker compose logs -f api

# Stream logs for all services
docker compose logs -f
```
