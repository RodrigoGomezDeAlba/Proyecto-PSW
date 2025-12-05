// back/controllers/ordenes.controller.js
const OrdenModel = require('../modelo/ordenModel');
const { enviarCorreoCompraHTTP } = require('../utils/sendgrid');

// POST /api/orders
async function crearOrden(req, res) {
  try {
    const usuarioId = req.user.id;

    // 1) Crear orden a partir del carrito
    const resultado = await OrdenModel.crearOrdenDesdeCarrito(usuarioId);
    // resultado debería traer al menos: { ordenId, total }

    // 2) Obtener la orden con sus items para el PDF/correo
    const ordenCompleta = await OrdenModel.obtenerOrdenConItems(
      resultado.ordenId,
      usuarioId
    );

    // Por si acaso, evitamos rompernos si viene raro
    const items = ordenCompleta?.items || ordenCompleta?.detalles || [];
    const total =
      resultado.total ||
      ordenCompleta?.total ||
      items.reduce((acc, it) => acc + (it.subtotal || 0), 0);

    const nombreCliente =
      req.user.nombre || req.user.name || 'Cliente';
    const emailCliente =
      req.user.email || req.user.correo || null;

    // 3) Enviar correo de compra (HTTP SendGrid) si tenemos correo del cliente
    if (emailCliente) {
      try {
        await enviarCorreoCompraHTTP({
          nombre: nombreCliente,
          email: emailCliente,
          items,
          total,
        });
      } catch (errMail) {
        console.error('⚠️ Error al enviar correo de compra (SendGrid):', errMail);
        // No rompemos la creación de la orden, sólo lo registramos
      }
    } else {
      console.warn(
        'No se encontró email en req.user; no se envía correo de compra.'
      );
    }

    // 4) Respuesta al front
    return res.status(201).json({
      message: 'Orden creada correctamente',
      ordenId: resultado.ordenId,
      total: total
    });
  } catch (err) {
    console.error('Error en crearOrden:', err);

    if (err.message === 'CARRITO_VACIO') {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    if (err.message === 'SIN_INVENTARIO') {
      return res
        .status(400)
        .json({ message: 'No hay inventario suficiente para alguno de los productos' });
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
  obtenerOrdenPorId
};
