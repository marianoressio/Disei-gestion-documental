import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  es: {
    translation: {
      // Login
      login: "Iniciar Sesión",
      username: "Usuario",
      password: "Contraseña",
      loginError: "Usuario o contraseña incorrectos",
      serverError: "Error al conectar con el servidor",
      accountLocked: "Cuenta bloqueada. Intente de nuevo en 5 minutos.",
      tooManyAttempts: "Demasiados intentos. Cuenta bloqueada por 5 minutos.",

      // Dashboard
      dashboard: "Panel Principal",
      employees: "Empleados",
      documents: "Documentos",
      notifications: "Notificaciones",
      settings: "Configuración",
      logout: "Cerrar Sesión",
      hello: "Hola",

      // Employees
      addEmployee: "Agregar Empleado",
      editEmployee: "Editar Empleado",
      deleteEmployee: "Eliminar Empleado",
      employeeName: "Nombre",
      dni: "DNI",
      position: "Puesto",
      sector: "Sector",
      email: "Email",
      phone: "Teléfono",
      company: "Empresa",
      allEmployees: "Todos los Empleados",
      searchEmployees: "Buscar empleados...",

      // Documents
      addDocument: "Agregar Documento",
      editDocument: "Editar Documento",
      deleteDocument: "Eliminar Documento",
      documentType: "Tipo de Documento",
      issueDate: "Fecha de Emisión",
      expiryDate: "Fecha de Vencimiento",
      status: "Estado",
      file: "Archivo",
      download: "Descargar",
      view: "Ver",
      uploadFile: "Subir archivo",

      // Status
      valid: "Vigente",
      expired: "Vencido",
      expiring: "Por Vencer",
      invalid: "Inválido",

      // Companies
      disei: "DISEI",
      conelci: "CONELCI",

      // Sectors
      obras: "Obras",
      comercial: "Comercial",
      serviciosGenerales: "Servicios Generales",
      administrativo: "Administrativo",
      luzYFuerza: "Luz y Fuerza",

      // Positions
      ingeniero: "Ingeniero",
      tecnicoInformatico: "Técnico / Informático",
      contadorAbogado: "Contador / Abogado",
      tecnicoOficial: "Técnico / Oficial especializado",
      operarioOficial: "Operario / Oficial",
      operadorEquipos: "Operador de Equipos / Gruista",
      administrativo: "Administrativo",
      otro: "Otro",

      // Actions
      save: "Guardar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      close: "Cerrar",
      edit: "Editar",
      delete: "Eliminar",
      add: "Agregar",
      search: "Buscar",
      filter: "Filtrar",
      clear: "Limpiar",

      // Messages
      employeeAdded: "Empleado agregado exitosamente",
      employeeUpdated: "Empleado actualizado exitosamente",
      employeeDeleted: "Empleado eliminado exitosamente",
      documentAdded: "Documento agregado exitosamente",
      documentUpdated: "Documento actualizado exitosamente",
      documentDeleted: "Documento eliminado exitosamente",
      errorOccurred: "Ocurrió un error",
      confirmDelete: "¿Está seguro de que desea eliminar este elemento?",
      cannotDeleteEmployee:
        "No se puede eliminar el empleado porque tiene documentos asociados",

      // Validation
      requiredField: "Este campo es requerido",
      invalidEmail: "Email inválido",
      invalidPhone: "Teléfono inválido",
      invalidDNI: "DNI inválido",
      fileRequired: "Debe seleccionar un archivo",
      fileSizeLimit: "El archivo no puede superar 5MB",
      fileTypeNotAllowed: "Solo se permiten archivos PDF o JPG",

      // Document Types
      dni: "DNI",
      cuil: "CUIL",
      medicalCertificate: "Certificado Médico",
      safetyTraining: "Capacitación de Seguridad",
      workContract: "Contrato de Trabajo",
      insurance: "Seguro",
      other: "Otro",

      // System
      documentManagementSystem: "Sistema de Gestión Documental",
      testData: "Datos de prueba",
      adminUser: "admin / Admin2025! (Admin)",
      regularUser: "user1 / User2025! (Usuario)",
      minutes: "minutos",
      days: "días",
      expired: "vencido",
      expiring: "por vencer",
      valid: "vigente",
    },
  },
  en: {
    translation: {
      // Login
      login: "Login",
      username: "Username",
      password: "Password",
      loginError: "Incorrect username or password",
      serverError: "Error connecting to server",
      accountLocked: "Account locked. Try again in 5 minutes.",
      tooManyAttempts: "Too many attempts. Account locked for 5 minutes.",

      // Dashboard
      dashboard: "Dashboard",
      employees: "Employees",
      documents: "Documents",
      notifications: "Notifications",
      settings: "Settings",
      logout: "Logout",
      hello: "Hello",

      // Employees
      addEmployee: "Add Employee",
      editEmployee: "Edit Employee",
      deleteEmployee: "Delete Employee",
      employeeName: "Name",
      dni: "ID Number",
      position: "Position",
      sector: "Sector",
      email: "Email",
      phone: "Phone",
      company: "Company",
      allEmployees: "All Employees",
      searchEmployees: "Search employees...",

      // Documents
      addDocument: "Add Document",
      editDocument: "Edit Document",
      deleteDocument: "Delete Document",
      documentType: "Document Type",
      issueDate: "Issue Date",
      expiryDate: "Expiry Date",
      status: "Status",
      file: "File",
      download: "Download",
      view: "View",
      uploadFile: "Upload file",

      // Status
      valid: "Valid",
      expired: "Expired",
      expiring: "Expiring",
      invalid: "Invalid",

      // Companies
      disei: "DISEI",
      conelci: "CONELCI",

      // Sectors
      obras: "Construction",
      comercial: "Commercial",
      serviciosGenerales: "General Services",
      administrativo: "Administrative",
      luzYFuerza: "Power and Light",

      // Positions
      ingeniero: "Engineer",
      tecnicoInformatico: "Technician / IT",
      contadorAbogado: "Accountant / Lawyer",
      tecnicoOficial: "Technician / Specialized Official",
      operarioOficial: "Worker / Official",
      operadorEquipos: "Equipment Operator / Crane Operator",
      administrativo: "Administrative",
      otro: "Other",

      // Actions
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      search: "Search",
      filter: "Filter",
      clear: "Clear",

      // Messages
      employeeAdded: "Employee added successfully",
      employeeUpdated: "Employee updated successfully",
      employeeDeleted: "Employee deleted successfully",
      documentAdded: "Document added successfully",
      documentUpdated: "Document updated successfully",
      documentDeleted: "Document deleted successfully",
      errorOccurred: "An error occurred",
      confirmDelete: "Are you sure you want to delete this item?",
      cannotDeleteEmployee:
        "Cannot delete employee because they have associated documents",

      // Validation
      requiredField: "This field is required",
      invalidEmail: "Invalid email",
      invalidPhone: "Invalid phone number",
      invalidDNI: "Invalid ID number",
      fileRequired: "You must select a file",
      fileSizeLimit: "File cannot exceed 5MB",
      fileTypeNotAllowed: "Only PDF or JPG files are allowed",

      // Document Types
      dni: "ID Card",
      cuil: "Tax ID",
      medicalCertificate: "Medical Certificate",
      safetyTraining: "Safety Training",
      workContract: "Work Contract",
      insurance: "Insurance",
      other: "Other",

      // System
      documentManagementSystem: "Document Management System",
      testData: "Test Data",
      adminUser: "admin / Admin2025! (Admin)",
      regularUser: "user1 / User2025! (User)",
      minutes: "minutes",
      days: "days",
      expired: "expired",
      expiring: "expiring",
      valid: "valid",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
