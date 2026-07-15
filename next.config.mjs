/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript strict mode - revisar errores durante build
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
  output: 'standalone',
}

export default nextConfig
