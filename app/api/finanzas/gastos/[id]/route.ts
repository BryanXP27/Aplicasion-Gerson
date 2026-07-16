import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const gasto = await prisma.gastos.findUnique({
      where: { id_gasto: parseInt(id) },
    })
    if (!gasto) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 })
    }
    return NextResponse.json(gasto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_gasto_by_id", error: errorMessage, id: params.id }, "Error al obtener gasto")
    return NextResponse.json({ error: "Error al obtener el gasto" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const updatedGasto = await prisma.gastos.update({
      where: { id_gasto: parseInt(id) },
      data: {
        ...data,
        monto: parseFloat(data.monto),
      },
    })
    return NextResponse.json(updatedGasto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "update_gasto", error: errorMessage, id: params.id }, "Error al actualizar gasto")
    return NextResponse.json({ error: "Error al actualizar el gasto" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    
    await prisma.gastos.delete({
      where: { id_gasto: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "delete_gasto", error: errorMessage, id: params.id }, "Error al eliminar gasto")
    return NextResponse.json({ error: "Error al eliminar el gasto" }, { status: 500 })
  }
}
