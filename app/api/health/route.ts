// app/api/health/route.ts - Health Check Endpoint
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withMetrics } from "@/lib/with-metrics"
import { setGauge } from "@/lib/metrics"

async function handler(request: NextRequest) {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`
    setGauge("db_connection_status", 1)

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected"
    })
  } catch (error) {
    console.error("Health check failed:", error)
    setGauge("db_connection_status", 0)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed"
      },
      { status: 503 }
    )
  }
}

export const GET = withMetrics(handler, "health")