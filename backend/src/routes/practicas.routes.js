const express = require('express');
const router = express.Router();
const pracController = require('../controllers/practica.controller');

router.get('/', pracController.getPracticas);
router.post('/', pracController.registrarPractica);

module.exports = router;