import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createToken } from "@/lib/auth"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { correo_user, contrasena } = await request.json()

    if (!correo_user || !contrasena) {
      return NextResponse.json(
        { error: "El correo y la contraseña son requeridos" },
        { status: 400 }
      )
    }

    const normalizedEmail = correo_user.toLowerCase()

    const usuario = await prisma.usuarios.findUnique({
      where: { correo_user: normalizedEmail },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena)

    if (!contrasenaValida) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = await createToken({
      id: usuario.id_user,
      rol: usuario.rol,
      nombre: `${usuario.nombre_user} ${usuario.apellido_user}`,
    })

    const response = NextResponse.json({ success: true, token })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    logger.error({ action: "login", error: errorMessage }, "Error en el inicio de sesión")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}