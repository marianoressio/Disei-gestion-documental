import React, { useState, useEffect } from "react";
import RegistrosTable from "../components/RegistrosTable.jsx";
import { getRegistrosEmpleado } from "../services/almacenApi.js";

const RegistrosEmpleado = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [registros, setRegistros] = useState([]);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cargar empleados desde el endpoint global
    fetch("/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getRegistrosEmpleado(selectedId)
      .then((data) => {
        setRegistros(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar registros");
        setLoading(false);
      });
  }, [selectedId]);

  // Filtrar registros
  const registrosFiltrados = registros.filter((reg) => {
    const fecha = reg.fecha ? reg.fecha.slice(0, 10) : "";
    const matchFechaDesde =
      filtroFechaDesde === "" || (fecha && fecha >= filtroFechaDesde);
    const matchFechaHasta =
      filtroFechaHasta === "" || (fecha && fecha <= filtroFechaHasta);
    const matchTipo =
      filtroTipo === "" || (reg.tipo && reg.tipo === filtroTipo);
    return matchFechaDesde && matchFechaHasta && matchTipo;
  });

  // Tipos únicos para filtro
  const tiposUnicos = Array.from(new Set(registros.map((r) => r.tipo))).filter(
    Boolean
  );

  // Exportar a CSV
  const exportarCSV = () => {
    if (!registrosFiltrados.length) return;
    const encabezado = ["Fecha", "Tipo", "Elemento", "Cantidad", "Firma"];
    const filas = registrosFiltrados.map((reg) => [
      reg.fecha ? reg.fecha.slice(0, 10) : "-",
      reg.tipo,
      reg.elementoNombre || reg.elemento || "-",
      reg.cantidad,
      reg.firma || "-",
    ]);
    const csv = [encabezado, ...filas]
      .map((fila) =>
        fila.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registros_empleado.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Registros por empleado
      </h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Seleccionar empleado
        </label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          title="Seleccione el empleado para ver su historial de asignaciones y devoluciones"
        >
          <option value="">Seleccione un empleado</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.dni})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          placeholder="Fecha desde"
          value={filtroFechaDesde}
          onChange={(e) => setFiltroFechaDesde(e.target.value)}
          title="Filtra los registros desde esta fecha"
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          placeholder="Fecha hasta"
          value={filtroFechaHasta}
          onChange={(e) => setFiltroFechaHasta(e.target.value)}
          title="Filtra los registros hasta esta fecha"
        />
        <select
          className="border rounded px-2 py-1 w-full"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          title="Filtra los registros por tipo de movimiento"
        >
          <option value="">Todos los movimientos</option>
          {tiposUnicos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={exportarCSV}
          title="Descarga los registros filtrados en formato CSV para análisis o reportes"
        >
          Exportar CSV
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2"></div>
          <span className="ml-4 text-blue-600 text-lg">
            Cargando registros...
          </span>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <RegistrosTable registros={registrosFiltrados} />
      )}
    </div>
  );
};

export default RegistrosEmpleado;
