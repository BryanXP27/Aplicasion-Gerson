import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol, EstadoPedido, EstadoMesa } from "@/lib/middleware-auth"
import { Decimal } from "@prisma/client/runtime/library"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  try {
    const pedidoId = parseInt(id)

    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 })
    }

    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: { mesas: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    if (pedido.estado_pedido?.toUpperCase() === EstadoPedido.PAGADO) {
      return NextResponse.json({ error: "El pedido ya está pagado" }, { status: 400 })
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const pedidoActualizado = await tx.pedidos.update({
        where: { id_pedido: pedidoId },
        data: { estado_pedido: EstadoPedido.PAGADO },
      })

      if (pedido.mesas.numero_mesa > 0) {
        await tx.mesas.update({
          where: { id_mesa: pedido.id_mesa },
          data: { estado_mesa: EstadoMesa.LIBRE },
        })
      }

      const totalPedido = await tx.detallepedido.aggregate({
        where: { id_pedido: pedidoId },
        _sum: { subtotal: true },
      })

      const montoTotal = totalPedido._sum.subtotal || new Decimal(0)

      await tx.ingresos.create({
        data: {
          monto: new Decimal(montoTotal.toString()),
          descripcion: `Pago Pedido #${pedidoId} - Mesa ${pedido.mesas.numero_mesa}`,
          categoria: "Venta",
          metodo_pago: "Efectivo",
          estado: "Registrado",
        },
      })

      return pedidoActualizado
    })

    return NextResponse.json({
      success: true,
      pedido: resultado,
      mensaje: "Pago procesado y pedido cerrado",
    })
  } catch (error) {
    console.error("[PAGAR] Error:", error)
    return NextResponse.json(
      {
        error: "Error al procesar pago",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
