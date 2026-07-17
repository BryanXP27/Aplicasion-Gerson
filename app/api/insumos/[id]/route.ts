import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.COCINERO, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Se desestructura el id directamente de la promesa de parámetros
    const { id } = await params;
    const producto = await prisma.productos.findUnique({
      where: { id_produc: parseInt(id) },
    })
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(producto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    // Se espera la resolución de la promesa 'params' para acceder a 'id'
    const id = (await params).id
    logger.error({ action: "get_insumo_by_id", error: errorMessage, id }, "Error al obtener insumo")
    return NextResponse.json({ error: "Error al obtener el insumo" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Se desestructura el id directamente de la promesa de parámetros
    const { id } = await params;
    const data = await request.json()
    const updatedProducto = await prisma.productos.update({
      where: { id_produc: parseInt(id) },
      data: data,
    })
    return NextResponse.json(updatedProducto)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    const id = (await params).id
    logger.error({ action: "update_insumo", error: errorMessage, id }, "Error al actualizar insumo")
    return NextResponse.json({ error: "Error al actualizar el insumo" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Se desestructura el id directamente de la promesa de parámetros
    const { id } = await params;
    await prisma.productos.delete({
      where: { id_produc: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    const id = (await params).id
    logger.error({ action: "delete_insumo", error: errorMessage, id }, "Error al eliminar insumo")
    return NextResponse.json({ error: "Error al eliminar el insumo" }, { status: 500 })
  }
}