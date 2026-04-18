import PDFDocument from 'pdfkit';

interface InvoiceItem {
  products?: { title?: string; price?: number };
  product_name?: string;
  quantity: number;
  price?: number;
  price_at_purchase?: number;
}

interface InvoiceOrder {
  id: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  total_amount?: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  created_at?: string;
}

export const generateInvoicePDF = (order: InvoiceOrder, items: InvoiceItem[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const currency = order.currency || 'PKR';
    const fmt = (n: number) =>
      `${currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // ── Dark Header ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
    doc.fill('#ffffff').fontSize(24).font('Helvetica-Bold').text('JT Collections', 50, 25);
    doc.fontSize(10).font('Helvetica').fill('#94a3b8').text('Premium Fashion & Accessories', 50, 55);
    doc.fill('#64748b').fontSize(9).text('INVOICE', doc.page.width - 120, 38, { width: 70, align: 'right' });

    doc.y = 110;
    doc.fill('#0f172a');

    // ── Order Meta ───────────────────────────────────────────────────────────
    const dateStr = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString();

    const metaLeft  = 50;
    const metaRight = 320;

    doc.fontSize(10).font('Helvetica');
    doc.fill('#64748b').text('ORDER REFERENCE', metaLeft, doc.y);
    doc.fill('#0f172a').font('Helvetica-Bold').fontSize(14).text(`#${order.id.substring(0, 8).toUpperCase()}`, metaLeft, doc.y + 2);
    doc.y += 6;

    doc.font('Helvetica').fontSize(9).fill('#64748b');
    const rowY = doc.y;
    doc.text(`Date: `,    metaLeft, rowY, { continued: true }).fill('#0f172a').font('Helvetica-Bold').text(dateStr);
    doc.fill('#64748b').font('Helvetica').text(`Status: `,  metaLeft, doc.y, { continued: true }).fill('#0f172a').font('Helvetica-Bold').text((order.status || 'pending').toUpperCase());
    doc.fill('#64748b').font('Helvetica').text(`Payment: `, metaLeft, doc.y, { continued: true }).fill('#0f172a').font('Helvetica-Bold').text(order.payment_method || 'COD');
    doc.fill('#64748b').font('Helvetica').text(`Currency: `, metaLeft, doc.y, { continued: true }).fill('#0f172a').font('Helvetica-Bold').text(currency);

    // Bill To (right column)
    const billY = rowY;
    doc.fill('#64748b').font('Helvetica').fontSize(9).text('BILL TO', metaRight, billY);
    doc.fill('#0f172a').font('Helvetica-Bold').fontSize(12).text(order.customer_name || 'Guest', metaRight, billY + 14);
    doc.font('Helvetica').fontSize(9).fill('#475569');
    if (order.email) doc.text(order.email, metaRight, doc.y + 2);
    if (order.phone) doc.text(order.phone, metaRight, doc.y + 2);
    if (order.address) {
      const addr = `${order.address}${order.city ? ', ' + order.city : ''}${order.postal_code ? ' ' + order.postal_code : ''}`;
      doc.text(addr, metaRight, doc.y + 2, { width: 200 });
    }

    doc.moveDown(1.5);
    doc.fill('#0f172a');

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.moveDown(0.8);

    // ── Table Header ─────────────────────────────────────────────────────────
    const COL = { item: 55, qty: 345, price: 415, total: 490 };
    const thY = doc.y;
    doc.rect(50, thY, 500, 24).fill('#f8fafc');
    doc.fill('#64748b').font('Helvetica-Bold').fontSize(9);
    doc.text('ITEM',  COL.item,  thY + 8);
    doc.text('QTY',   COL.qty,   thY + 8);
    doc.text('PRICE', COL.price, thY + 8, { width: 70, align: 'right' });
    doc.text('TOTAL', COL.total, thY + 8, { width: 55, align: 'right' });
    doc.y = thY + 30;

    // ── Items ────────────────────────────────────────────────────────────────
    doc.fill('#0f172a').font('Helvetica').fontSize(10);
    for (const item of items) {
      const rowStart = doc.y;
      const name  = item.products?.title || item.product_name || 'Product';
      const qty   = item.quantity;
      const price = Number(item.price_at_purchase ?? item.price ?? 0);
      const total = price * qty;

      doc.text(name, COL.item, rowStart, { width: 275 });
      const textBottom = doc.y;
      doc.text(String(qty),  COL.qty,   rowStart);
      doc.text(fmt(price),   COL.price, rowStart, { width: 70, align: 'right' });
      doc.text(fmt(total),   COL.total, rowStart, { width: 55, align: 'right' });
      doc.y = Math.max(textBottom, rowStart + 16);
      doc.moveTo(50, doc.y + 3).lineTo(550, doc.y + 3).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
      doc.y += 10;
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.moveDown();

    // ── Total Box ────────────────────────────────────────────────────────────
    const tbY = doc.y;
    doc.rect(350, tbY, 200, 38).fill('#0f172a');
    doc.fill('#ffffff').fontSize(11).font('Helvetica-Bold');
    doc.text('TOTAL', 360, tbY + 13, { width: 80 });
    doc.text(fmt(Number(order.total_amount || 0)), 360, tbY + 13, { width: 175, align: 'right' });
    doc.y = tbY + 55;
    doc.fill('#0f172a');

    doc.moveDown(3);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
      .text('Thank you for shopping with JT Collections!', { align: 'center' });
    doc.text('Queries: support@jtcollections.com', { align: 'center' });

    doc.end();
  });
};
