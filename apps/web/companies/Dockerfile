# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm

# Copy workspace configuration and dependency lockfiles
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/companies/package.json ./apps/web/companies/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/web/companies ./apps/web/companies

# Build the standalone Next.js application
RUN pnpm --filter @buyootna/web-companies build && mkdir -p apps/web/companies/public

# --- STAGE 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build assets
COPY --from=build /app/apps/web/companies/public ./apps/web/companies/public
COPY --from=build /app/apps/web/companies/.next/standalone ./
COPY --from=build /app/apps/web/companies/.next/static ./apps/web/companies/.next/static

EXPOSE 3002
ENV PORT=3002

# Next.js standalone runner runs server.js at root level of standalone output
CMD ["node", "apps/web/companies/server.js"]
