const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');

router.get('/', reservaController.getReservas);
router.post('/', reservaController.crearReserva);
router.put('/:id/estado', reservaController.actualizarEstadoReserva);

module.exports = router;