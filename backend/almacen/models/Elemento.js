// Modelo de Elemento (EPP, Herramienta, Ropa)
module.exports = (sequelize, DataTypes) => {
  const Elemento = sequelize.define('Elemento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    tipo: DataTypes.STRING, // EPP, Herramienta, Ropa
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
    almacenId: DataTypes.INTEGER
  });
  return Elemento;
};
