
import React from 'react';

const InventarioTable = ({ elementos }) => {
  if (!elementos || elementos.length === 0) {
    return <div className="text-gray-600">No hay elementos en el inventario.</div>;
  }
  return (
    <table className="min-w-full bg-white border rounded shadow">
      <thead>
        <tr className="bg-blue-100">
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Tipo</th>
          <th className="px-4 py-2 text-left">Stock</th>
          <th className="px-4 py-2 text-left">Ubicación</th>
        </tr>
      </thead>
      <tbody>
        {elementos.map(el => (
          <tr key={el.id} className="border-b">
            <td className="px-4 py-2">{el.nombre}</td>
            <td className="px-4 py-2">{el.tipo}</td>
            <td className="px-4 py-2">{el.stock}</td>
            <td className="px-4 py-2">{el.ubicacion || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventarioTable;
