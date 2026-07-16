import { PrismaClient } from "@prisma/client"
import { buildDatabaseUrlFromEnv } from "@/lib/database-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatabaseUrlFromEnv(),
    // Configuración de conexión mejorada para Neon
    errorFormat: "pretty",
  })

// Reconectar automáticamente en caso de desconexión
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
