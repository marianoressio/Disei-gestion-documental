import React, { useState } from "react";

const DevolverForm = ({ employees, elementos, onSubmit }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [elementoId, setElementoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [firma, setFirma] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!employeeId || !elementoId || !cantidad || !fecha) {
      setError("Todos los campos son obligatorios");
      return false;
    }
    if (isNaN(Number(cantidad)) || Number(cantidad) < 1) {
      setError("La cantidad debe ser un número mayor a 0");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await onSubmit({
        employeeId,
        elementoId,
        cantidad,
        fecha,
        firma,
      });
      if (result && result.error) {
        setError(result.error);
        setSuccess("");
      } else {
        setSuccess("¡Elemento devuelto correctamente!");
        setError("");
        setEmployeeId("");
        setElementoId("");
        setCantidad(1);
        setFecha(new Date().toISOString().slice(0, 10));
        setFirma("");
      }
    } catch {
      setError("Error al devolver el elemento");
      setSuccess("");
    }
    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">
          Empleado
          <span
            title="Seleccione el empleado que devuelve el elemento"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </label>
        <select
          className={`w-full border rounded px-2 py-1 ${
            !employeeId && error ? "border-red-500" : ""
          }`}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          title="Seleccione el empleado que devuelve el elemento"
        >
          <option value="">Seleccione un empleado</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.dni})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Elemento
          <span
            title="Seleccione el elemento a devolver"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </label>
        <select
          className={`w-full border rounded px-2 py-1 ${
            !elementoId && error ? "border-red-500" : ""
          }`}
          value={elementoId}
          onChange={(e) => setElementoId(e.target.value)}
          required
          title="Seleccione el elemento a devolver"
        >
          <option value="">Seleccione un elemento</option>
          {elementos.map((el) => (
            <option key={el.id} value={el.id}>
              {el.nombre} ({el.tipo})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Cantidad
          <span
            title="Ingrese la cantidad a devolver (mayor a 0)"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </label>
        <input
          type="number"
          min={1}
          className={`w-full border rounded px-2 py-1 ${
            (!cantidad || cantidad < 1) && error ? "border-red-500" : ""
          }`}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          title="Ingrese la cantidad a devolver (mayor a 0)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de devolución
          <span
            title="Seleccione la fecha en que se realiza la devolución"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </label>
        <input
          type="date"
          className={`w-full border rounded px-2 py-1 ${
            !fecha && error ? "border-red-500" : ""
          }`}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          title="Seleccione la fecha en que se realiza la devolución"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Firma digital (opcional)
          <span
            title="Puede ingresar una firma digital para validar la devolución"
            className="ml-1 cursor-help text-gray-400"
          >
            &#9432;
          </span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
          title="Puede ingresar una firma digital para validar la devolución"
        />
      </div>
      {loading && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 border-t-2"></div>
          <span className="ml-2 text-blue-600 text-sm">Procesando...</span>
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        Devolver
      </button>
    </form>
  );
};

export default DevolverForm;
