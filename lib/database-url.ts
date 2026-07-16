function getEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : undefined
}

export function buildDatabaseUrlFromEnv(): string {
  const databaseUrl = getEnv('DATABASE_URL')
  if (!databaseUrl) {
    throw new Error('La variable de entorno DATABASE_URL no está definida.')
  }
  return databaseUrl
}
