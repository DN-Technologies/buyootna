# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm@10

# Copy workspace configuration and dependency lockfiles
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/docs/package.json ./apps/web/docs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/docs ./apps/web/docs

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-docs build && mkdir -p apps/web/docs/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/docs/public ./apps/web/docs/public
COPY --from=build /app/apps/web/docs/.next/standalone ./
COPY --from=build /app/apps/web/docs/.next/static ./apps/web/docs/.next/static

EXPOSE 3006
ENV PORT=3006

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/docs/server.js"]
