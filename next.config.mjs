import path from 'path';

const __dirname = path.dirname(path.fileURLToPath(import.meta.url));

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
  // Output optimizado para Docker/Google Cloud Run
  output: 'standalone',

  // Configuración para que el output standalone funcione correctamente en contenedores
  outputFileTracingRoot: path.join(__dirname, '../'),

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