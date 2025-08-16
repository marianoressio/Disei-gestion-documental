// Controlador para estadísticas
module.exports = {
  getEstadisticas: async (req, res) => {
    try {
      const db = require('../../database.js');

      // 1. Histórico de entregas y devoluciones por mes/año
      const historicoRes = await db.query(
        `SELECT to_char(fecha, 'YYYY-MM') as periodo, tipo, SUM(cantidad) as total
         FROM "Asignacion"
         GROUP BY periodo, tipo
         ORDER BY periodo DESC`
      );

      // 2. Elementos con menor stock disponible
      const menorStockRes = await db.query(
        'SELECT id, nombre, cantidad FROM "Elemento" ORDER BY cantidad ASC LIMIT 5'
      );

      // 3. Cantidad de elementos extraviados o fuera de servicio por tipo/marca/modelo
      const fueraServicioRes = await db.query(
        `SELECT e.tipo, e.marca, e.modelo, a.estado, SUM(a.cantidad) as total
         FROM "Asignacion" a JOIN "Elemento" e ON a.elementoId = e.id
         WHERE a.estado IN ('Fuera de Servicio', 'Extraviado') AND a.tipo = 'Devolución'
         GROUP BY e.tipo, e.marca, e.modelo, a.estado`
      );

      // 4. Ranking de empleados con más devoluciones fuera de servicio o extraviadas
      const rankingEmpleadosRes = await db.query(
        `SELECT a.empleadoId, COUNT(*) as total
         FROM "Asignacion" a
         WHERE a.estado IN ('Fuera de Servicio', 'Extraviado') AND a.tipo = 'Devolución'
         GROUP BY a.empleadoId
         ORDER BY total DESC LIMIT 5`
      );

      // 5. Promedio de elementos asignados por empleado
      const promedioAsignadosRes = await db.query(
        `SELECT AVG(total) as promedio
         FROM (SELECT SUM(cantidad) as total FROM "Asignacion" WHERE tipo = 'Asignación' GROUP BY empleadoId) sub`
      );

      // 6. Tiempo promedio de tenencia de cada tipo de elemento
      const tiempoTenenciaRes = await db.query(
        `SELECT e.tipo, AVG(EXTRACT(EPOCH FROM (dev.fecha - asig.fecha))/86400) as dias_promedio
         FROM "Asignacion" asig
         JOIN "Asignacion" dev ON asig.empleadoId = dev.empleadoId AND asig.elementoId = dev.elementoId AND dev.tipo = 'Devolución' AND asig.tipo = 'Asignación'
         JOIN "Elemento" e ON asig.elementoId = e.id
         WHERE dev.fecha > asig.fecha
         GROUP BY e.tipo`
      );

      // 7. Elementos nunca devueltos
      const nuncaDevueltosRes = await db.query(
        `SELECT asig.empleadoId, asig.elementoId, e.nombre, SUM(asig.cantidad) as asignados
         FROM "Asignacion" asig
         LEFT JOIN "Asignacion" dev ON asig.empleadoId = dev.empleadoId AND asig.elementoId = dev.elementoId AND dev.tipo = 'Devolución'
         JOIN "Elemento" e ON asig.elementoId = e.id
         WHERE asig.tipo = 'Asignación' AND dev.id IS NULL
         GROUP BY asig.empleadoId, asig.elementoId, e.nombre`
      );

      // 8. Comparativa de asignaciones por sector/departamento
      const comparativaSectorRes = await db.query(
        `SELECT emp.sector, SUM(a.cantidad) as total
         FROM "Asignacion" a
         JOIN employees emp ON a.empleadoId = emp.id
         WHERE a.tipo = 'Asignación'
         GROUP BY emp.sector
         ORDER BY total DESC`
      );

      // 9. Porcentaje de devoluciones por estado
      const porcentajeDevolucionesRes = await db.query(
        `SELECT estado, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as porcentaje
         FROM "Asignacion"
         WHERE tipo = 'Devolución'
         GROUP BY estado`
      );

      res.json({
        historico: historicoRes.rows,
        menorStock: menorStockRes.rows,
        fueraServicio: fueraServicioRes.rows,
        rankingEmpleados: rankingEmpleadosRes.rows,
        promedioAsignados: promedioAsignadosRes.rows[0] || null,
        tiempoTenencia: tiempoTenenciaRes.rows,
        nuncaDevueltos: nuncaDevueltosRes.rows,
        comparativaSector: comparativaSectorRes.rows,
        porcentajeDevoluciones: porcentajeDevolucionesRes.rows
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno al obtener estadísticas' });
    }
  }
};
