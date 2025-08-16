// Controlador para inventario de almacén
module.exports = {
  getInventario: async (req, res) => {
    try {
      const { almacenId } = req.query;
      let elementosRes;
      if (almacenId) {
        elementosRes = await require('../../database.js').query('SELECT * FROM "Elemento" WHERE almacenId = $1', [almacenId]);
      } else {
        elementosRes = await require('../../database.js').query('SELECT * FROM "Elemento"', []);
      }
      res.json(elementosRes.rows);
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ error: 'Error interno al obtener inventario' });
    }
  }
};
