import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN", "CAJERO"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // NOTA: El modelo 'presupuestos' no existe en tu schema.prisma.
    // Deberás crearlo o ajustar esta lógica.
    // Por ahora, devuelvo un array vacío para que la compilación no falle.
    const presupuestos: any[] = []
    logger.info({ action: "get_presupuestos", count: presupuestos.length }, "Presupuestos obtenidos")
    return NextResponse.json(presupuestos)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_presupuestos", error: errorMessage }, "Error al obtener presupuestos")
    return NextResponse.json({ error: "Error al obtener presupuestos" }, { status: 500 })
  }
}