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
    // Asumo que quieres obtener todos los presupuestos, similar a gastos o ingresos.
    // Si el modelo 'presupuestos' no existe, deberás ajustar esta consulta.
    // Por ahora, devuelvo un array vacío como ejemplo.
    const presupuestos: any[] = [] // Reemplazar con: await prisma.presupuestos.findMany()
    logger.info({ action: "get_presupuestos", count: presupuestos.length }, "Presupuestos obtenidos")
    return NextResponse.json(presupuestos)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_presupuestos", error: errorMessage }, "Error al obtener presupuestos")
    return NextResponse.json({ error: "Error al obtener presupuestos" }, { status: 500 })
  }
}