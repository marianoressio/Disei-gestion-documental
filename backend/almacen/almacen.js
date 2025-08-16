// Punto de entrada del módulo almacén
const express = require('express');
const router = require('./routes');

const app = express();
app.use(express.json());
app.use('/almacen', router);

// Exportar para integración con el server principal
module.exports = app;
