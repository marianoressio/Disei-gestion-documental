// Controlador para registros de empleado
module.exports = {
  getRegistrosEmpleado: async (req, res) => {
    try {
      const empleadoId = req.params.id;
      if (!empleadoId) {
        return res.status(400).json({ error: 'Falta el id de empleado' });
      }
      const registrosRes = await require('../../database.js').query(
        'SELECT a.*, e.nombre, e.tipo, e.marca, e.modelo FROM "Asignacion" a JOIN "Elemento" e ON a.elementoId = e.id WHERE a.empleadoId = $1 ORDER BY a.fecha DESC',
        [empleadoId]
      );
      res.json(registrosRes.rows);
    } catch (error) {
      console.error('Error al obtener registros de empleado:', error);
      res.status(500).json({ error: 'Error interno al obtener registros de empleado' });
    }
  }
};
