# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm@10

# Copy workspace configuration and dependency lockfiles
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
# pnpm-workspace.yaml's patchedDependencies point here; install fails without it
COPY patches ./patches
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/testing/package.json ./apps/web/testing/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/testing ./apps/web/testing

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-testing build && mkdir -p apps/web/testing/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/testing/public ./apps/web/testing/public
COPY --from=build /app/apps/web/testing/.next/standalone ./
COPY --from=build /app/apps/web/testing/.next/static ./apps/web/testing/.next/static

EXPOSE 3007
ENV PORT=3007

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/testing/server.js"]
