# 🚀 DESPLIEGUE EN GOOGLE CLOUD RUN - POLLERÍA GERSON

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Contenedor: Next.js + Prisma + Node.js              │   │
│  │  Puerto: 8080                                         │   │
│  │  Variables de entorno: DATABASE_URL, JWT_SECRET, etc │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (conexión externa segura)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL EXTERNO (NO en GCP)                 │
│  - Neon / AWS RDS / Azure / Su servidor local, etc.          │
│  - sslmode=require                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## PASO 0: Prerrequisitos

Antes de empezar, asegúrese de tener:

1. **Cuenta de Google Cloud** con facturación habilitada
2. **Google Cloud SDK (gcloud)** instalado en su máquina
   ```bash
   # Verificar instalación
   gcloud version
   
   # Si no está instalado: https://cloud.google.com/sdk/docs/install
   ```
3. **Docker** instalado y ejecutándose
4. **Acceso a su base de datos PostgreSQL externa** (Neon, AWS RDS, etc.)
   - Debe permitir conexiones desde IP de Google Cloud Run (o permitir todo con ssl)

---

## PASO 1: Configurar Google Cloud

```bash
# 1. Autenticarse en Google Cloud
gcloud auth login

# 2. Configurar el proyecto (reemplazar MI-PROYECTO con su ID de proyecto)
gcloud config set project MI-PROYECTO

# 3. Habilitar las APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 4. Crear repositorio en Artifact Registry (una sola vez)
gcloud artifacts repositories create polleria-gerson \
  --repository-format=docker \
  --location=us-central1 \
  --description="Repositorio de imágenes Docker para Pollería Gerson"

# 5. Configurar Docker para autenticarse en Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## PASO 2: Configurar variables de entorno para PostgreSQL externo

Edite el archivo `.env.production` con los datos de SU base de datos externa:

```bash
# Copiar el ejemplo
cp .env.example .env.production

# Editar con sus valores reales
nano .env.production
```

**Ejemplo de configuración para Neon:**
```
DATABASE_URL="postgresql://neondb_owner:npg_xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_DATABASE_URL="postgresql://neondb_owner:npg_xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="clave-super-secreta-aleatoria-de-al-menos-32-caracteres"
NODE_ENV=production
PORT=8080
NEXT_PUBLIC_APP_URL="https://su-servicio-a1b2c3.run.app"
```

**⚠️ IMPORTANTE:** Su base de datos PostgreSQL debe aceptar conexiones externas con SSL. Si usa Neon, ya viene configurado. Si usa otro proveedor, asegúrese de:
- Habilitar SSL/TLS
- Permitir conexiones desde IP de Google Cloud Run (o configurar firewall para permitir todo con autenticación)

---

## PASO 3: Despliegue usando Cloud Build (Recomendado)

### Opción A: Despliegue automático con cloudbuild.yaml

```bash
# Enviar código a Google Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

Este comando:
1. Construye la imagen Docker
2. La sube a Artifact Registry
3. Despliega en Cloud Run

### Opción B: Despliegue manual con gcloud

```bash
# 1. Construir la imagen localmente
docker build -t us-central1-docker.pkg.dev/MI-PROYECTO/polleria-gerson/polleria-gerson:latest .

# 2. Subir la imagen
docker push us-central1-docker.pkg.dev/MI-PROYECTO/polleria-gerson/polleria-gerson:latest

# 3. Desplegar en Cloud Run
gcloud run deploy polleria-gerson \
  --image us-central1-docker.pkg.dev/MI-PROYECTO/polleria-gerson/polleria-gerson:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production,PORT=8080,DATABASE_URL=su-url-de-base-de-datos,DIRECT_DATABASE_URL=su-url-directa,JWT_SECRET=su-clave-secreta,NEXT_PUBLIC_APP_URL=https://su-dominio.com"
```

---

## PASO 4: Configurar variables de entorno en Cloud Run (CRÍTICO)

Después del despliegue, debe configurar las variables de entorno en la consola de Google Cloud:

1. Vaya a **Cloud Run** en la consola de Google Cloud
2. Haga clic en su servicio `polleria-gerson`
3. Haga clic en **EDITAR Y DESPLEGAR NUEVA REVISIÓN**
4. En la sección **Variables de entorno**, agregue:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://usuario:password@host:5432/db?sslmode=require` |
| `DIRECT_DATABASE_URL` | `postgresql://usuario:password@host:5432/db?sslmode=require` |
| `JWT_SECRET` | `su-clave-secreta-muy-segura` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `NEXT_PUBLIC_APP_URL` | `https://su-servicio-xxx.run.app` |

