const CarritoModel = require('../modelo/carritoModel');
const ProductoModel = require('../modelo/productoModel');

// GET /api/cart
async function obtenerCarrito(req, res) {
  try {
    const usuarioId = req.user.id;

    const items = await CarritoModel.obtenerCarritoPorUsuario(usuarioId);
    return res.json(items);
  } catch (err) {
    console.error('Error en obtenerCarrito:', err);
    return res.status(500).json({ message: 'Error al obtener carrito' });
  }
}

// POST /api/cart/items
async function agregarItem(req, res) {
  try {
    const usuarioId = req.user.id;
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ message: 'producto_id y cantidad > 0 son obligatorios' });
    }

    const producto = await ProductoModel.obtenerProductoPorId(producto_id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (producto.inventario <= 0) {
      return res.status(400).json({ message: 'El producto no tiene inventario disponible' });
    }

    const item = await CarritoModel.agregarOActualizarItem(
      usuarioId,
      producto_id,
      Number(cantidad),
      producto.precio,
    );

    return res.status(201).json(item);
  } catch (err) {
    console.error('Error en agregarItem:', err);
    return res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
}

// PATCH /api/cart/items/:itemId
async function actualizarCantidad(req, res) {
  try {
    const usuarioId = req.user.id;
    const { itemId } = req.params;
    const { cantidad } = req.body;

    if (cantidad == null || Number(cantidad) < 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor o igual a 0' });
    }

    if (Number(cantidad) === 0) {
      // Si la cantidad es 0, eliminamos el item del carrito
      await CarritoModel.eliminarItem(itemId, usuarioId);
      return res.json({ message: 'Item eliminado del carrito' });
    }

    const existente = await CarritoModel.obtenerItemPorId(itemId, usuarioId);
    if (!existente) {
      return res.status(404).json({ message: 'Item no encontrado en el carrito' });
    }

    const actualizado = await CarritoModel.actualizarCantidadItem(
      itemId,
      usuarioId,
      Number(cantidad),
    );

    return res.json(actualizado);
  } catch (err) {
    console.error('Error en actualizarCantidad:', err);
    return res.status(500).json({ message: 'Error al actualizar cantidad del carrito' });
  }
}

// DELETE /api/cart/items/:itemId
async function eliminarItem(req, res) {
  try {
    const usuarioId = req.user.id;
    const { itemId } = req.params;

    const existente = await CarritoModel.obtenerItemPorId(itemId, usuarioId);
    if (!existente) {
      return res.status(404).json({ message: 'Item no encontrado en el carrito' });
    }

    await CarritoModel.eliminarItem(itemId, usuarioId);
    return res.json({ message: 'Item eliminado del carrito' });
  } catch (err) {
    console.error('Error en eliminarItem:', err);
    return res.status(500).json({ message: 'Error al eliminar item del carrito' });
  }
}

// DELETE /api/cart
async function vaciarCarrito(req, res) {
  try {
    const usuarioId = req.user.id;
    await CarritoModel.vaciarCarrito(usuarioId);
    return res.json({ message: 'Carrito vaciado correctamente' });
  } catch (err) {
    console.error('Error en vaciarCarrito:', err);
    return res.status(500).json({ message: 'Error al vaciar carrito' });
  }
}

module.exports = {
  obtenerCarrito,
  agregarItem,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito,
};
