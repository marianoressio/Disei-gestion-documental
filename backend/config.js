// Configuración del servidor
export const config = {
  // Servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Base de datos
  dbPath: process.env.DB_PATH || "./data/users.db",

  // Archivos
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "pdf,jpg,jpeg").split(
    ","
  ),

  // Seguridad
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 3,
  loginLockTime: parseInt(process.env.LOGIN_LOCK_TIME) || 5 * 60 * 1000, // 5 minutos

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Empresas disponibles
  companies: ["DISEI", "CONELCI"],

  // Sectores disponibles
  sectors: [
    "Obras",
    "Comercial",
    "Servicios Generales",
    "Administrativo",
    "Luz y Fuerza",
  ],

  // Puestos disponibles
  positions: [
    "Ingeniero",
    "Técnico / Informático",
    "Contador / Abogado",
    "Técnico / Oficial especializado",
    "Operario / Oficial",
    "Operador de Equipos / Gruista",
    "Administrativo",
    "Otro",
  ],

  // Tipos de documentos
  documentTypes: [
    "Estudio Médico",
    "Habilitación TCT",
    "Carnet de conducir",
    "DNI",
    "CUIL",
    "Certificado Médico",
    "Capacitación de Seguridad",
    "Contrato de Trabajo",
    "Seguro",
    "Otro",
  ],
};

export default {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  dbPath: process.env.DB_PATH || "./data/users.db",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
    ".pdf",
    ".jpg",
    ".jpeg",
  ],
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  // Configuración de email
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};
