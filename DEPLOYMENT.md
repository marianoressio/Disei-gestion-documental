# 🚀 Guía de Despliegue Gratuito

## 📋 Resumen

- **Frontend:** Vercel (Gratis)
- **Backend:** Railway (Gratis hasta $5/mes)
- **Base de datos:** SQLite (incluida)
- **Emails:** Gmail SMTP (Gratis)

---

## 🔧 Paso 1: Preparar el Backend (Railway)

### 1.1 Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Crea un nuevo proyecto

### 1.2 Conectar repositorio

1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio de GitHub
4. Selecciona la carpeta `backend`

### 1.3 Configurar variables de entorno

En Railway, ve a la pestaña "Variables" y agrega:

```env
EMAIL_USER=comprasdisei@gmail.com
EMAIL_PASS=zzhw phnq xhdp ywsa
CORS_ORIGIN=https://tu-frontend-url.vercel.app
PORT=3001
DB_PATH=./data/users.db
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg
BCRYPT_ROUNDS=10
```

### 1.4 Desplegar

1. Railway detectará automáticamente que es un proyecto Node.js
2. Se construirá y desplegará automáticamente
3. Copia la URL generada (ej: `https://tu-app.railway.app`)

---

## 🌐 Paso 2: Preparar el Frontend (Vercel)

### 2.1 Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub
3. Importa tu repositorio

### 2.2 Configurar el proyecto

1. En Vercel, selecciona la carpeta `frontend`
2. Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`

### 2.3 Configurar variables de entorno

En Vercel, ve a Settings > Environment Variables y agrega:

```env
VITE_API_URL=https://tu-backend-url.railway.app
```

### 2.4 Actualizar vercel.json

Reemplaza `tu-backend-url.railway.app` con tu URL real de Railway en `frontend/vercel.json`

### 2.5 Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu frontend
3. Copia la URL generada

---

## 🔄 Paso 3: Actualizar URLs

### 3.1 En Railway (Backend)

Actualiza la variable `CORS_ORIGIN` con tu URL de Vercel:

```env
CORS_ORIGIN=https://tu-frontend-url.vercel.app
```

### 3.2 En Vercel (Frontend)

Actualiza la variable `VITE_API_URL` con tu URL de Railway:

```env
VITE_API_URL=https://tu-backend-url.railway.app
```

---

## 🧪 Paso 4: Probar el sistema

### 4.1 Verificar usuarios

Accede a tu app desplegada y prueba el login con:

- **Sandra:** `sandra` / `Sandra2025!`
- **Laura:** `laura` / `Laura2025!`
- **Anabella:** `anabella` / `Anabella2025!`
- **Mariano:** `mariano` / `Mariano2025!`

### 4.2 Probar alertas de email

1. Agrega un empleado y documento
2. Establece una fecha de vencimiento para mañana
3. Ejecuta: `POST https://tu-backend-url.railway.app/api/check-expiring-documents`
4. Verifica que lleguen los emails

---

## 📧 Configuración de Email

### Gmail SMTP (Ya configurado)

- **Email:** comprasdisei@gmail.com
- **Contraseña de app:** zzhw phnq xhdp ywsa
- **Destinatarios:** Sandra, Laura, Anabella, Mariano

### Alertas automáticas

- **30 días antes** del vencimiento
- **1 día antes** del vencimiento
- **Hora:** 9:00 AM (Argentina)
- **Frecuencia:** Diaria

---

## 🔧 Comandos útiles

### Verificar estado del backend

```bash
GET https://tu-backend-url.railway.app/api/expiry-stats
```

### Ejecutar revisión manual

```bash
POST https://tu-backend-url.railway.app/api/check-expiring-documents
```

---

## 💰 Costos

- **Vercel:** Gratis (hasta 100GB de transferencia)
- **Railway:** Gratis (hasta $5/mes)
- **Gmail SMTP:** Gratis (hasta 500 emails/día)
- **Total:** $0/mes

---

## 🆘 Solución de problemas

### Error de CORS

- Verifica que `CORS_ORIGIN` en Railway coincida con tu URL de Vercel

### Emails no llegan

- Verifica las credenciales de Gmail en Railway
- Revisa los logs en Railway

### Base de datos no persiste

- Railway reinicia el contenedor, pero SQLite se guarda en el volumen
- Los datos deberían persistir entre reinicios

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando con:

- ✅ Frontend en Vercel
- ✅ Backend en Railway
- ✅ Alertas automáticas por email
- ✅ Usuarios de producción configurados
- ✅ Todo completamente gratuito
