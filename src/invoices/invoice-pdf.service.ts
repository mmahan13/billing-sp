import { Injectable } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicePdfService {
  async generatePdf(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: Error) => reject(err));

        // --- FUNCIONES AUXILIARES DE MAQUETACIÓN ---
        const drawHeader = (d: PDFKit.PDFDocument, inv: Invoice) => {
          d.font('Helvetica-Bold')
            .fontSize(14)
            .text(
              inv.user.company?.businessName || 'Sabor a Miel S.L.',
              50,
              50,
            );
          d.font('Helvetica').fontSize(10);
          d.text(`NIF: ${inv.user.company?.taxId || 'B12345678'}`, 50, 68);
          d.text(
            `Domicilio: ${inv.user.company?.address || 'Calle de las Abejas 12, Mijas, Málaga'}`,
            50,
            82,
          );
          d.text(`Teléfono: ${inv.user.company?.phone || '600123456'}`, 50, 96);
          d.text(`IBAN: ES91 1234 5678 9012 3456 7890`, 50, 110);

          d.font('Helvetica-Bold')
            .fontSize(12)
            .text(`FACTURA: ${inv.invoiceNumber}`, 300, 50, {
              width: 250,
              align: 'right',
            });
          d.font('Helvetica')
            .fontSize(10)
            .text(
              `Fecha: ${new Date(inv.issueDate).toLocaleDateString('es-ES')}`,
              300,
              68,
              { width: 250, align: 'right' },
            );
          d.moveTo(50, 135).lineTo(550, 135).stroke();
        };

        const drawTableHeaders = (d: PDFKit.PDFDocument, yPos: number) => {
          d.font('Helvetica-Bold').fontSize(10);
          d.text('Unidades', 50, yPos, { width: 60, align: 'center' });
          d.text('Producto', 120, yPos);
          d.text('Prec. Uni.', 330, yPos, { width: 70, align: 'right' });
          d.text('IVA / R.E.', 410, yPos, { width: 60, align: 'right' });
          d.text('Total', 480, yPos, { width: 70, align: 'right' });
          d.moveTo(50, yPos + 15)
            .lineTo(550, yPos + 15)
            .stroke();
        };

        // 1. Dibujamos la cabecera de la primera página
        drawHeader(doc, invoice);

        // Datos del cliente
        doc.font('Helvetica-Bold').fontSize(11).text('Facturar a:', 50, 155);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(invoice.order.client.businessName, 50, 170);
        doc.text(`NIF: ${invoice.order.client.taxId}`, 50, 185);
        doc.text(invoice.order.client.address, 50, 200);

        let currentY = 240;
        drawTableHeaders(doc, currentY);
        currentY += 25;

        // Variables para impuestos
        let baseImponibleTotal = 0;
        let ivaTotal = 0;
        let reTotal = 0;
        const taxGroups: Record<
          string,
          {
            base: number;
            iva: number;
            re: number;
            taxRate: number;
            reRate: number;
          }
        > = {};

        // 2. FILAS DE PRODUCTOS (Con control de salto de página)
        doc.font('Helvetica').fontSize(10);

        invoice.order.items.forEach((item) => {
          const qty = Number(item.quantity);
          const price = Number(item.priceAtTime);
          let taxRate = Number(item.taxAtTime || 0);
          let reRate = 0;

          // Separación automática de IVA y RE
          if (taxRate === 11.4) {
            taxRate = 10;
            reRate = 1.4;
          } else if (taxRate === 26.2) {
            taxRate = 21;
            reRate = 5.2;
          } else if (taxRate === 4.5) {
            taxRate = 4;
            reRate = 0.5;
          }

          const baseLinea = price * qty;
          const ivaLinea = baseLinea * (taxRate / 100);
          const reLinea = baseLinea * (reRate / 100);
          const totalLinea = baseLinea + ivaLinea + reLinea;

          baseImponibleTotal += baseLinea;
          ivaTotal += ivaLinea;
          reTotal += reLinea;

          const groupKey = `${taxRate}_${reRate}`;
          if (!taxGroups[groupKey]) {
            taxGroups[groupKey] = { base: 0, iva: 0, re: 0, taxRate, reRate };
          }
          taxGroups[groupKey].base += baseLinea;
          taxGroups[groupKey].iva += ivaLinea;
          taxGroups[groupKey].re += reLinea;

          // SALTO DE PÁGINA
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
            drawTableHeaders(doc, currentY);
            currentY += 25;
            doc.font('Helvetica').fontSize(10);
          }

          doc.text(qty.toString(), 50, currentY, {
            width: 60,
            align: 'center',
          });
          doc.text(item.product.productName, 120, currentY);
          doc.text(`${price.toFixed(2)} €`, 330, currentY, {
            width: 70,
            align: 'right',
          });

          const taxText =
            reRate > 0 ? `${taxRate}% / ${reRate}%` : `${taxRate}%`;
          doc.text(taxText, 410, currentY, { width: 60, align: 'right' });
          doc.text(`${totalLinea.toFixed(2)} €`, 480, currentY, {
            width: 70,
            align: 'right',
          });

          currentY += 20;
        });

        // 3. PIE DE PÁGINA (RESUMEN E IMPUESTOS)
        if (currentY > 640) {
          doc.addPage();
        }

        let summaryY = 680;
        const hasRE = reTotal > 0;

        // LÍNEA SUPERIOR DEL BLOQUE DE IMPUESTOS
        doc
          .moveTo(50, summaryY - 15)
          .lineTo(550, summaryY - 15)
          .stroke();

        doc.font('Courier-Bold').fontSize(10);
        doc.text('BASE IMPONIBLE', 50, summaryY, {
          width: 110,
          align: 'center',
        });
        doc.text('% IVA', 170, summaryY, { width: 60, align: 'center' });
        doc.text('CUOTA IVA', 240, summaryY, { width: 80, align: 'center' });

        if (hasRE) {
          doc.text('% R.E.', 330, summaryY, { width: 60, align: 'center' });
          doc.text('CUOTA R.E.', 400, summaryY, { width: 80, align: 'center' });
        }

        // ✨ AQUÍ ESTÁ EL CAMBIO: Ahora la línea siempre va de 50 a 550, sea cual sea el caso ✨
        doc
          .moveTo(50, summaryY + 15)
          .lineTo(550, summaryY + 15)
          .stroke();
        summaryY += 25;

        doc.font('Courier').fontSize(10);
        Object.values(taxGroups).forEach((group) => {
          doc.text(`${group.base.toFixed(2)} €`, 50, summaryY, {
            width: 110,
            align: 'center',
          });
          doc.text(`${group.taxRate}%`, 170, summaryY, {
            width: 60,
            align: 'center',
          });
          doc.text(`${group.iva.toFixed(2)} €`, 240, summaryY, {
            width: 80,
            align: 'center',
          });

          if (hasRE) {
            doc.text(
              `${group.reRate > 0 ? group.reRate + '%' : '-'}`,
              330,
              summaryY,
              { width: 60, align: 'center' },
            );
            doc.text(
              `${group.re > 0 ? group.re.toFixed(2) + ' €' : '-'}`,
              400,
              summaryY,
              { width: 80, align: 'center' },
            );
          }
          summaryY += 15;
        });

        // Gran Total Final
        summaryY += 10;
        const totalFinal = baseImponibleTotal + ivaTotal + reTotal;
        doc.font('Helvetica-Bold').fontSize(14);
        doc.text('TOTAL FACTURA:', 200, summaryY, {
          width: 200,
          align: 'right',
        });
        doc.text(`${totalFinal.toFixed(2)} €`, 420, summaryY, {
          width: 130,
          align: 'right',
        });

        doc.end();
      } catch (error: unknown) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
}
