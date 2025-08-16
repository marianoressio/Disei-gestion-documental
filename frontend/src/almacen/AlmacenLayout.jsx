import React from "react";
import { Link, Outlet } from "react-router-dom";

const AlmacenLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <Link to="/" className="font-bold text-blue-700 mr-6">
          Inicio
        </Link>
        <Link to="/almacen/inventario" className="mr-4">
          Inventario
        </Link>
        <Link to="/almacen/asignar" className="mr-4">
          Asignar/Devolver
        </Link>
        <Link to="/almacen/estadisticas" className="mr-4">
          Estadísticas
        </Link>
        <Link to="/almacen/registros" className="mr-4">
          Registros por empleado
        </Link>
      </div>
    </nav>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </div>
  </div>
);

export default AlmacenLayout;
