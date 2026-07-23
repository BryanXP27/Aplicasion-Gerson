// Endpoint para gestionar pedidos (obtener, actualizar y cancelar)
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol, EstadoPedido, EstadoMesa } from "@/lib/middleware-auth"

// Obtiene un pedido específico por su ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.MESERO, Rol.COCINERO, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: parseInt(id) },
      include: {
        mesas: true,
        usuarios: { select: { nombre_user: true, apellido_user: true } },
        detallepedido: { include: { productos: true } },
        pedido_delivery: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    let tipoServicio = "mesa"
    if (pedido.mesas.numero_mesa === -1) {
      tipoServicio = pedido.pedido_delivery ? "delivery" : "llevar"
    } else if (pedido.mesas.numero_mesa === -2) {
      tipoServicio = "llevar"
    }

    const pedidoFormateado = {
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      mesa: {
        id: pedido.mesas.id_mesa.toString(),
        numero: pedido.mesas.numero_mesa,
      },
      mesero: `${pedido.usuarios?.nombre_user ?? ""} ${pedido.usuarios?.apellido_user ?? ""}`.trim(),
      estado: pedido.estado_pedido,
      estado_pedido: pedido.estado_pedido,
      tipoServicio,
      isDelivery: tipoServicio === "delivery",
      detallepedido: pedido.detallepedido.map((d) => ({
        id: d.id_detalle.toString(),
        id_produc: d.id_produc?.toString() || "otro",
        producto: {
          id: d.id_produc?.toString() || "otro",
          nombre: d.nombre_produc_personalizado || (d.productos ? d.productos.nombre_produc : "Producto"),
          precio: d.productos ? parseFloat(d.productos.precio_produc.toString()) : 0,
          categoria: d.productos ? d.productos.categoria_produc : "Otro",
        },
        cantidad: d.cantidad,
        precio_unitario: parseFloat(d.precio_unitario.toString()),
        subtotal: parseFloat(d.subtotal.toString()),
      })),
      ...(pedido.pedido_delivery && {
        clienteInfo: {
          numero_telefono: pedido.pedido_delivery.numero_telefono,
          nombre_cliente: pedido.pedido_delivery.nombre_cliente,
          direccion: pedido.pedido_delivery.direccion,
          notas: pedido.pedido_delivery.notas,
        },
      }),
    }

    return NextResponse.json(pedidoFormateado)
  } catch (error) {
    console.error("Error obteniendo pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

// Actualiza el estado de un pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.MESERO, Rol.COCINERO, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  try {
    const pedidoId = parseInt(id)
    const body = await request.json()

    // CASO 1: Solo actualizar estado
    if (body.estado && !body.detalles) {
      const nuevoEstado = body.estado.toUpperCase()
      const pedidoActualizado = await prisma.pedidos.update({
        where: { id_pedido: pedidoId },
        data: { estado_pedido: nuevoEstado },
      })
      return NextResponse.json({
        id: pedidoActualizado.id_pedido.toString(),
        estado: pedidoActualizado.estado_pedido,
      })
    }

    // CASO 2: Actualizar detalles
    const { detalles: nuevosDetalles, observaciones } = body

    if (!nuevosDetalles) {
      return NextResponse.json({ error: "Faltan detalles o estado en la petición" }, { status: 400 })
    }

    const detallesActualizados = await prisma.$transaction(async (tx) => {
      const detallesAntiguos = await tx.detallepedido.findMany({ where: { id_pedido: pedidoId } })
      const stockAjustes = new Map<number, number>()

      for (const detalle of detallesAntiguos) {
        if (detalle.id_produc) {
          stockAjustes.set(detalle.id_produc, (stockAjustes.get(detalle.id_produc) || 0) + detalle.cantidad)
        }
      }

      for (const detalle of nuevosDetalles) {
        if (detalle.productoId && !String(detalle.productoId).startsWith("otro_")) {
          const productoId = parseInt(detalle.productoId)
          stockAjustes.set(productoId, (stockAjustes.get(productoId) || 0) - detalle.cantidad)
        }
      }

      for (const [productoId, ajuste] of stockAjustes.entries()) {
        if (ajuste !== 0) {
          await tx.productos.update({
            where: { id_produc: productoId },
            data: { stock_produc: { increment: ajuste } },
          })
        }
      }

      await tx.detallepedido.deleteMany({ where: { id_pedido: pedidoId } })

      const detallesCreados = []
      for (const detalle of nuevosDetalles) {
        const subtotal = detalle.cantidad * detalle.precioUnitario
        let nuevoDetalle
        if (String(detalle.productoId).startsWith("otro_")) {
          nuevoDetalle = await tx.detallepedido.create({
            data: {
              id_pedido: pedidoId,
              nombre_produc_personalizado: detalle.nombre,
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precioUnitario,
              subtotal,
            },
          })
        } else {
          nuevoDetalle = await tx.detallepedido.create({
            data: {
              id_pedido: pedidoId,
              id_produc: parseInt(detalle.productoId),
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precioUnitario,
              subtotal,
            },
          })
        }
        detallesCreados.push(nuevoDetalle)
      }
      return detallesCreados
    })

    const nuevoTotal = detallesActualizados.reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0)

    const pedidoFinal = await prisma.pedidos.update({
      where: { id_pedido: pedidoId },
      data: { total: nuevoTotal, observaciones: observaciones || null },
    })

    return NextResponse.json({
      id: pedidoFinal.id_pedido.toString(),
      estado: pedidoFinal.estado_pedido,
      total: nuevoTotal,
    })
  } catch (error) {
    console.error("Error actualizando pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}

// Cancela un pedido
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.MESERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  try {
    const pedidoId = parseInt(id)

    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: { mesas: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const estadosPermitidos: string[] = [EstadoPedido.EN_PREPARACION, EstadoPedido.SERVIDO]
    if (!estadosPermitidos.includes(pedido.estado_pedido?.toUpperCase() ?? "")) {
      return NextResponse.json(
        { error: `No se puede cancelar un pedido en estado ${pedido.estado_pedido}` },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // 1. Devolver stock de productos
      const detalles = await tx.detallepedido.findMany({
        where: { id_pedido: pedidoId, id_produc: { not: null } },
      })

      for (const detalle of detalles) {
        await tx.productos.update({
          where: { id_produc: detalle.id_produc! },
          data: { stock_produc: { increment: detalle.cantidad } },
        })
      }

      // 2. Devolver presas de pollo
      const detallesPollo = await tx.detalle_pollos_pedido.findMany({ where: { id_pedido: pedidoId } })

      if (detallesPollo.length > 0 && pedido.fecha_pedido) {
        const hoy = new Date(pedido.fecha_pedido)
        hoy.setHours(0, 0, 0, 0)
        const inventario = await tx.inventario_pollos.findFirst({ where: { fecha: hoy } })

        if (inventario) {
          for (const dp of detallesPollo) {
            const field = dp.tipo_presa === "pecho" ? "pechos_disponibles" : "piernas_disponibles"
            await tx.inventario_pollos.update({
              where: { id_inventario: inventario.id_inventario },
              data: { [field]: { increment: dp.cantidad } },
            })
          }
        }
      }

      // 3. Eliminar registros relacionados
      await tx.detalle_pollos_pedido.deleteMany({ where: { id_pedido: pedidoId } })
      await tx.detallepedido.deleteMany({ where: { id_pedido: pedidoId } })
      await tx.pedidos_delivery.deleteMany({ where: { id_pedido: pedidoId } })

      // 4. Cambiar estado a CANCELADO
      await tx.pedidos.update({
        where: { id_pedido: pedidoId },
        data: { estado_pedido: EstadoPedido.CANCELADO },
      })

      // 5. Liberar mesa real
      if (pedido.mesas.numero_mesa > 0) {
        await tx.mesas.update({
          where: { id_mesa: pedido.id_mesa },
          data: { estado_mesa: EstadoMesa.LIBRE },
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado y stock devuelto exitosamente",
      id: pedidoId.toString(),
    })
  } catch (error) {
    console.error("Error cancelando pedido:", error)
    return NextResponse.json({ error: "Error al cancelar pedido" }, { status: 500 })
  }
}
