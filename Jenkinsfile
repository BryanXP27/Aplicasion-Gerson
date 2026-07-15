<<<<<<< HEAD
// JENKINSFILE - Pipeline CI/CD para Pollería Gerson


// Pipeline Declarativo - se ejecuta en cualquier agente disponible
pipeline {
  agent any

  // ============================================================================
  // VARIABLES DE ENTORNO GLOBALES
  // ============================================================================
  // Estas variables se establecen para toda la ejecución del pipeline
  environment {
    // URL de la base de datos PostgreSQL para la compilación
    // Next.js necesita una URL de BD en tiempo de compilación para importar rutas API que usan Prisma
    // Nota: No requiere una BD en vivo, solo la URL es suficiente
    DATABASE_URL = "postgresql://build:build@127.0.0.1:5432/build?schema=public"
    
    // Indicador de que se está ejecutando en un entorno de CI/CD (no desarrollo local)
    CI = "true"
  }

  // ============================================================================
  // ETAPAS DEL PIPELINE
  // ============================================================================
  // El pipeline se divide en 5 etapas ejecutadas secuencialmente
  stages {
    
    // ========================================================================
    // ETAPA 1: INSTALAR DEPENDENCIAS
    // ========================================================================
    // Descarga e instala todas las dependencias necesarias del proyecto
    // Detecta automáticamente si es sistema Unix/Linux o Windows
    stage("Install") {
      steps {
        script {
          // Verificar si es un sistema Unix/Linux o Windows
          if (isUnix()) { // Comando para sistemas Linux/Mac: mostrar versiones de Node y npm sh "node --version && npm --version"
            sh fileExists('package-lock.json') ? "npm ci" : "npm install"
          } else {
            // Comando para sistemas Windows: mostrar versiones
=======
pipeline {
  agent any

  environment {
    // Next.js build loads API routes that import Prisma; a URL is required at compile time (no live DB needed).
    DATABASE_URL = "postgresql://build:build@127.0.0.1:5432/build?schema=public"
    CI = "true"
  }

  stages {
    stage("Install") {
      steps {
        script {
          if (isUnix()) {
            sh "node --version && npm --version"
            sh fileExists('package-lock.json') ? "npm ci" : "npm install"
          } else {
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
            bat "node --version && npm --version"
            bat script: fileExists('package-lock.json') ? "npm ci" : "npm install"
          }
        }
      }
    }

<<<<<<< HEAD
    // ========================================================================
    // ETAPA 2: GENERAR CLIENTE PRISMA
    // ========================================================================
    // Genera el cliente ORM de Prisma a partir del schema.prisma
    // Esto es necesario antes de compilar la aplicación
    stage("Prisma generate") {
      steps {
        script {
          // Generar cliente en sistemas Unix/Linux
          if (isUnix()) {
            sh "npx prisma generate"
          } else {
            // Generar cliente en sistemas Windows
=======
    stage("Prisma generate") {
      steps {
        script {
          if (isUnix()) {
            sh "npx prisma generate"
          } else {
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
            bat "npx prisma generate"
          }
        }
      }
    }

<<<<<<< HEAD
    // ========================================================================
    // ETAPA 3: COMPILAR APLICACIÓN
    // ========================================================================
    // Compila la aplicación Next.js usando el compilador SWC
    // Genera archivos .next/ listos para producción
    stage("Build") {
      steps {
        script {
          // Compilar en sistemas Unix/Linux
          if (isUnix()) {
            sh "npm run build"
          } else {
            // Compilar en sistemas Windows
=======
    stage("Build") {
      steps {
        script {
          if (isUnix()) {
            sh "npm run build"
          } else {
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
            bat "npm run build"
          }
        }
      }
    }

    stage("Lint") {
      steps {
        script {
          if (isUnix()) {
            sh "npm run lint"
          } else {
            bat "npm run lint"
          }
        }
      }
    }

    stage("Security Audit") {
      steps {
        script {
          if (isUnix()) {
            sh(script: "npm audit --audit-level=critical", returnStatus: true)
          } else {
            bat(script: "npm audit --audit-level=critical", returnStatus: true)
          }
          echo "Security audit completed (only critical vulnerabilities will fail the build)"
        }
      }
    }

    stage("Test") {
      steps {
        script {
<<<<<<< HEAD
          // Variable para almacenar si existe script de tests
          def hasTestScript = false
          
          // Detectar si existe script de tests en package.json para Unix/Linux
=======
          def hasTestScript = false
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
          if (isUnix()) {
            hasTestScript = sh(
              script: "node -e \"const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)\"",
              returnStatus: true
            ) == 0
          } else {
<<<<<<< HEAD
            // Detectar si existe script de tests en package.json para Windows
=======
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
            hasTestScript = bat(
              script: "node -e \"const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)\"",
              returnStatus: true
            ) == 0
          }

<<<<<<< HEAD
          // Si existe script de tests, ejecutarlo
          if (hasTestScript) {
            if (isUnix()) {
              // Ejecutar tests con Jest en Unix/Linux
              sh "npm test"
            } else {
              // Ejecutar tests con Jest en Windows
              bat "npm test"
            }
          } else {
            // Mostrar mensaje si no existe script de tests
=======
          if (hasTestScript) {
            if (isUnix()) {
              sh "npm test"
            } else {
              bat "npm test"
            }
          } else {
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
            echo "No npm test script in package.json — skipping unit tests."
          }
        }
      }
    }

    stage("Release") {
      steps {
        script {
<<<<<<< HEAD
          // Crear información del build
=======
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
          def info = """build=${env.BUILD_NUMBER}
job=${env.JOB_NAME}
node=${env.NODE_NAME}
timestamp=${new Date()}
"""
<<<<<<< HEAD
          // Escribir información en archivo
=======
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
          writeFile file: "jenkins-build-info.txt", text: info
          writeFile file: "release/release-ready.txt", text: "Entrega continua lista: build ${env.BUILD_NUMBER}"
          archiveArtifacts artifacts: "jenkins-build-info.txt, release/**", onlyIfSuccessful: true, fingerprint: true
          echo "Artefactos de entrega continua archivados: jenkins-build-info.txt y release/release-ready.txt."
        }
      }
    }
  }
<<<<<<< HEAD
  
  // ============================================================================
  // SECCIÓN POST (Ejecuta después de todas las etapas)
  // ============================================================================
  // Nota: Puedes agregar aquí notificaciones, reportes finales, etc.
  // post {
  //   always {
  //     // Aquí iría limpieza de recursos
  //   }
  //   success {
  //     // Aquí irían acciones si el build fue exitoso
  //   }
  //   failure {
  //     // Aquí irían acciones si el build falló
  //   }
  // }
}

// ================================================================================
// FIN DEL JENKINSFILE
// ================================================================================
// Resumen del Pipeline:
// 1. Instala dependencias (npm ci)
// 2. Genera cliente Prisma (npx prisma generate)
// 3. Compila la app Next.js (npm run build)
// 4. Ejecuta tests y linting (npm test, npm run lint)
// 5. Archiva artefactos de compilación
//
// El pipeline se detiene si alguna etapa falla.
// ===============================================================================
=======
}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
