// Modelo de Asignación de Elementos
module.exports = (sequelize, DataTypes) => {
  const Asignacion = sequelize.define('Asignacion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empleadoId: DataTypes.INTEGER,
    elementoId: DataTypes.INTEGER,
    cantidad: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    tipo: DataTypes.STRING, // Asignación o Devolución
    estado: DataTypes.STRING, // Nuevo, Usado, Fuera de Servicio, Extraviado
    firmaDigital: DataTypes.STRING // base64 o url
  });
  return Asignacion;
};
