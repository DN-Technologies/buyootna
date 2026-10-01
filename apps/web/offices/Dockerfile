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
COPY apps/web/offices/package.json ./apps/web/offices/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/offices ./apps/web/offices

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-offices build && mkdir -p apps/web/offices/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/offices/public ./apps/web/offices/public
COPY --from=build /app/apps/web/offices/.next/standalone ./
COPY --from=build /app/apps/web/offices/.next/static ./apps/web/offices/.next/static

EXPOSE 3003
ENV PORT=3003

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/offices/server.js"]
