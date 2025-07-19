import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Upload,
  Download,
  Mail,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  HardHat,
  Users,
  Bell,
  Settings,
  LogOut,
  Archive,
} from "lucide-react";
import { apiUrls } from "./config.js";

// Utilidad para formatear fecha a YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return "";
  return dateString.split("T")[0];
}

const DISEIDocumentSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [currentListView, setCurrentListView] = useState("all");
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterPuesto, setFilterPuesto] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showEditDocument, setShowEditDocument] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const [selectedEmployeeToEdit, setSelectedEmployeeToEdit] = useState(null);
  const [selectedDocumentToEdit, setSelectedDocumentToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isSavingDocument, setIsSavingDocument] = useState(false);

  const empresas = ["DISEI", "CONELCI"];
  const sectores = [
    "Obras",
    "Comercial",
    "Servicios Generales",
    "Administrativo",
    "Luz y Fuerza",
  ];
  const puestos = [
    "Ingeniero",
    "Técnico / Informático",
    "Contador / Abogado",
    "Técnico / Oficial especializado",
    "Operario / Oficial",
    "Operador de Equipos / Gruista",
    "Administrativo",
    "Otro",
  ];

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setCurrentView("dashboard");
      } catch (error) {
        console.error("Error al parsear usuario del localStorage:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchEmployees();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(apiUrls.employees());
      if (response.status === 401) {
        // Sesión expirada, cerrar sesión
        logout();
        return;
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(apiUrls.documents());
      if (response.status === 401) {
        // Sesión expirada, cerrar sesión
        logout();
        return;
      }
      const data = await response.json();
      // Mapear campos del backend a los esperados por el frontend
      const mapped = Array.isArray(data)
        ? data.map((doc) => ({
            ...doc,
            employeeId: doc.employeeId ?? doc.employeeid,
            issueDate: doc.issueDate ?? doc.issuedate,
            expiryDate: doc.expiryDate ?? doc.expirydate,
            fileName: doc.fileName ?? doc.filename,
          }))
        : [];
      setDocuments(mapped);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      setDocuments([]);
    }
  };

  const addEmployee = async (employeeData) => {
    setIsAddingEmployee(true);
    const response = await fetch(apiUrls.employees(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    const data = await response.json();
    setEmployees([...employees, data]);
    setShowAddEmployee(false);
    setIsAddingEmployee(false);
  };

  const updateEmployee = async (id, employeeData) => {
    await fetch(apiUrls.employee(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    fetchEmployees();
    setShowEditEmployee(false);
  };

  const deleteEmployee = async (id) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer y eliminará todos sus documentos."
      )
    ) {
      return;
    }
    await fetch(apiUrls.employee(id), {
      method: "DELETE",
    });
    setEmployees(employees.filter((emp) => emp.id !== id));
    if (selectedEmployee && selectedEmployee.id === id)
      setSelectedEmployee(null);
  };

  const addDocument = async (documentData) => {
    const formData = new FormData();
    formData.append("employeeId", documentData.employeeId);
    formData.append("type", documentData.type);
    formData.append("issueDate", documentData.issueDate);
    formData.append("expiryDate", documentData.expiryDate);
    if (documentData.file) {
      formData.append("file", documentData.file);
    }

    const response = await fetch(apiUrls.documents(), {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      // Recargar empleados y documentos desde el servidor
      await fetchEmployees();
      await fetchDocuments();
      setShowAddDocument(false);
    } else {
      alert("Error al subir el documento: " + data.error);
    }
  };

  const updateDocument = async (id, documentData) => {
    setIsSavingDocument(true);
    const formData = new FormData();
    formData.append("employeeId", documentData.employeeId);
    formData.append("type", documentData.type);
    formData.append("issueDate", documentData.issueDate);
    formData.append("expiryDate", documentData.expiryDate);
    if (documentData.file) {
      formData.append("file", documentData.file);
    } else {
      formData.append("fileName", documentData.fileName);
    }

    const response = await fetch(apiUrls.document(id), {
      method: "PUT",
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      await fetchDocuments();
      setShowEditDocument(false);
    } else {
      alert("Error al actualizar el documento: " + data.error);
    }
    setIsSavingDocument(false);
  };

  const deleteDocument = async (id) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    await fetch(apiUrls.document(id), {
      method: "DELETE",
    });
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const generateNotifications = useCallback(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const alerts = (Array.isArray(documents) ? documents : [])
      .filter((doc) => Number(doc.archived) === 0)
      .map((doc) => {
        const employee = employees.find((emp) => emp.id === doc.employeeId);
        if (!employee) return null;
        const expiryDate = new Date(doc.expiryDate);
        if (isNaN(expiryDate.getTime())) return null;
        if (expiryDate < now) {
          return {
            id: `expired-${doc.id}`,
            type: "expired",
            message: `${doc.type} de ${employee.name} venció el ${formatDate(
              doc.expiryDate
            )}`,
            priority: "high",
            date: now.toISOString(),
          };
        } else if (expiryDate < thirtyDaysFromNow) {
          return {
            id: `warning-${doc.id}`,
            type: "warning",
            message: `${doc.type} de ${employee.name} vence el ${formatDate(
              doc.expiryDate
            )}`,
            priority: "medium",
            date: now.toISOString(),
          };
        }
        return null;
      })
      .filter(Boolean);
    setNotifications(alerts);
  }, [documents, employees]);

  useEffect(() => {
    generateNotifications();
    const checkLock = () => {
      if (lockUntil && new Date() >= new Date(lockUntil)) {
        setIsLocked(false);
        setLoginAttempts(0);
        setLockUntil(null);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 60000);
    return () => clearInterval(interval);
  }, [generateNotifications, lockUntil]);

  // Cerrar el panel de notificaciones al hacer clic fuera
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e) => {
      const dropdown = document.getElementById("notification-dropdown");
      if (dropdown && !dropdown.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  const getDocumentStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return {
        status: "inválido",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
    }
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0)
      return { status: "vencido", color: "text-red-600", bgColor: "bg-red-50" };
    if (daysUntilExpiry <= 30)
      return {
        status: "por_vencer",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return {
      status: "vigente",
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const login = async (username, password, setError) => {
    if (isLocked) {
      setError("Cuenta bloqueada. Intente de nuevo en 5 minutos.");
      return false;
    }
    try {
      const response = await fetch(apiUrls.login(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginAttempts(loginAttempts + 1);
        if (loginAttempts + 1 >= 3) {
          setIsLocked(true);
          setLockUntil(new Date(Date.now() + 5 * 60 * 1000).toISOString());
          setError("Demasiados intentos. Cuenta bloqueada por 5 minutos.");
        } else {
          setError(data.error || "Usuario o contraseña incorrectos");
        }
        return false;
      }
      setCurrentUser(data.user);
      setCurrentView("dashboard");
      setLoginAttempts(0);
      setError("");
      // Guardar usuario en localStorage para persistir la sesión
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      return true;
    } catch {
      setError("Error al conectar con el servidor");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView("login");
    setCurrentListView("all");
    setFilterEmpresa("");
    setFilterPuesto("");
    setFilterSector("");
    setLoginAttempts(0);
    setIsLocked(false);
    setLockUntil(null);
    localStorage.removeItem("currentUser"); // Limpiar localStorage
  };

  // Solo documentos no archivados para lógica principal
  const activeDocuments = (Array.isArray(documents) ? documents : []).filter(
    (d) =>
      d.archived === 0 ||
      d.archived === false ||
      d.archived === "0" ||
      d.archived === undefined
  );

  const getEmployeeDocuments = useCallback(
    (employeeId) =>
      activeDocuments.filter(
        (doc) => String(doc.employeeId) === String(employeeId)
      ),
    [activeDocuments]
  );

  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    if (currentListView !== "all") {
      filtered = employees.filter((employee) => {
        const employeeDocs = getEmployeeDocuments(employee.id);
        return employeeDocs.some(
          (doc) => getDocumentStatus(doc.expiryDate).status === currentListView
        );
      });
    }
    if (filterEmpresa) {
      filtered = filtered.filter(
        (employee) => employee.empresa === filterEmpresa
      );
    }
    if (filterPuesto) {
      filtered = filtered.filter(
        (employee) => employee.position === filterPuesto
      );
    }
    if (filterSector) {
      filtered = filtered.filter(
        (employee) => employee.sector === filterSector
      );
    }
    return filtered.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.dni.includes(searchTerm) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [
    employees,
    searchTerm,
    currentListView,
    filterEmpresa,
    filterPuesto,
    filterSector,
    getEmployeeDocuments,
  ]);

  // Mostrar pantalla de carga mientras se inicializa
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (currentView === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mb-4"></div>
            <img
              src="/logo.png"
              alt="DISEI Logo"
              className="h-12 mx-auto mb-2"
            />
            <p className="text-gray-600">Sistema de Gestión Documental</p>
          </div>
          <LoginForm
            onLogin={(username, password, setError) =>
              login(username, password, setError)
            }
          />
          {isLocked && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">
                Cuenta bloqueada. Intente de nuevo en{" "}
                {Math.ceil((new Date(lockUntil) - new Date()) / (1000 * 60))}{" "}
                minutos.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div>
                  <img
                    src="/logo.png"
                    alt="DISEI Logo"
                    className="h-6 sm:h-8"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Gestión Documental
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Ver notificaciones"
                  onClick={() => setShowNotifications((v) => !v)}
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div
                    id="notification-dropdown"
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-3 sm:p-4 border-b border-gray-100 font-semibold text-gray-800 flex items-center">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2" />
                      <span className="text-sm sm:text-base">
                        Notificaciones
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 sm:p-4 text-gray-500 text-sm text-center">
                          No hay notificaciones
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 sm:p-4 border-b last:border-b-0 text-xs sm:text-sm ${
                              notification.type === "expired"
                                ? "bg-red-50 text-red-800"
                                : "bg-yellow-50 text-yellow-800"
                            }`}
                          >
                            {notification.message}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:block">
                  Hola, {currentUser?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => setCurrentListView("all")}
            className={`bg-white rounded-lg shadow p-3 sm:p-6 hover:bg-gray-50 transition-colors ${
              currentListView === "all" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  Total Empleados
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {employees.length}
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setCurrentListView("vigente")}
            className={`bg-white rounded-lg shadow p-3 sm:p-6 hover:bg-gray-50 transition-colors ${
              currentListView === "vigente" ? "ring-2 ring-green-500" : ""
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  Docs. Vigentes
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {
                    activeDocuments.filter(
                      (doc) =>
                        getDocumentStatus(doc.expiryDate).status === "vigente"
                    ).length
                  }
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setCurrentListView("por_vencer")}
            className={`bg-white rounded-lg shadow p-3 sm:p-6 hover:bg-gray-50 transition-colors ${
              currentListView === "por_vencer" ? "ring-2 ring-yellow-500" : ""
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">Por Vencer</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {
                    activeDocuments.filter(
                      (doc) =>
                        getDocumentStatus(doc.expiryDate).status ===
                        "por_vencer"
                    ).length
                  }
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setCurrentListView("vencido")}
            className={`bg-white rounded-lg shadow p-3 sm:p-6 hover:bg-gray-50 transition-colors ${
              currentListView === "vencido" ? "ring-2 ring-red-500" : ""
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">Vencidos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {
                    activeDocuments.filter(
                      (doc) =>
                        getDocumentStatus(doc.expiryDate).status === "vencido"
                    ).length
                  }
                </p>
              </div>
            </div>
          </button>
        </div>
        {notifications.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                Alertas Importantes
              </h3>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.type === "expired"
                        ? "bg-red-50 border-red-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Buscar empleado por nombre, DNI, posición o empresa"
              />
            </div>
            <button
              onClick={() => setShowAddEmployee(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
              aria-label="Agregar nuevo empleado"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Empleado</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filterEmpresa"
              >
                Empresa
              </label>
              <select
                id="filterEmpresa"
                value={filterEmpresa}
                onChange={(e) => setFilterEmpresa(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                {empresas.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filterPuesto"
              >
                Puesto
              </label>
              <select
                id="filterPuesto"
                value={filterPuesto}
                onChange={(e) => setFilterPuesto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos</option>
                {puestos.map((puesto) => (
                  <option key={puesto} value={puesto}>
                    {puesto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filterSector"
              >
                Sector
              </label>
              <select
                id="filterSector"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos</option>
                {sectores.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentListView === "all" && "Todos los Empleados"}
              {currentListView === "vigente" &&
                "Empleados con Documentos Vigentes"}
              {currentListView === "por_vencer" &&
                "Empleados con Documentos por Vencer"}
              {currentListView === "vencido" &&
                "Empleados con Documentos Vencidos"}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay empleados que coincidan con los filtros
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const employeeDocs = getEmployeeDocuments(employee.id);
                const expiredDocs = employeeDocs.filter(
                  (doc) =>
                    getDocumentStatus(doc.expiryDate).status === "vencido"
                ).length;
                const expiringSoon = employeeDocs.filter(
                  (doc) =>
                    getDocumentStatus(doc.expiryDate).status === "por_vencer"
                ).length;
                return (
                  <div key={employee.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
                      <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {employee.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            DNI: {employee.dni}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {employee.position} - {employee.sector} (
                            {employee.empresa})
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {employee.email}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Teléfono: {employee.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-gray-500">
                            Documentos: {employeeDocs.length}
                          </p>
                          {expiredDocs > 0 && (
                            <p className="text-xs sm:text-sm text-red-600">
                              🔴 {expiredDocs} vencidos
                            </p>
                          )}
                          {expiringSoon > 0 && (
                            <p className="text-xs sm:text-sm text-yellow-600">
                              ⚠️ {expiringSoon} por vencer
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1 sm:space-x-2">
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="bg-blue-600 text-white px-3 py-2 sm:px-2 sm:py-1 rounded-lg hover:bg-blue-700 transition-colors"
                            aria-label={`Ver documentos de ${employee.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEmployeeToEdit(employee);
                              setShowEditEmployee(true);
                            }}
                            className="bg-green-600 text-white px-3 py-2 sm:px-2 sm:py-1 rounded-lg hover:bg-green-700 transition-colors"
                            aria-label={`Editar ${employee.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id)}
                            className="bg-red-600 text-white px-3 py-2 sm:px-2 sm:py-1 rounded-lg hover:bg-red-700 transition-colors"
                            aria-label={`Eliminar ${employee.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {selectedEmployee && (
        <EmployeeDocumentModal
          employee={selectedEmployee}
          documents={documents.filter(
            (doc) => doc.employeeId === selectedEmployee.id
          )}
          onClose={() => setSelectedEmployee(null)}
          onAddDocument={() => setShowAddDocument(true)}
          onEditDocument={(doc) => {
            setSelectedDocumentToEdit(doc);
            setShowEditDocument(true);
          }}
          onDeleteDocument={deleteDocument}
          getDocumentStatus={getDocumentStatus}
        />
      )}
      {showAddEmployee && (
        <AddEmployeeForm
          onSubmit={addEmployee}
          onClose={() => setShowAddEmployee(false)}
          isAddingEmployee={isAddingEmployee}
        />
      )}
      {showEditEmployee && selectedEmployeeToEdit && (
        <EditEmployeeForm
          employee={selectedEmployeeToEdit}
          onSubmit={(data) => updateEmployee(selectedEmployeeToEdit.id, data)}
          onClose={() => setShowEditEmployee(false)}
        />
      )}
      {showAddDocument && selectedEmployee && (
        <AddDocumentForm
          employee={selectedEmployee}
          documents={getEmployeeDocuments(selectedEmployee.id)}
          onSubmit={addDocument}
          onClose={() => setShowAddDocument(false)}
        />
      )}
      {showEditDocument && selectedDocumentToEdit && (
        <EditDocumentForm
          document={selectedDocumentToEdit}
          onSubmit={(data) => updateDocument(selectedDocumentToEdit.id, data)}
          onClose={() => setShowEditDocument(false)}
          getDocumentStatus={getDocumentStatus}
          employee={selectedEmployeeToEdit}
          isSavingDocument={isSavingDocument}
        />
      )}
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password, setError);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="username"
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          aria-label="Nombre de usuario"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="password"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            aria-label="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        aria-label="Iniciar sesión"
      >
        <Shield className="w-4 h-4" />
        <span>Iniciar Sesión</span>
      </button>
    </form>
  );
};

const AddEmployeeForm = ({ onSubmit, onClose, isAddingEmployee }) => {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [position, setPosition] = useState("");
  const [sector, setSector] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [empresa, setEmpresa] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, dni, position, sector, email, phone, empresa });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Agregar Nuevo Empleado
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar formulario"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="dni"
            >
              DNI
            </label>
            <input
              id="dni"
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="empresa"
            >
              Empresa
            </label>
            <select
              id="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione una empresa
              </option>
              <option value="DISEI">DISEI</option>
              <option value="CONELCI">CONELCI</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="sector"
            >
              Sector
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione un sector
              </option>
              <option value="Obras">Obras</option>
              <option value="Comercial">Comercial</option>
              <option value="Servicios Generales">Servicios Generales</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Luz y Fuerza">Luz y Fuerza</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="position"
            >
              Puesto
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione un puesto
              </option>
              <option value="Ingeniero">Ingeniero</option>
              <option value="Técnico / Informático">
                Técnico / Informático
              </option>
              <option value="Contador / Abogado">Contador / Abogado</option>
              <option value="Técnico / Oficial especializado">
                Técnico / Oficial especializado
              </option>
              <option value="Operario / Oficial">Operario / Oficial</option>
              <option value="Operador de Equipos / Gruista">
                Operador de Equipos / Gruista
              </option>
              <option value="Administrativo">Administrativo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="phone"
            >
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              disabled={isAddingEmployee}
            >
              {isAddingEmployee ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Agregando...
                </>
              ) : (
                "Agregar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditEmployeeForm = ({ employee, onSubmit, onClose }) => {
  const [name, setName] = useState(employee.name);
  const [dni, setDni] = useState(employee.dni);
  const [position, setPosition] = useState(employee.position);
  const [sector, setSector] = useState(employee.sector);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone);
  const [empresa, setEmpresa] = useState(employee.empresa);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, dni, position, sector, email, phone, empresa });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Editar Empleado</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar formulario"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="dni"
            >
              DNI
            </label>
            <input
              id="dni"
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="empresa"
            >
              Empresa
            </label>
            <select
              id="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="DISEI">DISEI</option>
              <option value="CONELCI">CONELCI</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="sector"
            >
              Sector
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="Obras">Obras</option>
              <option value="Comercial">Comercial</option>
              <option value="Servicios Generales">Servicios Generales</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Luz y Fuerza">Luz y Fuerza</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="position"
            >
              Puesto
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="Ingeniero">Ingeniero</option>
              <option value="Técnico / Informático">
                Técnico / Informático
              </option>
              <option value="Contador / Abogado">Contador / Abogado</option>
              <option value="Técnico / Oficial especializado">
                Técnico / Oficial especializado
              </option>
              <option value="Operario / Oficial">Operario / Oficial</option>
              <option value="Operador de Equipos / Gruista">
                Operador de Equipos / Gruista
              </option>
              <option value="Administrativo">Administrativo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="phone"
            >
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddDocumentForm = ({ employee, documents, onSubmit, onClose }) => {
  const [type, setType] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) {
      setError("Debe seleccionar el tipo de documento.");
      return;
    }
    if (documents.some((doc) => doc.type === type)) {
      setError(`Ya existe un documento de tipo "${type}" para este empleado.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        employeeId: employee.id,
        type,
        issueDate,
        expiryDate,
        file,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Agregar Documento para {employee.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar formulario"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="type"
            >
              Tipo de Documento
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione tipo de documento
              </option>
              <option value="Estudio Médico">Estudio Médico</option>
              <option value="Habilitación TCT">Habilitación TCT</option>
              <option value="Carnet de conducir">Carnet de conducir</option>
              {/* Solo mostrar si el puesto es Operador de Equipos / Gruista */}
              {employee.position === "Operador de Equipos / Gruista" && (
                <option value="Credencial de gruista">
                  Credencial de gruista
                </option>
              )}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="issueDate"
            >
              Fecha de Emisión
            </label>
            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="expiryDate"
            >
              Fecha de Vencimiento
            </label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="file"
            >
              Archivo (.pdf o .jpg)
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf,.jpg"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center min-w-[100px]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Subiendo...
                </span>
              ) : (
                "Agregar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const EditDocumentForm = ({
  document,
  onSubmit,
  onClose,
  getDocumentStatus,
  employee,
  isSavingDocument,
}) => {
  const [type, setType] = useState(document.type);
  const [issueDate, setIssueDate] = useState(document.issueDate);
  const [expiryDate, setExpiryDate] = useState(document.expiryDate);
  const [file, setFile] = useState(null);
  const { status } = getDocumentStatus(document.expiryDate);

  // En el componente EditDocumentForm, modificar handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((status === "vencido" || status === "por_vencer") && !file) {
      alert(
        "Debe subir un nuevo archivo para reemplazar un documento vencido o por vencer."
      );
      return;
    }

    const formData = {
      employeeId: document.employeeId,
      type,
      issueDate,
      expiryDate,
      file: file || undefined, // Solo enviar file si existe
      fileName: document.fileName, // Mantener el nombre original si no hay nuevo archivo
    };

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Editar Documento</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar formulario"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="type"
            >
              Tipo de Documento
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="Estudio Médico">Estudio Médico</option>
              <option value="Habilitación TCT">Habilitación TCT</option>
              <option value="Carnet de conducir">Carnet de conducir</option>
              {/* Solo mostrar si el puesto es Operador de Equipos / Gruista */}
              {employee &&
                employee.position === "Operador de Equipos / Gruista" && (
                  <option value="Credencial de gruista">
                    Credencial de gruista
                  </option>
                )}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="issueDate"
            >
              Fecha de Emisión
            </label>
            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="expiryDate"
            >
              Fecha de Vencimiento
            </label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="file"
            >
              Archivo (.pdf o .jpg) -{" "}
              {status === "vencido" || status === "por_vencer"
                ? "Requerido"
                : "Opcional"}
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf,.jpg"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required={status === "vencido" || status === "por_vencer"}
            />
            <p className="text-sm text-gray-500 mt-1">
              Archivo actual: {document.fileName}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
              disabled={isSavingDocument}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              disabled={isSavingDocument}
            >
              {isSavingDocument ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeDocumentModal = ({
  employee,
  documents,
  onClose,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  getDocumentStatus,
}) => {
  // Agrupar documentos por tipo
  const grouped = (Array.isArray(documents) ? documents : []).reduce(
    (acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Documentos de {employee.name}
              </h3>
              <p className="text-sm text-gray-600">
                {employee.position} - {employee.sector} ({employee.empresa})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar modal"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              Documentación ({documents.length})
            </h4>
            <button
              onClick={onAddDocument}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              aria-label="Agregar nuevo documento"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Documento</span>
            </button>
          </div>
          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay documentos cargados</p>
            </div>
          )}
          {Object.entries(grouped).map(([type, docs]) => {
            const vigentes = docs.filter((d) => Number(d.archived) === 0);
            // Ordenar archivados del más reciente al más antiguo
            const archivados = docs
              .filter((d) => Number(d.archived) === 1)
              .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
            return (
              <div key={type} className="mb-8">
                <h5 className="font-semibold text-blue-800 mb-2">{type}</h5>
                {/* Documento vigente */}
                {vigentes.length > 0 ? (
                  vigentes.map((doc) => {
                    const statusInfo = getDocumentStatus(doc.expiryDate);
                    return (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-4 mb-2 bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-semibold text-gray-900">
                              Vigente
                            </span>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />{" "}
                              Vence: {formatDate(doc.expiryDate)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}
                          >
                            {statusInfo.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            {doc.fileName}
                          </p>
                          <div className="flex space-x-2">
                            <a
                              href={apiUrls.upload(doc.fileName)}
                              download
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Descargar ${doc.fileName}`}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => onEditDocument(doc)}
                              className="text-green-600 hover:text-green-800"
                              aria-label={`Editar ${doc.type}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-800"
                              aria-label={`Eliminar ${doc.type}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border rounded-lg p-4 mb-2 bg-gray-50 text-gray-500">
                    No hay documento vigente
                  </div>
                )}
                {/* Historial de archivados */}
                {archivados.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
                      <Archive className="w-4 h-4 mr-1 text-gray-400" />{" "}
                      Historial archivado
                    </h6>
                    {archivados.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-3 mb-1 bg-gray-100 flex justify-between items-center opacity-80"
                      >
                        <div className="flex items-center">
                          <Archive className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-700">
                            {formatDate(doc.issueDate)} -{" "}
                            {formatDate(doc.expiryDate)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {doc.fileName}
                          </span>
                          <span className="ml-2 px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded-full">
                            Archivado
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={apiUrls.upload(doc.fileName)}
                            download
                            className="text-blue-400 hover:text-blue-600"
                            aria-label={`Descargar ${doc.fileName}`}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DISEIDocumentSystem;
