const express = require('express');
const router = express.Router();

const ordenesController = require('../controllers/ordenes.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Todas las rutas de órdenes requieren usuario autenticado

// Crear una orden a partir del carrito actual
router.post('/orders', authMiddleware, ordenesController.crearOrden);

// Listar órdenes del usuario autenticado
router.get('/orders', authMiddleware, ordenesController.listarOrdenes);

// Obtener detalle de una orden específica
router.get('/orders/:id', authMiddleware, ordenesController.obtenerOrdenPorId);

module.exports = router;
