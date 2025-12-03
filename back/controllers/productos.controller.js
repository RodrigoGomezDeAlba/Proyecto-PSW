const ProductoModel = require('../modelo/productoModel');

// GET /api/categories
async function obtenerCategorias(req, res) {
  try {
    const categorias = await ProductoModel.obtenerCategorias();
    return res.json(categorias);
  } catch (err) {
    console.error('Error en obtenerCategorias:', err);
    return res.status(500).json({ message: 'Error al obtener categorías' });
  }
}

// GET /api/products
async function obtenerProductos(req, res) {
  try {
    const { category, priceMin, priceMax } = req.query;

    const filtros = {
      categoria: category || null,
      precioMin: priceMin ? Number(priceMin) : null,
      precioMax: priceMax ? Number(priceMax) : null,
    };

    const productos = await ProductoModel.obtenerProductos(filtros);
    return res.json(productos);
  } catch (err) {
    console.error('Error en obtenerProductos:', err);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
}

// GET /api/products/:id
async function obtenerProductoPorId(req, res) {
  try {
    const { id } = req.params;

    const producto = await ProductoModel.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(producto);
  } catch (err) {
    console.error('Error en obtenerProductoPorId:', err);
    return res.status(500).json({ message: 'Error al obtener producto' });
  }
}

// POST /api/admin/products
async function crearProducto(req, res) {
  try {
    const { nombre, descripcion, categoria, precio, inventario, imagen_url } = req.body;

    if (!nombre || !categoria || precio == null || inventario == null) {
      return res.status(400).json({
        message: 'Nombre, categoría, precio e inventario son obligatorios',
      });
    }

    const nuevo = await ProductoModel.crearProducto({
      nombre,
      descripcion,
      categoria,
      precio,
      inventario,
      imagen_url,
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error en crearProducto:', err);
    return res.status(500).json({ message: 'Error al crear producto' });
  }
}

// PUT /api/admin/products/:id
// (puedes usar PATCH igual, Express no hace diferencia en la lógica)
async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const campos = req.body;

    const ok = await ProductoModel.actualizarProducto(id, campos);
    if (!ok) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
    }

    const actualizado = await ProductoModel.obtenerProductoPorId(id);
    return res.json(actualizado);
  } catch (err) {
    console.error('Error en actualizarProducto:', err);
    return res.status(500).json({ message: 'Error al actualizar producto' });
  }
}

// DELETE /api/admin/products/:id
async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;

    const existente = await ProductoModel.obtenerProductoPorId(id);
    if (!existente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await ProductoModel.eliminarProducto(id);
    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error en eliminarProducto:', err);
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
}

module.exports = {
  obtenerCategorias,
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
