// back/controllers/ordenes.controller.js
const OrdenModel = require('../modelo/ordenModel');
const { enviarCorreoCompraHTTP } = require('../utils/sendgrid');

// POST /api/orders
async function crearOrden(req, res) {
  try {
    const usuarioId = req.user.id;

    // Crear orden a partir del carrito
    const resultado = await OrdenModel.crearOrdenDesdeCarrito(usuarioId);
    // Obtener la orden con sus items para el PDF del correo
    const ordenCompleta = await OrdenModel.obtenerOrdenConItems(
      resultado.ordenId,
      usuarioId
    );
    const items = ordenCompleta?.items || ordenCompleta?.detalles || [];
    const total =
      resultado.total ||
      ordenCompleta?.total ||
      items.reduce((acc, it) => acc + (it.subtotal || 0), 0);

    const nombreCliente =
      req.user.nombre || req.user.name || 'Cliente';
    const emailCliente =
      req.user.email || req.user.correo || null;

    // Datos adicionales que vienen del frontend (nota local)
    const {
      subtotal: frontSubtotal,
      tax: frontTax,
      ship: frontShip,
      discount: frontDiscount,
      cupon: frontCupon,
      fecha: frontFecha,
      metodoPago: frontMetodoPago,
    } = req.body || {};

    // Enviar correo de compra con información completa
    if (emailCliente) {
      try {
        await enviarCorreoCompraHTTP({
          nombre: nombreCliente,
          email: emailCliente,
          items,
          total,
          subtotal: frontSubtotal,
          tax: frontTax,
          ship: frontShip,
          discount: frontDiscount,
          cupon: frontCupon,
          fecha: frontFecha,
          metodoPago: frontMetodoPago,
        });
      } catch (errMail) {
        console.error('Error al enviar correo de compra:', errMail);
      }
    } else {
      console.warn(
        'No se encontró email en req.user; no se envía correo de compra.'
      );
    }

    // Respuesta al front
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
