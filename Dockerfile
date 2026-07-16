# ==================== STAGE 1: DEPENDENCIES ====================
# Usar una versión más moderna de Node.js, consistente con tus workflows
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# ==================== STAGE 2: BUILDER ====================
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./

# Copiar el schema de Prisma ANTES de instalar dependencias para que `prisma generate` funcione
COPY prisma ./prisma

# Instalar TODAS las dependencias (incluidas las de desarrollo para el build)
RUN npm ci
COPY . .

# El `prisma generate` se ejecuta automáticamente con `postinstall`
# No es necesario un `npx prisma generate` explícito aquí

RUN npm run build

# ==================== STAGE 3: PRODUCTION RUNTIME ====================
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción desde la primera etapa
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# El comando de inicio ahora solo necesita iniciar la aplicación
CMD ["npm", "run", "start"]
