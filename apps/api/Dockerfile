# --- STAGE 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
RUN npm install -g pnpm

# --- STAGE 2: Install & Build ---
FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
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

# Copy built app, node_modules (with generated Prisma client), and prisma schema
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma

EXPOSE 8000

CMD ["node", "dist/src/main"]
