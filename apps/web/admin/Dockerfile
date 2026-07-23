# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm

# Copy workspace configuration and dependency lockfiles
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/admin/package.json ./apps/web/admin/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/admin ./apps/web/admin

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-admin build && mkdir -p apps/web/admin/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/admin/public ./apps/web/admin/public
COPY --from=build /app/apps/web/admin/.next/standalone ./
COPY --from=build /app/apps/web/admin/.next/static ./apps/web/admin/.next/static

EXPOSE 3005
ENV PORT=3005

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/admin/server.js"]
