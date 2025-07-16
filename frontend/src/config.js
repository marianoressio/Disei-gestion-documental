// Configuración del frontend
export const config = {
  // URL del backend - usa variable de entorno o localhost por defecto
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001",

  // Configuración de la aplicación
  appName: "Sistema de Gestión Documental DISEI",
  version: "1.0.0",

  // Configuración de archivos
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [".pdf", ".jpg", ".jpeg"],

  // Configuración de la interfaz
  itemsPerPage: 10,
  autoRefreshInterval: 30000, // 30 segundos
};

// Función para construir URLs del API
export const apiUrls = {
  login: () => `${config.apiUrl}/login`,
  employees: () => `${config.apiUrl}/employees`,
  employee: (id) => `${config.apiUrl}/employees/${id}`,
  documents: () => `${config.apiUrl}/documents`,
  document: (id) => `${config.apiUrl}/documents/${id}`,
  upload: (filename) => `${config.apiUrl}/uploads/${filename}`,
  view: (filename) => `${config.apiUrl}/view/${filename}`,
  expiryStats: () => `${config.apiUrl}/api/expiry-stats`,
  testEmail: () => `${config.apiUrl}/api/test-email`,
  checkExpiring: () => `${config.apiUrl}/api/check-expiring-documents`,
};

export default config;
