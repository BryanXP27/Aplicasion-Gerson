import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
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
    return NextResponse.json({ error: "Error al obtener gasto" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(
    { url: request.url, method: request.method },
    ["ADMIN"]
  )
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const data = await request.json()
    const updatedGasto = await prisma.gastos.update({
      where: { id_gasto: parseInt(params.id) },
      data: {
        ...data,
        monto: parseFloat(data.monto),
      },
    })
    return NextResponse.json(updatedGasto)
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar gasto" }, { status: 500 })
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
    console.error("Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: "Error al eliminar gasto", details: errorMessage }, { status: 500 })
  }
}
