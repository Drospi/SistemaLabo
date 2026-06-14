const express = require('express');
const router = express.Router();
const solController = require('../controllers/solicitud.controller');

router.get('/', solController.getSolicitudes);
router.post('/', solController.registrarSolicitud);

router.put('/:id/estado', solController.actualizarEstadoSolicitud);

module.exports = router;