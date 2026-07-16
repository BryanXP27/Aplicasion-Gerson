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
    const [totalIngresos, totalGastos] = await prisma.$transaction([
      prisma.ingresos.aggregate({
        _sum: {
          monto: true,
        },
      }),
      prisma.gastos.aggregate({
        _sum: {
          monto: true,
        },
      }),
    ])

    const ingresos = totalIngresos._sum.monto ?? 0
    const gastos = totalGastos._sum.monto ?? 0
    const balance = Number(ingresos) - Number(gastos)

    const data = {
      totalIngresos: Number(ingresos),
      totalGastos: Number(gastos),
      balance,
    }

    logger.info({ action: "get_resumen_finanzas" }, "Resumen de finanzas obtenido exitosamente")

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error(
      { action: "get_resumen_finanzas", error: errorMessage },
      "Error al obtener el resumen de finanzas"
    )
    return NextResponse.json({ error: "Error al obtener el resumen de finanzas" }, { status: 500 })
  }
}