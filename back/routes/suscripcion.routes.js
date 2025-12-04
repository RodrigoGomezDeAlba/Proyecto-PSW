const express = require('express');
const router = express.Router();

const SuscripcionController = require('../controllers/suscripcion.controller');

//POST /api/suscripcion
router.post('/suscribirse', SuscripcionController.suscribirse);

//POST /api/contacto
router.post('/contacto', SuscripcionController.contacto);

module.exports = router;