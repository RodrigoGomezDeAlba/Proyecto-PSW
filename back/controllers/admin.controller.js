const AdminModel = require('../modelo/adminModel');

async function obtenerResumenVentas(req, res) {
    try{
        const resumen = await AdminModel.resumenVentas();
        return res.json(resumen);
    }catch (err) {
        console.error('Error en obtenerResumenVentas:', err);
        return res.status(500).json({ message: 'Error al obtener resumen de ventas' });
    }
}

async function obtenerVentasPorCategoria(req, res) {
    try{
        const ventasCategorias = await AdminModel.ventasPorCategoria();
        return res.json(ventasCategorias);
    }catch (err) {
        console.error('Error en obtenerVentasPorCategoria:', err);
        return res.status(500).json({ message: 'Error al obtener ventas por categoría' });
    }
}

async function obtenerInventarioPorCategoria(req, res) {
    try{
        const inventarioCategorias = await AdminModel.inventarioPorCategoria();
        return res.json(inventarioCategorias);
    }catch (err) {
        console.error('Error en obtenerInventarioPorCategoria:', err);
        return res.status(500).json({ message: 'Error al obtener inventario por categoría' });
    }
}

module.exports = {
    obtenerResumenVentas,
    obtenerVentasPorCategoria,
    obtenerInventarioPorCategoria
};