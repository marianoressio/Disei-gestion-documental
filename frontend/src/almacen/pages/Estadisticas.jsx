import React, { useEffect, useState } from "react";
import EstadisticasPanel from "../components/EstadisticasPanel.jsx";
import { getEstadisticas } from "../services/almacenApi.js";

const Estadisticas = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEstadisticas()
      .then((data) => {
        setEstadisticas(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar estadísticas");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Estadísticas del almacén
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2"></div>
          <span className="ml-4 text-blue-600 text-lg">
            Cargando estadísticas...
          </span>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <EstadisticasPanel estadisticas={estadisticas} />
      )}
    </div>
  );
};

export default Estadisticas;
