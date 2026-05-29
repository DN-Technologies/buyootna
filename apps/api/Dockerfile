# --- STAGE 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
RUN npm install -g pnpm

# --- STAGE 2: Dependencies ---
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
RUN pnpm prisma:generate

# --- STAGE 3: Build ---
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# --- STAGE 4: Production Dependencies ---
FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=dependencies /app/node_modules/.prisma ./node_modules/.prisma

# --- STAGE 5: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Copy built application assets and production node_modules
COPY --from=build /app/dist ./dist
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 8000

CMD ["node", "dist/main"]
