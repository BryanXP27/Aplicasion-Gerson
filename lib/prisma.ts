import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    errorFormat: "pretty",
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

if (typeof window === "undefined") {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect()
  })

  process.on("SIGINT", async () => {
    await prisma.$disconnect()
  })
}

prisma.$use(async (params, next) => {
  let retries = 0
  const maxRetries = 3

  while (retries < maxRetries) {
    try {
      return await next(params)
    } catch (error: any) {
      retries++

      if (
        (error.code === "P1001" || error.code === "ECONNREFUSED") &&
        retries < maxRetries
      ) {
        const delay = Math.pow(2, retries) * 100
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      throw error
    }
  }
})
