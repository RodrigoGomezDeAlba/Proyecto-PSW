const express = require('express');
const router = express.Router();

const productosController = require('../controllers/productos.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth.middleware');

// Listar categorías
router.get('/categories', productosController.obtenerCategorias);

// Listar productos con filtros
router.get('/products', productosController.obtenerProductos);

// Detalle de un producto
router.get('/products/:id', productosController.obtenerProductoPorId);

// Rutas para administrador
router.post('/admin/products', authMiddleware, requireAdmin, productosController.crearProducto);
router.put('/admin/products/:id', authMiddleware, requireAdmin, productosController.actualizarProducto);
router.patch('/admin/products/:id', authMiddleware, requireAdmin, productosController.actualizarProducto);
router.delete('/admin/products/:id', authMiddleware, requireAdmin, productosController.eliminarProducto);

module.exports = router;
