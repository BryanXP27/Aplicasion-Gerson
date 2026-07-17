import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // La firma es correcta, pero el error indica un problema de inferencia de tipos en el build.
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const gasto = await prisma.gastos.findUnique({
      where: { id_gasto: parseInt(params.id) },
    })
    if (!gasto) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 })
    }
    return NextResponse.json(gasto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error(
      { action: "get_gasto_by_id", error: errorMessage, id: params.id },
      "Error al obtener gasto"
    )
    return NextResponse.json({ error: "Error al obtener el gasto" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // La firma es correcta.
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const data = await request.json()
    const updatedGasto = await prisma.gastos.update({
      where: { id_gasto: parseInt(params.id) },
      data: { ...data, monto: parseFloat(data.monto) },
    })
    return NextResponse.json(updatedGasto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error(
      { action: "update_gasto", error: errorMessage, id: params.id },
      "Error al actualizar gasto"
    )
    return NextResponse.json({ error: "Error al actualizar el gasto" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // La firma es correcta.
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    await prisma.gastos.delete({
      where: { id_gasto: parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "delete_gasto", error: errorMessage, id: params.id }, "Error al eliminar gasto")
    return NextResponse.json({ error: "Error al eliminar el gasto" }, { status: 500 })
  }
}