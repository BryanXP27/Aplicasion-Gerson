# ==================== STAGE 1: DEPENDENCIES ====================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ==================== STAGE 2: BUILDER ====================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
# Usar DATABASE_URL de build si no está definida, para que prisma generate funcione
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
ENV DATABASE_URL=${DATABASE_URL}
# Instalar OpenSSL requerido por Prisma en Alpine
RUN apk add --no-cache openssl
RUN npm run build && npm prune --production

# ==================== STAGE 3: PRODUCTION RUNTIME ====================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run usa el puerto 8080 por defecto, pero se puede sobrescribir con PORT
ENV PORT=8080

# Instalar OpenSSL en runtime también
RUN apk add --no-cache openssl

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT}/api/health || exit 1

# Ejecutar migraciones y start
# Las variables DATABASE_URL y DIRECT_DATABASE_URL se inyectan desde Cloud Run
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]