
import React from 'react';

const RegistrosTable = ({ registros }) => {
  if (!registros || registros.length === 0) {
    return <div className="text-gray-600">No hay registros para este empleado.</div>;
  }
  return (
    <table className="min-w-full bg-white border rounded shadow">
      <thead>
        <tr className="bg-blue-100">
          <th className="px-4 py-2 text-left">Fecha</th>
          <th className="px-4 py-2 text-left">Tipo</th>
          <th className="px-4 py-2 text-left">Elemento</th>
          <th className="px-4 py-2 text-left">Cantidad</th>
          <th className="px-4 py-2 text-left">Firma</th>
        </tr>
      </thead>
      <tbody>
        {registros.map(reg => (
          <tr key={reg.id} className="border-b">
            <td className="px-4 py-2">{reg.fecha ? reg.fecha.slice(0,10) : '-'}</td>
            <td className="px-4 py-2">{reg.tipo}</td>
            <td className="px-4 py-2">{reg.elementoNombre || reg.elemento || '-'}</td>
            <td className="px-4 py-2">{reg.cantidad}</td>
            <td className="px-4 py-2">{reg.firma || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RegistrosTable;
