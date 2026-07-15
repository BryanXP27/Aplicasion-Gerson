# 🚀 GUÍA PARA DESPLEGAR EN VERCEL

**Estado Actual:** ✅ Aplicación funciona localmente  
**Objetivo:** 🎯 Desplegar en Vercel sin perder configuración local

---

## ⚠️ PROBLEMA IDENTIFICADO

El `.env.production` tenía una **BD antigua**:
```
ep-morning-cherry-acmnmz9o.sa-east-1.aws.neon.tech  ❌ ANTIGUO
```

**Actualizado a:**
```
ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech  ✅ NUEVO
```

---

## 📋 PASOS PARA DESPLEGAR EN VERCEL

### **PASO 1: Configurar Variables en Vercel Dashboard**

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `aplicacion-web-polleria-gerson`
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (SIN commit a .env):

```
DATABASE_URL = postgresql://neondb_owner:[REDACTED]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET = (genera una clave segura aquí: https://www.uuidgenerator.net/)

NODE_ENV = production
```

⚠️ **NUNCA** agregar `[REDACTED]` - reemplaza con tu contraseña real

---

### **PASO 2: Verificar Configuración Local**

Tu `.env.local` está bien:
```
DATABASE_URL="postgresql://neondb_owner:[REDACTED]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="GersonPollosJWTSecretKeyForProductionEnvironment2026"
```

✅ Esto seguirá funcionando localmente

---

### **PASO 3: Push a GitHub**

```bash
# Desde tu terminal, en la carpeta del proyecto:
git add .
git commit -m "fix: Update Vercel config and environment variables"
git push origin main
```

---

### **PASO 4: Monitorear Deploy en Vercel**

1. Ve a tu dashboard de Vercel
2. Verás que empieza un nuevo deploy automáticamente
3. Espera a que termine (2-3 minutos)
4. Si hay error, revisar los logs en Vercel → Deployments → View Logs

---

## 🔍 CAUSAS COMUNES DE ERROR EN VERCEL

### **1. DATABASE_URL Incorrecta** ❌
- Host antiguo
- Contraseña falta
- SSL mode incorrecto

**Solución:** Usar la correcta en Vercel Dashboard

### **2. NODE_ENV no configurado** ❌
Vercel necesita saber que es producción

**Solución:** Agregar `NODE_ENV = production`

### **3. JWT_SECRET no configurado** ❌
La app falla sin una clave JWT

**Solución:** Agregar una clave fuerte

### **4. Build falla por Prisma** ❌
Si Prisma no puede generar cliente

**Solución:** Agregar `DATABASE_URL` en Vercel antes de hacer deploy

---

## ✅ VERIFICACIÓN PRE-DEPLOY

Antes de hacer push, verifica que:

```bash
# 1. Build local funciona
npm run build
# ✓ Si ves "Route (app)" = OK

# 2. Sin errores críticos
npm run dev
# ✓ Si http://localhost:3000 funciona = OK

# 3. Los cambios están guardados
git status
# ✓ Debe ver los archivos modificados
```

---

## 📊 ARCHIVO vercel.json

Se creó un archivo `vercel.json` con:
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- API timeout: 30 segundos
- Cache control para `/api/*`

Este archivo ayuda a Vercel a hacer deploy más eficiente.

---

## 🎯 DESPUÉS DEL DEPLOY

Una vez que Vercel termine:

```bash
# Probar que funciona
curl https://tu-app.vercel.app/api/health
# Debe responder 200 OK

# Ver logs en tiempo real
vercel logs --follow
```

---

## ⚠️ IMPORTANTE: NO PERDER CONFIGURACIÓN LOCAL

Tu configuración local está **100% protegida**:
- `.env.local` → Solo dev local, no tocado
- `.gitignore` → `.env.local` no se commitea
- GitHub → Solo código, sin secrets

**En Vercel:**
- Variables separadas en Dashboard
- NO commiteas secrets a GitHub
- Cada ambiente tiene sus propias variables

---

## 🔐 SEGURIDAD

**NUNCA hagas esto:**
```
❌ Agregar contraseña real a .env.production
❌ Hacer commit de .env.local
❌ Usar la misma JWT_SECRET en prod y dev
❌ Exponer DATABASE_URL en logs
```

**Siempre hacer esto:**
```
✅ Configurar variables en Vercel Dashboard
✅ Usar diferentes JWT_SECRET por ambiente
✅ No commitear archivos .env
✅ Usar contraseña fuerte (no "change-this")
```

---

## 📞 SI SIGUE HABIENDO ERROR

Comparte el **log completo del error** de Vercel:

1. Ve a Vercel Dashboard
2. Tu proyecto → Deployments → El deployment fallido
3. Haz click en "View Logs"
4. Copia TODO el contenido
5. Pégalo aquí para que analice específicamente

Con el log completo podré identificar el problema exacto.

---

## ✨ RESUMEN

1. ✅ Actualicé `.env.production` con BD nueva
2. ✅ Creé `vercel.json` para optimizar build
3. 📋 Ahora sigue los pasos de configuración en Vercel Dashboard
4. 🚀 Push a GitHub cuando esté listo

**NO hay riesgo de perder configuración local.** Cada ambiente es independiente.
