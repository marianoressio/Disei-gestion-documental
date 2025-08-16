// Modelo de Almacén
module.exports = (sequelize, DataTypes) => {
  const Almacen = sequelize.define('Almacen', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    ubicacion: DataTypes.STRING
  });
  return Almacen;
};
