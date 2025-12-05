const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admin.controller');
//para verificar que sea admin
const {authMiddleware, requireAdmin } = require('../middleware/auth.middleware');

//GET /admin/resumen-ventas
router.get('/admin/resumen-ventas', authMiddleware, requireAdmin, AdminController.obtenerResumenVentas);

//GET /admin/ventas-por-categoria
router.get('/admin/ventas-por-categoria', authMiddleware, requireAdmin, AdminController.obtenerVentasPorCategoria);

//GET /admin/inventario-por-categoria
router.get('/admin/inventario-por-categoria', authMiddleware, requireAdmin, AdminController.obtenerInventarioPorCategoria);

module.exports = router;