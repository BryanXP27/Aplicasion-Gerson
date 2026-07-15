/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
<<<<<<< HEAD
    // IMPORTANTE: Revisar todos los errores TypeScript
    // El compilador es strict en Next.js 16
    tsconfigPath: './tsconfig.json',
=======
    ignoreBuildErrors: true,
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
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
=======
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
}

export default nextConfig
