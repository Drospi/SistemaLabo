const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventario.controller');

router.get('/unitario', invController.getInventarioUnitario);
router.post('/unitario', invController.registrarEquipo);

router.get('/stock', invController.getInventarioStock);

router.get('/materiales-stock', invController.getMaterialesStock);
router.post('/stock/ingreso', invController.registrarIngresoStock);

module.exports = router;