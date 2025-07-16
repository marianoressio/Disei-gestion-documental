# 🚀 Guía de Despliegue Gratuito

## 📋 Resumen

- **Frontend:** Vercel (Gratis)
- **Backend:** Render (Gratis - 750 horas/mes)
- **Base de datos:** SQLite (incluida)
- **Emails:** Gmail SMTP (Gratis)

---

## 🔧 Paso 1: Preparar el Backend (Render)

### 1.1 Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Crea una nueva cuenta gratuita

### 1.2 Conectar repositorio

1. En Render, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona la carpeta `backend`

### 1.3 Configurar el servicio

**Configuración básica:**

- **Name:** `disei-backend` (o el nombre que prefieras)
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (más cercano a Argentina)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 1.4 Configurar variables de entorno

En Render, ve a "Environment" y agrega estas variables:

```env
EMAIL_USER=comprasdisei@gmail.com
EMAIL_PASS=zzhw phnq xhdp ywsa
CORS_ORIGIN=https://disei-gestion.vercel.app
PORT=3001
DATABASE_URL=postgresql://disei_user:password@host:port/disei_db
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg
BCRYPT_ROUNDS=10
NODE_ENV=production
```

### 1.5 Desplegar

1. Haz clic en "Create Web Service"
2. Render construirá y desplegará automáticamente
3. Copia la URL generada (ej: `https://tu-app.onrender.com`)

**Nota:** El primer deploy puede tardar 5-10 minutos.

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
VITE_API_URL=https://tu-backend-url.onrender.com
```

### 2.4 Actualizar vercel.json

Reemplaza `tu-backend-url.onrender.com` con tu URL real de Render en `frontend/vercel.json`

### 2.5 Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu frontend
3. Copia la URL generada

---

## 🔄 Paso 3: Actualizar URLs

### 3.1 En Render (Backend)

Actualiza la variable `CORS_ORIGIN` con tu URL de Vercel:

```env
CORS_ORIGIN=https://tu-frontend-url.vercel.app
```

### 3.2 En Vercel (Frontend)

Actualiza la variable `VITE_API_URL` con tu URL de Render:

```env
VITE_API_URL=https://tu-backend-url.onrender.com
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
3. Ejecuta: `POST https://tu-backend-url.onrender.com/api/check-expiring-documents`
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
GET https://tu-backend-url.onrender.com/api/expiry-stats
```

### Ejecutar revisión manual

```bash
POST https://tu-backend-url.onrender.com/api/check-expiring-documents
```

---

## 💰 Costos

- **Vercel:** Gratis (hasta 100GB de transferencia)
- **Render:** Gratis (750 horas/mes - suficiente para uso personal)
- **Gmail SMTP:** Gratis (hasta 500 emails/día)
- **Total:** $0/mes

---

## 🆘 Solución de problemas

### Error de CORS

- Verifica que `CORS_ORIGIN` en Render coincida con tu URL de Vercel
- Asegúrate de que no haya espacios extra en las URLs

### Emails no llegan

- Verifica las credenciales de Gmail en Render
- Revisa los logs en Render (pestaña "Logs")

### Base de datos no persiste

- Render reinicia el contenedor después de 15 min de inactividad
- Los datos se guardan en el volumen del contenedor
- Para persistencia completa, considera migrar a PostgreSQL (gratis en Render)

### Servicio se duerme

- Render duerme el servicio después de 15 min de inactividad
- La primera petición después del sueño puede tardar 30-60 segundos
- Para evitar esto, puedes usar servicios de "ping" gratuitos

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando con:

- ✅ Frontend en Vercel
- ✅ Backend en Render
- ✅ Alertas automáticas por email
- ✅ Usuarios de producción configurados
- ✅ Todo completamente gratuito

---

## 📝 Notas importantes sobre Render

### Limitaciones del plan gratuito:

- **750 horas/mes** (suficiente para uso personal)
- **Se duerme** después de 15 min de inactividad
- **512MB RAM** disponible
- **1GB** de almacenamiento

### Ventajas:

- **Deploy automático** desde GitHub
- **SSL gratuito**
- **Logs en tiempo real**
- **Muy fácil de configurar**
- **Soporte para Node.js nativo**

### Recomendaciones:

- Monitorea el uso de horas en el dashboard de Render
- Considera usar un servicio de ping para mantener el servicio activo
- Para uso intensivo, considera el plan de pago ($7/mes)
