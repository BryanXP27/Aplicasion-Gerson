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
    const gastos = await prisma.gastos.findMany({
      orderBy: {
        fecha_gasto: "desc",
      },
    })
    return NextResponse.json(gastos)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_gastos", error: errorMessage }, "Error al obtener gastos")
    return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const data = await request.json()
    const newGasto = await prisma.gastos.create({
      data: { ...data, monto: parseFloat(data.monto) },
    })
    return NextResponse.json(newGasto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "create_gasto", error: errorMessage }, "Error al crear gasto")
    return NextResponse.json({ error: "Error al crear gasto" }, { status: 500 })
  }
}