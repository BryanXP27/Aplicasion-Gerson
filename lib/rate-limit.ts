// lib/rate-limit.ts
<<<<<<< HEAD
// Rate limiting simple sin dependencias externas (para desarrollo)
// En producción, usar: npm install @upstash/ratelimit @upstash/redis

export class RateLimit {
  private attempts = new Map<string, { count: number; resetTime: number }>()

  /**
   * Verificar si una solicitud está dentro del límite de rate
   * @param identifier - ID único (IP, user ID, etc.)
   * @param maxAttempts - Número máximo de intentos
   * @param windowMs - Ventana de tiempo en milisegundos
   * @returns true si está dentro del límite, false si lo excede
   */
=======
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuración básica de rate limiting
// Para producción necesitarías Redis (Upstash, Redis Cloud, etc.)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests por minuto por IP
})

export async function checkRateLimit(identifier: string): Promise<boolean> {
  try {
    const { success } = await ratelimit.limit(identifier)
    return success
  } catch (error) {
    // En desarrollo, sin Redis, permitir todas las requests
    console.warn('Rate limiting no disponible:', error)
    return true
  }
}

// Rate limiting simple sin Redis (para desarrollo)
export class SimpleRateLimit {
  private attempts = new Map<string, { count: number; resetTime: number }>()

>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
  check(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      // Primera attempt o ventana expirada
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxAttempts) {
      return false // Rate limit exceeded
    }

    record.count++
    return true
  }
<<<<<<< HEAD

  /**
   * Resetear el contador para un identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Limpiar intentos expirados (ejecutar periódicamente)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Instancia global para rate limiting
export const rateLimit = new RateLimit()

// Para compatibilidad con código que usa checkRateLimit
export async function checkRateLimit(identifier: string): Promise<boolean> {
  return rateLimit.check(identifier, 5, 60000) // 5 requests por minuto
}

// Alias para compatibilidad
export const simpleRateLimit = rateLimit
=======
}

export const simpleRateLimit = new SimpleRateLimit()
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
