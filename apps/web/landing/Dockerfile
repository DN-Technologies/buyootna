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
COPY apps/web/landing/package.json ./apps/web/landing/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/landing ./apps/web/landing

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-landing build && mkdir -p apps/web/landing/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/landing/public ./apps/web/landing/public
COPY --from=build /app/apps/web/landing/.next/standalone ./
COPY --from=build /app/apps/web/landing/.next/static ./apps/web/landing/.next/static

EXPOSE 3001
ENV PORT=3001

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/landing/server.js"]
