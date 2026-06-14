const express = require('express');
const router = express.Router();
const mantController = require('../controllers/mantenimiento.controller');

router.get('/', mantController.getMantenimientos);
router.post('/', mantController.registrarMantenimiento);
router.put('/:id/finalizar', mantController.finalizarMantenimiento);

module.exports = router;