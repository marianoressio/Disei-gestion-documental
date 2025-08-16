
import React, { useState, useEffect } from 'react';
import AsignarForm from '../components/AsignarForm.jsx';
import DevolverForm from '../components/DevolverForm.jsx';
import { asignarElemento, devolverElemento, getInventario } from '../services/almacenApi.js';

// Importar empleados desde el contexto principal
import { useMemo } from 'react';
import { employees as globalEmployees } from '../../App.jsx';

const AsignarDevolver = () => {
  const [asignarResult, setAsignarResult] = useState(null);
  const [devolverResult, setDevolverResult] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Cargar inventario de elementos
    getInventario().then(data => {
      setElementos(Array.isArray(data) ? data : []);
    });
    // Cargar empleados desde el endpoint global
    fetch('/employees').then(res => res.json()).then(data => {
      setEmployees(Array.isArray(data) ? data : []);
    });
  }, []);

  const handleAsignar = async (data) => {
    const result = await asignarElemento(data);
    setAsignarResult(result);
  };

  const handleDevolver = async (data) => {
    const result = await devolverElemento(data);
    setDevolverResult(result);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Asignar / Devolver Elementos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Asignar Elemento</h3>
          <AsignarForm employees={employees} elementos={elementos} onSubmit={handleAsignar} />
          {asignarResult && (
            <div className="mt-4 text-green-600">{asignarResult.message || asignarResult.error}</div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Devolver Elemento</h3>
          <DevolverForm employees={employees} elementos={elementos} onSubmit={handleDevolver} />
          {devolverResult && (
            <div className="mt-4 text-blue-600">{devolverResult.message || devolverResult.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignarDevolver;
