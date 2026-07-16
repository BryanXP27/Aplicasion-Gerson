import { getSession } from "./auth"
import logger from "./logger"
import { Rol, EstadoPedido } from "@prisma/client"

export { Rol, EstadoPedido }

export async function requireAuth(
  request: { url: string; method: string },
  allowedRoles?: Rol[]
) {
  const session = await getSession()

  if (!session) {
    logger.warn(
      { action: "requireAuth", path: request.url, method: request.method },
      "Acceso no autorizado: No hay sesión"
    )
    return {
      error: "No autorizado",
      status: 401,
    }
  }

  if (allowedRoles) {
    if (!allowedRoles.includes(session.rol as Rol)) {
      logger.error(
        {
          action: "requireAuth",
          userId: session.id,
          userRole: session.rol,
          requiredRoles: allowedRoles,
          path: request.url,
        },
        "Acceso prohibido: Rol no permitido"
      )
      return {
        error: "No tienes permisos para acceder a este recurso",
        status: 403,
      }
    }
  }

  return session
}
