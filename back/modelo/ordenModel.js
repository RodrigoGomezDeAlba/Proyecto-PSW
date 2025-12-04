const pool = require('../db/conexion');

// Crear una orden usando los items actuales del carrito de un usuario
async function crearOrdenDesdeCarrito(usuarioId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Obtener items del carrito con datos de producto y bloquear filas de productos
    const [carritoItems] = await connection.query(
      `SELECT c.id AS carrito_id,
              c.producto_id,
              c.cantidad,
              c.precio_unitario,
              p.inventario
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = ?
       FOR UPDATE`,
      [usuarioId],
    );

    if (carritoItems.length === 0) {
      throw new Error('CARRITO_VACIO');
    }

    // 2) Validar inventario y calcular total
    let total = 0;
    for (const item of carritoItems) {
      if (item.inventario < item.cantidad) {
        throw new Error('SIN_INVENTARIO');
      }
      total += item.cantidad * item.precio_unitario;
    }

    // 3) Crear orden
    const [ordenResult] = await connection.query(
      'INSERT INTO ordenes (usuario_id, total, estado) VALUES (?, ?, ?)',
      [usuarioId, total, 'creada'],
    );
    const ordenId = ordenResult.insertId;

    // 4) Insertar items de la orden y descontar inventario
    for (const item of carritoItems) {
      const subtotal = item.cantidad * item.precio_unitario;

      await connection.query(
        'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [ordenId, item.producto_id, item.cantidad, item.precio_unitario, subtotal],
      );

      await connection.query(
        'UPDATE productos SET inventario = inventario - ? WHERE id = ?',
        [item.cantidad, item.producto_id],
      );
    }

    // 5) Vaciar carrito
    await connection.query('DELETE FROM carrito WHERE usuario_id = ?', [usuarioId]);

    await connection.commit();

    return { ordenId, total };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Listar órdenes de un usuario
async function obtenerOrdenesPorUsuario(usuarioId) {
  const [rows] = await pool.query(
    'SELECT id, total, estado FROM ordenes WHERE usuario_id = ? ORDER BY creada_en DESC',
    [usuarioId],
  );
  return rows;
}

// Obtener una orden con sus items
async function obtenerOrdenConItems(ordenId, usuarioId) {
  const [ordenRows] = await pool.query(
    'SELECT id, usuario_id, total, estado FROM ordenes WHERE id = ? AND usuario_id = ?',
    [ordenId, usuarioId],
  );

  const orden = ordenRows[0];
  if (!orden) return null;

  const [items] = await pool.query(
    `SELECT oi.id,
            oi.producto_id,
            oi.cantidad,
            oi.precio_unitario,
            oi.subtotal,
            p.nombre,
            p.imagen_url,
            p.categoria
     FROM orden_items oi
     JOIN productos p ON p.id = oi.producto_id
     WHERE oi.orden_id = ?`,
    [ordenId],
  );

  orden.items = items;
  return orden;
}

module.exports = {
  crearOrdenDesdeCarrito,
  obtenerOrdenesPorUsuario,
  obtenerOrdenConItems,
};