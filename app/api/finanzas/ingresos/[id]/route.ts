import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

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
    const ingreso = await prisma.ingresos.findUnique({
      where: { id_ingreso: parseInt(id) },
    })
    if (!ingreso) {
      return NextResponse.json({ error: "Ingreso no encontrado" }, { status: 404 })
    }
    return NextResponse.json(ingreso)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener ingreso" }, { status: 500 })
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
    const updatedIngreso = await prisma.ingresos.update({
      where: { id_ingreso: parseInt(id) },
      data: {
        ...data,
        monto: parseFloat(data.monto),
      },
    })
    return NextResponse.json(updatedIngreso)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al actualizar ingreso" }, { status: 500 })
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
    await prisma.ingresos.delete({
      where: { id_ingreso: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al eliminar ingreso" }, { status: 500 })
  }
}