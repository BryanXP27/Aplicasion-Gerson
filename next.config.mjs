/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // IMPORTANTE: Revisar todos los errores TypeScript
    // El compilador es strict en Next.js 16
    tsconfigPath: './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
  // Habilitar strict mode en desarrollo
  reactStrictMode: true,
  // Optimizaciones de producción
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  // NOTA: swcMinify fue removido en Next.js 16 (minificación es automática)
  // Antes: swcMinify: true,
  
  // Output optimizado para Next.js 16
  // Nota: 'standalone' es para Docker/self-hosted; se omite para Vercel
  // output: 'standalone',
  
  // Configuración de encabezados para reemplazar el middleware obsoleto
  async headers() {
    return [
      {
        // Aplicar a todas las rutas de la aplicación
        source: '/:path*',
        headers: [
          // Encabezados de seguridad básicos
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ]
  },
}

export default nextConfig
