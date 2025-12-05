const PDFDocument = require('pdfkit');

function buildPurchasePdf({ nombre, email, items = [], total }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    // Acumular los datos del PDF
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Título
    doc.fontSize(18).text('Nota de compra', { align: 'center' });
    doc.moveDown();

    // Datos del cliente
    doc.fontSize(12).text(`Cliente: ${nombre}`);
    doc.text(`Correo: ${email}`);
    doc.text(`Fecha: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Detalle de la compra
    doc.fontSize(14).text('Detalle de la compra:');
    doc.moveDown(0.5);

    items.forEach((item, i) => {
      const nombreItem =
        item.nombre ||
        item.producto ||
        item.nombre_producto ||
        `Producto ${i + 1}`;

      const cantidad = item.cantidad || item.qty || 1;
      const precio = item.precio || item.precio_unitario || item.price || 0;
      const subtotal = item.subtotal || cantidad * precio;

      doc.fontSize(12).text(
        `${i + 1}. ${nombreItem} - Cantidad: ${cantidad} - Precio: $${precio} - Subtotal: $${subtotal}`
      );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: $${total}`, { align: 'right' });

    // Cerrar el documento
    doc.end();
  });
}

module.exports = { buildPurchasePdf };