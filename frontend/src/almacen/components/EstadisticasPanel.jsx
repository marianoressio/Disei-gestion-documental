import React, { useRef } from "react";
import { Chart, Bar, Pie } from "react-chartjs-2";

const EstadisticasPanel = ({ estadisticas }) => {
  const chartRef = useRef();
  if (!estadisticas) {
    return (
      <div className="text-gray-600">
        No hay datos de estadísticas disponibles.
      </div>
    );
  }

  // Datos para gráficos
  const elementosLabels =
    estadisticas.elementosMasAsignados?.map((el) => el.nombre) || [];
  const elementosData =
    estadisticas.elementosMasAsignados?.map((el) => el.cantidad) || [];
  const empleadosLabels =
    estadisticas.rankingEmpleados?.map((emp) => emp.nombre) || [];
  const empleadosData =
    estadisticas.rankingEmpleados?.map((emp) => emp.cantidad) || [];

  // Exportar estadísticas a CSV
  const exportarCSV = () => {
    const encabezado = ["Métrica", "Valor"];
    const filas = [
      ["Total asignaciones", estadisticas.totalAsignaciones ?? "-"],
      ["Total devoluciones", estadisticas.totalDevoluciones ?? "-"],
      ["Elementos con stock bajo", estadisticas.stockBajo?.length ?? 0],
    ];
    if (estadisticas.elementosMasAsignados?.length) {
      estadisticas.elementosMasAsignados.forEach((el) => {
        filas.push([`Asignaciones de ${el.nombre}`, el.cantidad]);
      });
    }
    if (estadisticas.rankingEmpleados?.length) {
      estadisticas.rankingEmpleados.forEach((emp) => {
        filas.push([`Asignaciones de ${emp.nombre}`, emp.cantidad]);
      });
    }
    const csv = [encabezado, ...filas]
      .map((fila) =>
        fila.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "estadisticas_almacen.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded shadow">
          <div className="text-lg font-bold text-blue-700">
            Total asignaciones
          </div>
          <div className="text-2xl">
            {estadisticas.totalAsignaciones ?? "-"}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <div className="text-lg font-bold text-green-700">
            Total devoluciones
          </div>
          <div className="text-2xl">
            {estadisticas.totalDevoluciones ?? "-"}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <div className="text-lg font-bold text-yellow-700">
            Elementos con stock bajo
          </div>
          <div className="text-2xl">{estadisticas.stockBajo?.length ?? 0}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2 flex items-center">
          Elementos más asignados
          <span
            title="Gráfico de barras que muestra los elementos con mayor cantidad de asignaciones en el almacén"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </div>
        {elementosLabels.length > 0 ? (
          <Bar
            data={{
              labels: elementosLabels,
              datasets: [
                {
                  label: "Asignaciones",
                  data: elementosData,
                  backgroundColor: "#2563eb",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
            ref={chartRef}
          />
        ) : (
          <div className="text-gray-600">No hay datos</div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2 flex items-center">
          Ranking de empleados por asignaciones
          <span
            title="Gráfico de pastel que muestra qué empleados han recibido más asignaciones de elementos"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </div>
        {empleadosLabels.length > 0 ? (
          <Pie
            data={{
              labels: empleadosLabels,
              datasets: [
                {
                  data: empleadosData,
                  backgroundColor: [
                    "#2563eb",
                    "#22c55e",
                    "#eab308",
                    "#f43f5e",
                    "#a21caf",
                    "#0ea5e9",
                    "#f59e42",
                    "#84cc16",
                    "#e11d48",
                    "#64748b",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom" } },
            }}
            ref={chartRef}
          />
        ) : (
          <div className="text-gray-600">No hay datos</div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={exportarCSV}
          title="Descarga todas las métricas y rankings del almacén en formato CSV para análisis o reportes"
        >
          Exportar estadísticas CSV
        </button>
      </div>
    </div>
  );
};

export default EstadisticasPanel;
