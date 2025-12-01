const express = require('express');
const router = express.Router();

const carritoController = require('../controllers/carrito.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Todas las rutas de carrito requieren usuario autenticado

// GET /api/cart
router.get('/cart', authMiddleware, carritoController.obtenerCarrito);

// POST /api/cart/items
router.post('/cart/items', authMiddleware, carritoController.agregarItem);

// PATCH /api/cart/items/:itemId
router.patch('/cart/items/:itemId', authMiddleware, carritoController.actualizarCantidad);

// DELETE /api/cart/items/:itemId
router.delete('/cart/items/:itemId', authMiddleware, carritoController.eliminarItem);

// DELETE /api/cart
router.delete('/cart', authMiddleware, carritoController.vaciarCarrito);

module.exports = router;
