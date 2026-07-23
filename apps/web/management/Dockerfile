# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm

# Copy workspace configuration and dependency lockfiles
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/management/package.json ./apps/web/management/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/management ./apps/web/management

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-management build && mkdir -p apps/web/management/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/management/public ./apps/web/management/public
COPY --from=build /app/apps/web/management/.next/standalone ./
COPY --from=build /app/apps/web/management/.next/static ./apps/web/management/.next/static

EXPOSE 3004
ENV PORT=3004

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/management/server.js"]
