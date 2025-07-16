# Documentación de la API - Sistema de Gestión Documental

## Base URL

```
http://localhost:3001
```

## Autenticación

### POST /login

Inicia sesión de un usuario.

**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Administrador",
    "role": "admin"
  }
}
```

**Respuesta de error (401):**

```json
{
  "error": "Usuario no encontrado"
}
```

### POST /setup-admin

Crea el usuario administrador inicial.

**Respuesta exitosa (200):**

```json
{
  "message": "Usuario administrador creado exitosamente"
}
```

## Empleados

### GET /employees

Obtiene todos los empleados ordenados por nombre.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "dni": "12345678",
    "position": "Ingeniero",
    "sector": "Obras",
    "email": "juan@empresa.com",
    "phone": "123456789",
    "empresa": "DISEI"
  }
]
```

### GET /employees/:id

Obtiene un empleado específico por ID.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "name": "Juan Pérez",
  "dni": "12345678",
  "position": "Ingeniero",
  "sector": "Obras",
  "email": "juan@empresa.com",
  "phone": "123456789",
  "empresa": "DISEI"
}
```

**Respuesta de error (404):**

```json
{
  "error": "Empleado no encontrado"
}
```

### POST /employees

Crea un nuevo empleado.

**Body:**

```json
{
  "name": "string",
  "dni": "string",
  "position": "string",
  "sector": "string",
  "email": "string",
  "phone": "string",
  "empresa": "string"
}
```

**Respuesta exitosa (201):**

```json
{
  "id": 1,
  "name": "Juan Pérez",
  "dni": "12345678",
  "position": "Ingeniero",
  "sector": "Obras",
  "email": "juan@empresa.com",
  "phone": "123456789",
  "empresa": "DISEI"
}
```

### PUT /employees/:id

Actualiza un empleado existente.

**Body:**

```json
{
  "name": "string",
  "dni": "string",
  "position": "string",
  "sector": "string",
  "email": "string",
  "phone": "string",
  "empresa": "string"
}
```

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "name": "Juan Pérez",
  "dni": "12345678",
  "position": "Ingeniero",
  "sector": "Obras",
  "email": "juan@empresa.com",
  "phone": "123456789",
  "empresa": "DISEI"
}
```

### DELETE /employees/:id

Elimina un empleado.

**Respuesta exitosa (200):**

```json
{
  "message": "Empleado eliminado exitosamente"
}
```

**Respuesta de error (400):**

```json
{
  "error": "No se puede eliminar el empleado porque tiene documentos asociados. Elimine los documentos primero."
}
```

## Documentos

### GET /documents

Obtiene todos los documentos con información del empleado.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "employeeId": 1,
    "type": "DNI",
    "issueDate": "2024-01-01",
    "expiryDate": "2025-01-01",
    "status": "vigente",
    "fileName": "1234567890-documento.pdf",
    "employeeName": "Juan Pérez",
    "empresa": "DISEI"
  }
]
```

### GET /documents/:id

Obtiene un documento específico por ID.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "employeeId": 1,
  "type": "DNI",
  "issueDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "status": "vigente",
  "fileName": "1234567890-documento.pdf"
}
```

### POST /documents

Crea un nuevo documento con archivo.

**Body (multipart/form-data):**

```
employeeId: 1
type: "DNI"
issueDate: "2024-01-01"
expiryDate: "2025-01-01"
file: [archivo PDF o JPG]
```

**Respuesta exitosa (201):**

```json
{
  "id": 1,
  "employeeId": 1,
  "type": "DNI",
  "issueDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "status": "vigente",
  "fileName": "1234567890-documento.pdf"
}
```

### PUT /documents/:id

Actualiza un documento existente.

**Body (multipart/form-data):**

```
employeeId: 1
type: "DNI"
issueDate: "2024-01-01"
expiryDate: "2025-01-01"
file: [archivo PDF o JPG] (opcional)
```

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "employeeId": 1,
  "type": "DNI",
  "issueDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "status": "vigente",
  "fileName": "1234567890-documento.pdf"
}
```

### DELETE /documents/:id

Elimina un documento y su archivo asociado.

**Respuesta exitosa (200):**

```json
{
  "message": "Documento eliminado exitosamente"
}
```

## Archivos

### GET /uploads/:filename

Descarga un archivo.

**Respuesta exitosa (200):**

- Archivo descargado

**Respuesta de error (404):**

```
Archivo no encontrado
```

### GET /view/:filename

Visualiza un archivo en el navegador.

**Respuesta exitosa (200):**

- Archivo mostrado en el navegador

**Respuesta de error (404):**

```json
{
  "error": "Archivo no encontrado"
}
```

## Códigos de Estado

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos inválidos
- **401**: Unauthorized - No autorizado
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error interno del servidor

## Tipos de Archivo Permitidos

- PDF (.pdf)
- JPEG (.jpg, .jpeg)

## Límites

- Tamaño máximo de archivo: 5MB
- Tipos de archivo: PDF, JPG, JPEG

## Estados de Documentos

- **vigente**: Documento válido
- **por_vencer**: Documento que vence en los próximos 30 días
- **vencido**: Documento vencido
- **inválido**: Fecha de vencimiento inválida

## Empresas Disponibles

- DISEI
- CONELCI

## Sectores Disponibles

- Obras
- Comercial
- Servicios Generales
- Administrativo
- Luz y Fuerza

## Puestos Disponibles

- Ingeniero
- Técnico / Informático
- Contador / Abogado
- Técnico / Oficial especializado
- Operario / Oficial
- Operador de Equipos / Gruista
- Administrativo
- Otro

## Tipos de Documentos

- DNI
- CUIL
- Certificado Médico
- Capacitación de Seguridad
- Contrato de Trabajo
- Seguro
- Otro
