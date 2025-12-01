// back/src/utils/pdf.js
import PDFDocument from 'pdfkit';

export function buildPurchasePdf(datosCompra) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    doc.fontSize(18).text('Nota de compra', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${datosCompra.nombre}`);
    doc.text(`Correo: ${datosCompra.email}`);
    doc.text(`Fecha: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.text('Detalle de la compra:');
    doc.moveDown();

    (datosCompra.items || []).forEach((item, i) => {
      doc.text(
        `${i + 1}. ${item.nombre} - Cantidad: ${item.cantidad} - Precio: $${item.precio}`
      );
    });

    doc.moveDown();
    doc.text(`Total: $${datosCompra.total}`, { align: 'right' });

    doc.end();
  });
}
