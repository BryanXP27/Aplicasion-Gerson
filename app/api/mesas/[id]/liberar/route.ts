import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol, EstadoPedido, EstadoMesa } from "@/lib/middleware-auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.MESERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  try {
    const { pedidoId } = await request.json()

    const mesa = await prisma.mesas.findUnique({ where: { id_mesa: parseInt(id) } })

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 })
    }

    if (pedidoId) {
      const pedido = await prisma.pedidos.findUnique({
        where: { id_pedido: parseInt(pedidoId) },
      })

      if (!pedido) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
      }

      if (pedido.estado_pedido?.toUpperCase() !== EstadoPedido.PAGADO) {
        return NextResponse.json({ error: "Solo se pueden liberar mesas de pedidos pagados" }, { status: 400 })
      }
    }

    const mesaActualizada = await prisma.mesas.update({
      where: { id_mesa: parseInt(id) },
      data: { estado_mesa: EstadoMesa.LIBRE },
    })

    return NextResponse.json({
      success: true,
      message: "Mesa liberada exitosamente",
      mesa: {
        id: mesaActualizada.id_mesa.toString(),
        numero: mesaActualizada.numero_mesa,
        estado: mesaActualizada.estado_mesa,
      },
    })
  } catch (error) {
    console.error("Error liberando mesa:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}