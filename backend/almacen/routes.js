// Rutas para el módulo de almacén
const express = require('express');
const router = express.Router();

// Controladores (se implementarán luego)
const asignacionController = require('./controllers/asignacionController');
const almacenController = require('./controllers/almacenController');
const empleadoController = require('./controllers/empleadoController');
const estadisticasController = require('./controllers/estadisticasController');

// Rutas principales
router.post('/asignar', asignacionController.asignarElemento);
router.post('/devolver', asignacionController.devolverElemento);
router.get('/inventario', almacenController.getInventario);
router.get('/empleado/:id', empleadoController.getRegistrosEmpleado);
router.get('/estadisticas', estadisticasController.getEstadisticas);

module.exports = router;
