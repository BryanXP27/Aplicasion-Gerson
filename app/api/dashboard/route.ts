import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, EstadoPedido, Rol } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

export const dynamic = "force-dynamic"

function getTodayRangeInLima() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const today = formatter.format(new Date())
  const start = new Date(`${today}T05:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  return { start, end, today }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.CAJERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { start, end, today } = getTodayRangeInLima()
    const sevenDaysFromNow = new Date(start)
    sevenDaysFromNow.setUTCDate(sevenDaysFromNow.getUTCDate() + 7)

    // Usar Promise.allSettled para manejar fallos parciales de conexión
    const results = await Promise.allSettled([
      prisma.ingresos.aggregate({
        where: {
          categoria: "Ventas",
          fecha_ingreso: {
            gte: start,
            lt: end,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      prisma.pedidos.count({
        where: {
          estado_pedido: {
            in: [
              EstadoPedido.EN_PREPARACION,
              EstadoPedido.EN_PROCESO,
              EstadoPedido.LISTO_PARA_RECOGER,
              EstadoPedido.SERVIDO,
            ],
          },
        },
      }),
      prisma.productos.count({
        where: {
          vencimiento_produc: {
            gte: start,
            lt: sevenDaysFromNow,
          },
        },
      }),
      // Consulta optimizada: Contar directamente en la base de datos
      prisma.productos.count({
        where: {
          // Asumimos un umbral de stock bajo de 10.
          // Idealmente, esto debería ser una columna en el modelo `productos`.
          stock_produc: {
            lte: 10,
          },
          controlar_stock: true,
        },
      }),
    ])

    // Extraer resultados con valores por defecto en caso de error
    const ventasResult = results[0].status === "fulfilled" ? results[0].value : { _sum: { monto: 0 } }
    const pedidosActivosResult = results[1].status === "fulfilled" ? results[1].value : 0;
    const insumosVencerResult = results[2].status === "fulfilled" ? results[2].value : 0;
    const insumosBajoStockResult = results[3].status === "fulfilled" ? results[3].value : 0;

    return NextResponse.json({
      ventasHoy: Number(ventasResult._sum?.monto ?? 0),
      pedidosActivos: pedidosActivosResult,
      insumosVencer: insumosVencerResult,
      insumosBajoStock: insumosBajoStockResult,
      fecha: today,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_dashboard", error: errorMessage }, "Error al obtener datos del dashboard")
    return NextResponse.json({
      ventasHoy: 0,
      pedidosActivos: 0,
      insumosVencer: 0,
      insumosBajoStock: 0,
      fecha: getTodayRangeInLima().today,
    })
  }
}
