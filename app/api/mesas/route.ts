import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, Rol, EstadoMesa } from "@/lib/middleware-auth"
import { withMetrics } from "@/lib/with-metrics"

async function getHandler(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN, Rol.MESERO, Rol.CAJERO, Rol.COCINERO]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const mesasRaw = await prisma.mesas.findMany({
      orderBy: { numero_mesa: "asc" },
    })

    const mesas = mesasRaw
      .filter((mesa) => mesa.numero_mesa > 0)
      .map((mesa) => ({
        id: mesa.id_mesa.toString(),
        numero: mesa.numero_mesa,
        capacidad: mesa.capacidad_mesa,
        estado: mesa.estado_mesa,
      }))

    return NextResponse.json(mesas)
  } catch (error) {
    console.error("Error obteniendo mesas:", error)
    return NextResponse.json({ error: "Error al obtener mesas" }, { status: 500 })
  }
}

export const GET = withMetrics(getHandler, "mesas")

export async function POST(request: NextRequest) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    [Rol.ADMIN]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { numero, capacidad } = await request.json()

    if (!numero || !capacidad) {
      return NextResponse.json({ error: "Número y capacidad son requeridos" }, { status: 400 })
    }

    const existingMesa = await prisma.mesas.findUnique({ where: { numero_mesa: numero } })

    if (existingMesa) {
      return NextResponse.json({ error: "Ya existe una mesa con ese número" }, { status: 400 })
    }

    const mesa = await prisma.mesas.create({
      data: {
        numero_mesa: numero,
        capacidad_mesa: capacidad,
        estado_mesa: EstadoMesa.LIBRE,
      },
    })

    return NextResponse.json({
      id: mesa.id_mesa.toString(),
      numero: mesa.numero_mesa,
      capacidad: mesa.capacidad_mesa,
      estado: mesa.estado_mesa,
    })
  } catch (error) {
    console.error("Error creando mesa:", error)
    return NextResponse.json({ error: "Error al crear mesa" }, { status: 500 })
  }
}
