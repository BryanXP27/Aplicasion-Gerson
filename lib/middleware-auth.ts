import { getSession } from "./auth"

// Enums definidos localmente (Prisma 5.x no exporta enums como valores JS)
export const Rol = {
  ADMIN: 'ADMIN',
  MESERO: 'MESERO',
  COCINERO: 'COCINERO',
  CAJERO: 'CAJERO',
} as const

export const EstadoPedido = {
  EN_PREPARACION: 'EN_PREPARACION',
  EN_PROCESO: 'EN_PROCESO',
  LISTO_PARA_RECOGER: 'LISTO_PARA_RECOGER',
  SERVIDO: 'SERVIDO',
  PAGADO: 'PAGADO',
  CANCELADO: 'CANCELADO',
} as const

export const EstadoMesa = {
  LIBRE: 'LIBRE',
  OCUPADA: 'OCUPADA',
  RESERVADA: 'RESERVADA',
} as const


export async function requireAuth(
  arg1?: { url?: string; method?: string } | string[],
  arg2?: string[]
) {
  const allowedRoles = Array.isArray(arg1) ? arg1 : arg2
  const session = await getSession()

  if (!session) {
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
