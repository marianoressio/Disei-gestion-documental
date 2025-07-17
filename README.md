# Sistema de Gestión Documental DISEI

Sistema profesional de gestión documental para empresas, desarrollado con React, Material UI, Node.js y SQLite.

## 🚀 Características

- **Gestión de Empleados**: Registro completo de empleados con información personal y laboral
- **Gestión de Documentos**: Subida, visualización y descarga de documentos (PDF, JPG)
- **Control de Vencimientos**: Alertas automáticas para documentos por vencer
- **Filtros Avanzados**: Búsqueda y filtrado por empresa, sector, puesto y estado
- **Interfaz Moderna**: Diseño profesional con Material UI
- **Internacionalización**: Soporte para español e inglés
- **Seguridad**: Autenticación con contraseñas hasheadas
- **Responsive**: Compatible con dispositivos móviles y desktop

## 🛠️ Tecnologías Utilizadas

### Frontend

- React 19
- Material UI 6
- i18next (Internacionalización)
- Tailwind CSS
- Vite

### Backend

- Node.js
- Express.js
- SQLite3
- Multer (Manejo de archivos)
- bcrypt (Encriptación)

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd mi-app-productividad
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Inicializar la base de datos

```bash
npm run init-db
```

### 4. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### 1. Iniciar el servidor backend

```bash
cd backend
npm start
```

El servidor se ejecutará en `http://localhost:3001`

### 2. Para producción (Render)

El backend está configurado para desplegarse en Render. Consulta `DEPLOYMENT.md` para instrucciones detalladas.

### 2. Iniciar el frontend

```bash
cd frontend
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

## 👤 Usuarios de Prueba

El sistema incluye usuarios predefinidos:

- **Administrador**: `admin` / `Admin2025!`
- **Usuario Regular**: `user1` / `User2025!`

## 📁 Estructura del Proyecto

```
mi-app-productividad/
├── backend/
│   ├── data/           # Base de datos SQLite
│   ├── uploads/        # Archivos subidos
│   ├── server.js       # Servidor principal
│   ├── init-db.js      # Script de inicialización
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Componente principal
│   │   ├── i18n.js     # Configuración i18next
│   │   └── main.jsx    # Punto de entrada
│   └── package.json
└── README.md
```

## 🔌 Endpoints de la API

### Autenticación

- `POST /login` - Iniciar sesión
- `POST /setup-admin` - Crear usuario administrador

### Empleados

- `GET /employees` - Obtener todos los empleados
- `GET /employees/:id` - Obtener empleado específico
- `POST /employees` - Crear empleado
- `PUT /employees/:id` - Actualizar empleado
- `DELETE /employees/:id` - Eliminar empleado

### Documentos

- `GET /documents` - Obtener todos los documentos
- `GET /documents/:id` - Obtener documento específico
- `POST /documents` - Crear documento
- `PUT /documents/:id` - Actualizar documento
- `DELETE /documents/:id` - Eliminar documento

### Archivos

- `GET /uploads/:filename` - Descargar archivo
- `GET /view/:filename` - Visualizar archivo

## 🎨 Características de la Interfaz

### Dashboard

- Vista general de empleados y documentos
- Filtros por estado (todos, vigentes, vencidos, por vencer)
- Búsqueda en tiempo real
- Notificaciones de documentos por vencer

### Gestión de Empleados

- Formulario completo de registro
- Edición de información
- Eliminación con validaciones
- Filtros por empresa, sector y puesto

### Gestión de Documentos

- Subida de archivos (PDF, JPG)
- Control de fechas de vencimiento
- Estados automáticos (vigente, por vencer, vencido)
- Visualización y descarga de archivos

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de tipos de archivo
- Límite de tamaño de archivo (5MB)
- Protección contra acceso a archivos fuera del directorio
- Bloqueo de cuenta tras múltiples intentos fallidos

## 🌐 Internacionalización

El sistema soporta múltiples idiomas:

- Español (por defecto)
- Inglés

Los textos se cargan dinámicamente según la configuración del navegador.

## 📱 Responsive Design

La interfaz se adapta automáticamente a:

- Dispositivos móviles
- Tablets
- Pantallas de escritorio

## 🚨 Notificaciones

El sistema genera alertas automáticas para:

- Documentos vencidos
- Documentos que vencen en los próximos 30 días

## 🔧 Configuración

### Variables de Entorno

El sistema utiliza configuraciones por defecto, pero puedes modificar:

- Puerto del servidor: `3001`
- Puerto del frontend: `5173`
- Límite de archivo: `10MB`
- Tipos de archivo permitidos: `PDF, JPG`

### Base de Datos

La base de datos SQLite se crea automáticamente en `backend/data/users.db`

## 🐛 Solución de Problemas

### Error de conexión al servidor

1. Verificar que el backend esté ejecutándose en el puerto 3001
2. Comprobar que no haya otro proceso usando el puerto

### Error al subir archivos

1. Verificar que la carpeta `uploads` exista
2. Comprobar permisos de escritura
3. Validar que el archivo sea PDF o JPG

### Error de base de datos

1. Ejecutar `npm run init-db` en el backend
2. Verificar que la carpeta `data` exista

## 📞 Soporte

Para reportar problemas o solicitar nuevas características, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
