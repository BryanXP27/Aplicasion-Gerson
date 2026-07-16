import { getSession } from "./auth"
import logger from "./logger"

export async function requireAuth(
  request: { url: string; method: string },
  allowedRoles?: string[]
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
    // Normalizar rol del usuario: MAYÚSCULAS -> Capitalizadas
    const userRole = normalizeRole(session.rol)
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

    if (!normalizedAllowedRoles.includes(userRole)) {
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

  return { session }
}

// Normaliza roles: 'ADMIN' -> 'Admin', 'admin' -> 'Admin'
function normalizeRole(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}
