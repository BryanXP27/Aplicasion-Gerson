import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { withMetrics } from "@/lib/with-metrics"
import { incrementCounter, setGauge } from "@/lib/metrics"

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

async function handler(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { start, end, today } = getTodayRangeInLima()
    const sevenDaysFromNow = new Date(start)
    sevenDaysFromNow.setUTCDate(sevenDaysFromNow.getUTCDate() + 7)

    // Agregar queries de métricas de negocio
    const results = await Promise.allSettled([
      prisma.ingresos.aggregate({
        where: {
          categoria: "Ventas",
          estado: "Registrado",
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
            in: ["EN_PREPARACION", "En preparacion", "EN_PROCESO", "En proceso", "LISTO_PARA_RECOGER", "Listo para recoger", "SERVIDO", "Servido"],
          },
        },
      }),
      prisma.insumos.count({
        where: {
          vencimiento_insu: {
            gte: start,
            lt: sevenDaysFromNow,
          },
        },
      }),
      prisma.insumos.findMany({
        select: {
          stock_act_insu: true,
          stock_min_insu: true,
        },
      }),
      // Métricas adicionales para monitoreo
      prisma.pedidos.groupBy({
        by: ["estado_pedido"],
        _count: { id_pedido: true },
        where: {
          fecha_pedido: { gte: start, lt: end },
        },
      }),
      prisma.mesas.count({
        where: { estado_mesa: "Ocupada", numero_mesa: { gt: 0 } },
      }),
      prisma.mesas.count({
        where: { estado_mesa: "Libre", numero_mesa: { gt: 0 } },
      }),
      prisma.pedidos.aggregate({
        _sum: { total: true },
        where: {
          estado_pedido: "PAGADO",
          fecha_pedido: { gte: start, lt: end },
        },
      }),
    ])

    // Extraer resultados
    const ventasResult = results[0].status === "fulfilled" ? results[0].value : { _sum: { monto: 0 } }
    const pedidosActivosResult = results[1].status === "fulfilled" ? results[1].value : 0
    const insumosVencerResult = results[2].status === "fulfilled" ? results[2].value : 0
    const insumosResult = results[3].status === "fulfilled" ? results[3].value : []
    const pedidosPorEstado = results[4].status === "fulfilled" ? results[4].value : []
    const mesasOcupadas = results[5].status === "fulfilled" ? results[5].value : 0
    const mesasLibres = results[6].status === "fulfilled" ? results[6].value : 0
    const ingresosHoy = results[7].status === "fulfilled" ? results[7].value : { _sum: { total: 0 } }

    const insumosBajoStock = (insumosResult as any[]).filter((insumo) => {
      const stockActual = Number(insumo.stock_act_insu ?? 0)
      const stockMinimo = Number(insumo.stock_min_insu ?? 0)
      return stockActual <= stockMinimo
    }).length

    // Grabar métricas de negocio
    const ventasHoy = Number(ventasResult._sum?.monto ?? 0)
    setGauge("ingresos_totales", ventasHoy, { periodo: "hoy" })
    setGauge("mesas_ocupadas", mesasOcupadas)
    setGauge("mesas_libres", mesasLibres)
    setGauge("pedidos_activos", pedidosActivosResult)
    setGauge("insumos_bajo_stock", insumosBajoStock)
    setGauge("insumos_por_vencer", insumosVencerResult)

    const totalIngresos = Number((ingresosHoy as any)._sum?.total ?? 0)
    incrementCounter("ingresos_monetarios", { periodo: "hoy" }, Math.round(totalIngresos * 100))

    for (const grupo of (pedidosPorEstado as Array<{ estado_pedido: string; _count: { id_pedido: number } }>)) {
      setGauge("pedidos_por_estado", grupo._count.id_pedido, { estado: grupo.estado_pedido })
    }

    return NextResponse.json({
      ventasHoy,
      pedidosActivos: pedidosActivosResult,
      insumosVencer: insumosVencerResult,
      insumosBajoStock,
      fecha: today,
    })
  } catch (error) {
    console.error("Error obteniendo dashboard:", error)
    return NextResponse.json({
      ventasHoy: 0,
      pedidosActivos: 0,
      insumosVencer: 0,
      insumosBajoStock: 0,
      fecha: new Date().toISOString().split('T')[0],
    })
  }
}

export const GET = withMetrics(handler, "dashboard")
