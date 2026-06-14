const express = require('express');
const router = express.Router();
const labController = require('../controllers/laboratorio.controller');

// Definir los endpoints
router.get('/', labController.getLaboratorios);
router.get('/:id', labController.getLaboratorioById);

module.exports = router;