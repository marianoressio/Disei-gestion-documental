import React, { useEffect, useState } from "react";
import InventarioTable from "../components/InventarioTable.jsx";
import { getInventario } from "../services/almacenApi.js";

const Inventario = () => {
  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroStockMin, setFiltroStockMin] = useState("");
  const [filtroStockMax, setFiltroStockMax] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  // Obtener tipos únicos para el select
  const tiposUnicos = Array.from(
    new Set(elementos.map((el) => el.tipo))
  ).filter(Boolean);

  useEffect(() => {
    getInventario()
      .then((data) => {
        setElementos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar inventario");
        setLoading(false);
      });
  }, []);

  // Filtrar elementos según los filtros
  const elementosFiltrados = elementos.filter((el) => {
    const matchNombre =
      filtroNombre === "" ||
      (el.nombre &&
        el.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
    const matchTipo = filtroTipo === "" || (el.tipo && el.tipo === filtroTipo);
    const matchUbicacion =
      filtroUbicacion === "" ||
      (el.ubicacion &&
        el.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase()));
    const matchStockMin =
      filtroStockMin === "" ||
      (typeof el.stock === "number" && el.stock >= Number(filtroStockMin));
    const matchStockMax =
      filtroStockMax === "" ||
      (typeof el.stock === "number" && el.stock <= Number(filtroStockMax));
    const fechaIngreso = el.fechaIngreso ? el.fechaIngreso.slice(0, 10) : "";
    const matchFechaDesde =
      filtroFechaDesde === "" ||
      (fechaIngreso && fechaIngreso >= filtroFechaDesde);
    const matchFechaHasta =
      filtroFechaHasta === "" ||
      (fechaIngreso && fechaIngreso <= filtroFechaHasta);
    return (
      matchNombre &&
      matchTipo &&
      matchUbicacion &&
      matchStockMin &&
      matchStockMax &&
      matchFechaDesde &&
      matchFechaHasta
    );
  });

  // Exportar a CSV
  const exportarCSV = () => {
    if (!elementosFiltrados.length) return;
    const encabezado = ["Nombre", "Tipo", "Stock", "Ubicación"];
    const filas = elementosFiltrados.map((el) => [
      el.nombre,
      el.tipo,
      el.stock,
      el.ubicacion || "-",
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
    a.download = "inventario.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Inventario de elementos
      </h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-8 gap-4">
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          title="Filtra los elementos por nombre"
        />
        <select
          className="border rounded px-2 py-1 w-full"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          title="Filtra los elementos por tipo"
        >
          <option value="">Todos los tipos</option>
          {tiposUnicos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Filtrar por ubicación"
          value={filtroUbicacion}
          onChange={(e) => setFiltroUbicacion(e.target.value)}
          title="Filtra los elementos por ubicación"
        />
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          placeholder="Stock mínimo"
          value={filtroStockMin}
          onChange={(e) => setFiltroStockMin(e.target.value)}
          title="Filtra los elementos con stock mayor o igual al valor ingresado"
        />
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          placeholder="Stock máximo"
          value={filtroStockMax}
          onChange={(e) => setFiltroStockMax(e.target.value)}
          title="Filtra los elementos con stock menor o igual al valor ingresado"
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          placeholder="Fecha ingreso desde"
          value={filtroFechaDesde}
          onChange={(e) => setFiltroFechaDesde(e.target.value)}
          title="Filtra los elementos ingresados a partir de esta fecha"
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          placeholder="Fecha ingreso hasta"
          value={filtroFechaHasta}
          onChange={(e) => setFiltroFechaHasta(e.target.value)}
          title="Filtra los elementos ingresados hasta esta fecha"
        />
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={exportarCSV}
          title="Descarga el inventario filtrado en formato CSV para análisis o reportes"
        >
          Exportar CSV
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2"></div>
          <span className="ml-4 text-blue-600 text-lg">
            Cargando inventario...
          </span>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <InventarioTable elementos={elementosFiltrados} />
      )}
    </div>
  );
};

export default Inventario;
