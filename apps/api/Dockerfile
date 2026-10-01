# --- STAGE 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
RUN npm install -g pnpm@10

# --- STAGE 2: Install & Build ---
FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
# pnpm-workspace.yaml's patchedDependencies point here; install fails without it
COPY patches ./patches
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api prisma:generate
COPY apps/api ./apps/api
RUN pnpm --filter api build

# --- STAGE 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Copy root node_modules (.pnpm virtual store with actual package files)
COPY --from=build /app/node_modules ./node_modules

# Copy the API package keeping the workspace structure so symlinks resolve correctly
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=build /app/apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/dist ./apps/api/dist

# Run from within the api package so Node resolves modules via apps/api/node_modules
WORKDIR /app/apps/api

EXPOSE 8000

CMD ["node", "dist/src/main"]
