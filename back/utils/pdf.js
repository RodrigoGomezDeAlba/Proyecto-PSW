const PDFDocument = require('pdfkit');
const path = require('path');
const { company } = require('../data/company');

const LOGO_PDF_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

function buildPurchasePdf({
  nombre,
  email,
  items = [],
  subtotal,
  tax,
  ship,
  discount,
  cupon,
  total,
  fecha,
  metodoPago,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    // Acumular los datos del PDF
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const fechaObj = fecha ? new Date(fecha) : new Date();
    const fechaTexto = fechaObj.toLocaleDateString('es-MX');
    const horaTexto = fechaObj.toLocaleTimeString('es-MX');

    const subNum = Number(subtotal ?? 0);
    const taxNum = Number(tax ?? 0);
    const shipNum = Number(ship ?? 0);
    const discountNum = Number(discount ?? 0);
    const totalNum = Number(total ?? subNum + taxNum + shipNum - discountNum);
    const cuponTexto = (cupon || '').toString().trim();

    // Encabezado: logo, nombre y lema
    try {
      doc.image(LOGO_PDF_PATH, { fit: [120, 120], align: 'center' });
    } catch (e) {
      // Si falta el logo, solo continuamos con texto
    }

    doc.moveDown(0.5);
    doc.fontSize(18).text(company.name, { align: 'center' });
    doc.moveDown(0.25);
    doc.fontSize(12).text(`"${company.slogan}"`, { align: 'center' });
    doc.moveDown();

    // Datos generales
    doc.fontSize(12).text(`Fecha: ${fechaTexto}`);
    doc.text(`Hora: ${horaTexto}`);
    doc.text(`Cliente: ${nombre}`);
    doc.text(`Correo: ${email}`);
    if (metodoPago) {
      doc.text(`Método de pago: ${metodoPago}`);
    }
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

      const cantidadItem = item.cantidad || item.qty || 1;
      const precioItem = item.precio || item.precio_unitario || item.price || 0;
      const subtotalItem = item.subtotal || cantidadItem * precioItem;

      doc.fontSize(12).text(
        `${i + 1}. ${nombreItem} - Cantidad: ${cantidadItem} - Precio: $${precioItem} - Subtotal: $${subtotalItem}`
      );
    });

    doc.moveDown();

    // Resumen de cobro
    doc.fontSize(14).text('Resumen de cobro:', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Subtotal: $${subNum.toFixed(2)}`);
    doc.text(`Impuestos: $${taxNum.toFixed(2)}`);
    doc.text(`Gastos de envío: $${shipNum.toFixed(2)}`);
    if (cuponTexto) {
      doc.text(`Cupón aplicado: ${cuponTexto} (descuento $${discountNum.toFixed(2)})`);
    }
    doc.text(`Total general: $${totalNum.toFixed(2)}`);

    // Cerrar el documento
    doc.end();
  });
}

module.exports = { buildPurchasePdf };