5. Haga clic en **DESCARTAR Y DESPLEGAR** (o desplegar)

---

## PASO 5: Ejecutar migraciones de base de datos

El Dockerfile incluye `npx prisma migrate deploy` en el CMD, por lo que las migraciones se ejecutan automáticamente al iniciar el contenedor.

Si necesita ejecutarlas manualmente:

```bash
# Opción 1: Desde Cloud Shell con las variables configuradas
gcloud run services execute-command polleria-gerson \
  --region us-central1 \
  --command="npx prisma migrate deploy"

# Opción 2: Desde su máquina local con DATABASE_URL configurada
DATABASE_URL="su-url" npx prisma migrate deploy
```

---

## PASO 6: Verificar el despliegue

```bash
# Obtener la URL del servicio
gcloud run services describe polleria-gerson --region us-central1 --format="value(status.url)"

# Probar el health check
curl https://su-servicio-a1b2c3.run.app/api/health

# Debe responder: {"status":"healthy","database":"connected",...}
```

---

## 📊 FLUJO DE ATENCIÓN - VERIFICACIÓN DESPUÉS DEL DESPLIEGUE

Una vez desplegado, verifique que todo funcione correctamente:

| Paso | Usuario | Acción | URL | Resultado esperado |
|------|---------|--------|-----|-------------------|
| 1 | Mesero | Crear pedido | `/mesas` | Mesa cambia a "Ocupada" |
| 2 | Cocinero | Cambiar estado | `/cocina` | Pedido: EN_PREPARACION → EN_PROCESO → LISTO → SERVIDO |
| 3 | Mesero | Ver mesa | `/mesas` | Mesa sigue "Ocupada" (NO se libera al servir) |
| 4 | Cajero | Ver pedidos | `/pagos` | Ve pedido en estado "SERVIDO" |
| 5 | Cajero | Procesar pago | `/pagos` | Pedido: PAGADO, Mesa: "Libre" |
| 6 | Mesero | Ver mesa | `/mesas` | Mesa muestra "Libre" (automático cada 3s) |
| 7 | Cajero | Finanzas | `/finanzas` | Ve el ingreso registrado |

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Database connection failed"
- Verifique que `DATABASE_URL` esté correctamente configurado en Cloud Run
- Verifique que su base de datos acepte conexiones desde Google Cloud Run
- Verifique que `sslmode=require` esté en la URL

### Error: "Prisma migrate deploy failed"
- Verifique que `DIRECT_DATABASE_URL` esté configurado
- Asegúrese de que el usuario de la base de datos tenga permisos para crear tablas

### Error: 401 No autorizado
- Verifique que `JWT_SECRET` esté configurado igual que en desarrollo
- Los usuarios deben iniciar sesión de nuevo después del despliegue

### La aplicación no carga (puerto)
- Cloud Run espera el puerto 8080. El Dockerfile ya está configurado para usarlo.
- Verifique que `PORT=8080` esté en las variables de entorno

### Las mesas no se actualizan en tiempo real
- El frontend usa polling cada 3 segundos. Esto es normal y esperado.
- Si no se actualiza, verifique que no haya errores de red en la consola del navegador

---

## 💰 COSTOS ESTIMADOS (Cloud Run)

| Recurso | Configuración | Costo mensual aproximado |
|---------|--------------|-------------------------|
| CPU | 1 vCPU | ~$15-25 USD |
| Memoria | 512 MiB | ~$5-10 USD |
| Solicitudes | 2 millones/mes | Gratis (incluido) |
| **Total estimado** | | **~$20-35 USD/mes** |

*Nota: Los costos pueden variar según el uso real y la región.*

---

## 🔐 SEGURIDAD

1. **JWT_SECRET**: Cambie la clave por defecto en producción
2. **DATABASE_URL**: Nunca suba este archivo a git (está en .gitignore)
3. **SSL**: Siempre use `sslmode=require` para conexiones externas
4. **Cloud IAM**: Restrinja quién puede desplegar y administrar el servicio

---

## 📝 RESUMEN DE ARCHIVOS CREADOS/MODIFICADOS

| Archivo | Descripción |
|---------|-------------|
| `Dockerfile` | Optimizado para Cloud Run (puerto 8080, standalone output) |
| `next.config.mjs` | `output: 'standalone'` para Docker |
| `.env.example` | Plantilla de variables de entorno |
| `cloudbuild.yaml` | Pipeline de CI/CD para Cloud Build |
| `.gcloudignore` | Archivos a excluir del despliegue |
| `.dockerignore` | Corregido (no excluye Dockerfile) |
| `DEPLOY_GCP.md` | Esta guía |