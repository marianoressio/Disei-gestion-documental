// Controlador para asignar y devolver elementos

const { query } = require('../../database.js');

module.exports = {
  asignarElemento: async (req, res) => {
    try {
      const {
        empleadoId,
        elementoId,
        cantidad,
        estado,
        firmaDigital
      } = req.body;

      if (!empleadoId || !elementoId || !cantidad || !estado || !firmaDigital) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }

      // Verificar existencia y stock del elemento
      const elementoRes = await query('SELECT * FROM "Elemento" WHERE id = $1', [elementoId]);
      const elemento = elementoRes.rows[0];
      if (!elemento) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }
      if (elemento.cantidad < cantidad) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }

      // Descontar stock
      await query('UPDATE "Elemento" SET cantidad = cantidad - $1 WHERE id = $2', [cantidad, elementoId]);

      // Registrar asignación
      const fecha = new Date();
      await query(
        'INSERT INTO "Asignacion" (empleadoId, elementoId, cantidad, fecha, tipo, estado, firmaDigital) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [empleadoId, elementoId, cantidad, fecha, 'Asignación', estado, firmaDigital]
      );

      res.status(201).json({ message: 'Elemento asignado correctamente' });
    } catch (error) {
      console.error('Error en asignarElemento:', error);
      res.status(500).json({ error: 'Error interno al asignar elemento' });
    }
  },
  devolverElemento: async (req, res) => {
    try {
      const {
        empleadoId,
        elementoId,
        cantidad,
        estado,
        firmaDigital
      } = req.body;

      if (!empleadoId || !elementoId || !cantidad || !estado || !firmaDigital) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }

      // Verificar existencia del elemento
      const elementoRes = await query('SELECT * FROM "Elemento" WHERE id = $1', [elementoId]);
      const elemento = elementoRes.rows[0];
      if (!elemento) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }

      // Solo sumar al stock si el estado es Nuevo o Usado
      if (estado === 'Nuevo' || estado === 'Usado') {
        await query('UPDATE "Elemento" SET cantidad = cantidad + $1 WHERE id = $2', [cantidad, elementoId]);
      }
      // Si el estado es Fuera de Servicio o Extraviado, no se suma al stock

      // Registrar devolución
      const fecha = new Date();
      await query(
        'INSERT INTO "Asignacion" (empleadoId, elementoId, cantidad, fecha, tipo, estado, firmaDigital) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [empleadoId, elementoId, cantidad, fecha, 'Devolución', estado, firmaDigital]
      );

      res.status(201).json({ message: 'Elemento devuelto correctamente' });
    } catch (error) {
      console.error('Error en devolverElemento:', error);
      res.status(500).json({ error: 'Error interno al devolver elemento' });
    }
  }
};
