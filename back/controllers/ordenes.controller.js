const OrdenModel = require('../modelo/ordenModel');

// POST /api/orders
async function crearOrden(req, res) {
  try {
    const usuarioId = req.user.id;

    const resultado = await OrdenModel.crearOrdenDesdeCarrito(usuarioId);

    return res.status(201).json({
      message: 'Orden creada correctamente',
      ordenId: resultado.ordenId,
      total: resultado.total,
    });
  } catch (err) {
    console.error('Error en crearOrden:', err);

    if (err.message === 'CARRITO_VACIO') {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    if (err.message === 'SIN_INVENTARIO') {
      return res.status(400).json({ message: 'No hay inventario suficiente para alguno de los productos' });
    }

    return res.status(500).json({ message: 'Error al procesar la orden' });
  }
}

// GET /api/orders
async function listarOrdenes(req, res) {
  try {
    const usuarioId = req.user.id;
    const ordenes = await OrdenModel.obtenerOrdenesPorUsuario(usuarioId);
    return res.json(ordenes);
  } catch (err) {
    console.error('Error en listarOrdenes:', err);
    return res.status(500).json({ message: 'Error al obtener órdenes' });
  }
}

// GET /api/orders/:id
async function obtenerOrdenPorId(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    const orden = await OrdenModel.obtenerOrdenConItems(id, usuarioId);
    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    return res.json(orden);
  } catch (err) {
    console.error('Error en obtenerOrdenPorId:', err);
    return res.status(500).json({ message: 'Error al obtener la orden' });
  }
}

module.exports = {
  crearOrden,
  listarOrdenes,
  obtenerOrdenPorId,
};
