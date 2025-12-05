const pool = require('../db/conexion');

// Obtener todos los items del carrito de un usuario (con join de producto)
async function obtenerCarritoPorUsuario(usuarioId) {
  const [rows] = await pool.query(
    `SELECT c.id AS itemId,
            c.cantidad,
            c.precio_unitario,
            (c.cantidad * c.precio_unitario) AS subtotal,
            p.id AS producto_id,
            p.nombre,
            p.descripcion,
            p.categoria,
            p.precio,
            p.inventario,
            p.imagen_url
     FROM carrito c
     JOIN productos p ON p.id = c.producto_id
     WHERE c.usuario_id = ?
     ORDER BY c.id`,
    [usuarioId],
  );

  return rows;
}

// Obtener un item específico del carrito por id y usuario
async function obtenerItemPorId(itemId, usuarioId) {
  const [rows] = await pool.query(
    `SELECT c.id AS itemId,
            c.cantidad,
            c.precio_unitario,
            (c.cantidad * c.precio_unitario) AS subtotal,
            p.id AS producto_id,
            p.nombre,
            p.descripcion,
            p.categoria,
            p.precio,
            p.inventario,
            p.imagen_url
     FROM carrito c
     JOIN productos p ON p.id = c.producto_id
     WHERE c.id = ? AND c.usuario_id = ?`,
    [itemId, usuarioId],
  );

  return rows[0];
}

// Agregar un producto al carrito o sumar a la cantidad existente
async function agregarOActualizarItem(usuarioId, productoId, cantidad, precioUnitario) {
  // Ver si ya existe el item para ese usuario y producto
  const [rows] = await pool.query(
    'SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?',
    [usuarioId, productoId],
  );

  let itemId;

  if (rows.length > 0) {
    const actual = rows[0];
    const nuevaCantidad = actual.cantidad + cantidad;

    await pool.query(
      'UPDATE carrito SET cantidad = ?, precio_unitario = ? WHERE id = ?',
      [nuevaCantidad, precioUnitario, actual.id],
    );

    itemId = actual.id;
  } else {
    const [result] = await pool.query(
      'INSERT INTO carrito (usuario_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
      [usuarioId, productoId, cantidad, precioUnitario],
    );

    itemId = result.insertId;
  }

  return obtenerItemPorId(itemId, usuarioId);
}

// Actualizar cantidad de un item existente
async function actualizarCantidadItem(itemId, usuarioId, cantidad) {
  await pool.query(
    'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
    [cantidad, itemId, usuarioId],
  );

  return obtenerItemPorId(itemId, usuarioId);
}

// Eliminar un item del carrito
async function eliminarItem(itemId, usuarioId) {
  await pool.query(
    'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
    [itemId, usuarioId],
  );
}

// Vaciar completamente el carrito de un usuario
async function vaciarCarrito(usuarioId) {
  await pool.query('DELETE FROM carrito WHERE usuario_id = ?', [usuarioId]);
}

module.exports = {
  obtenerCarritoPorUsuario,
  obtenerItemPorId,
  agregarOActualizarItem,
  actualizarCantidadItem,
  eliminarItem,
  vaciarCarrito,
};
