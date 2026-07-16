import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN", "CAJERO"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const ingresos = await prisma.ingresos.findMany({
      orderBy: {
        fecha_ingreso: "desc",
      },
    })
    return NextResponse.json(ingresos)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener ingresos" }, { status: 500 })
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
    const newIngreso = await prisma.ingresos.create({
      data: { ...data, monto: parseFloat(data.monto) },
    })
    return NextResponse.json(newIngreso)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "create_ingreso", error: errorMessage }, "Error al crear ingreso")
    return NextResponse.json({ error: "Error al crear ingreso" }, { status: 500 })
  }
}