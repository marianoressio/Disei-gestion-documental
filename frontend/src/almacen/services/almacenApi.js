// Funciones para consumir la API del backend de almacén

const API_URL = '/almacen';

export async function getInventario(almacenId) {
  const res = await fetch(`${API_URL}/inventario${almacenId ? `?almacenId=${almacenId}` : ''}`);
  return res.json();
}

export async function asignarElemento(data) {
  const res = await fetch(`${API_URL}/asignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function devolverElemento(data) {
  const res = await fetch(`${API_URL}/devolver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getRegistrosEmpleado(id) {
  const res = await fetch(`${API_URL}/empleado/${id}`);
  return res.json();
}

export async function getEstadisticas() {
  const res = await fetch(`${API_URL}/estadisticas`);
  return res.json();
}
