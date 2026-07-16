import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import logger from "@/lib/logger"

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
    const usuario = await prisma.usuarios.findUnique({
      where: { id_user: parseInt(id) },
    })
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }
    const { contrasena, ...userWithoutPassword } = usuario
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "get_usuario_by_id", error: errorMessage, id: params.id }, "Error al obtener usuario")
    return NextResponse.json({ error: "Error al obtener el usuario" }, { status: 500 })
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
    // Asegurarse de no actualizar la contraseña aquí
    delete data.contrasena

    const updatedUsuario = await prisma.usuarios.update({
      where: { id_user: parseInt(id) },
      data,
    })
    const { contrasena, ...userWithoutPassword } = updatedUsuario
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "update_usuario", error: errorMessage, id: params.id }, "Error al actualizar usuario")
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 })
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
    await prisma.usuarios.delete({
      where: { id_user: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "delete_usuario", error: errorMessage, id: params.id }, "Error al eliminar usuario")
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 })
  }
}