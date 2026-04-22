// ── Bulk Orders Report PDF Service ────────────────────────────────────────────
// Generates a multi-page PDF report of all orders for the admin.
// Uses the already-installed PDFKit package.

import PDFDocument from 'pdfkit';
import type { ExportOrder } from './csv.service.js';

export function generateOrdersReportPDF(
  orders: ExportOrder[],
  meta: { status?: string; from?: string; to?: string; category?: string } = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;    // 595
    const ml    = 40;                // left margin
    const mr    = 40;                // right margin
    const cw    = pageW - ml - mr;   // content width = 515

    const fmt = (n: number) =>
      `PKR ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

    // ── DARK HEADER ──────────────────────────────────────────────────────────
    doc.rect(0, 0, pageW, 80).fill('#0f172a');
    doc.fill('#ffffff').fontSize(22).font('Helvetica-Bold').text('JT Collections', ml, 18);
    doc.fontSize(9).font('Helvetica').fill('#94a3b8').text('Admin · Orders Export Report', ml, 46);

    const generatedAt = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    doc.fill('#64748b').text(`Generated: ${generatedAt}`, pageW - 200, 46, { width: 160, align: 'right' });

    doc.y = 98;

    // ── FILTER SUMMARY ───────────────────────────────────────────────────────
    const filterParts: string[] = [];
    if (meta.status && meta.status !== 'all') filterParts.push(`Status: ${meta.status.toUpperCase()}`);
    if (meta.category) filterParts.push(`Category: ${meta.category}`);
    if (meta.from) filterParts.push(`From: ${meta.from}`);
    if (meta.to)   filterParts.push(`To: ${meta.to}`);
    filterParts.push(`Total orders: ${orders.length}`);

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    filterParts.push(`Total revenue: ${fmt(totalRevenue)}`);

    doc.fontSize(9).font('Helvetica').fill('#475569')
      .text(filterParts.join('   ·   '), ml, doc.y, { width: cw });

    doc.moveDown(0.8);
    doc.moveTo(ml, doc.y).lineTo(ml + cw, doc.y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    // ── TABLE ────────────────────────────────────────────────────────────────
    // Column x-positions (left edge of each column)
    const COL = {
      ref:      ml,
      customer: ml + 58,
      date:     ml + 195,
      status:   ml + 268,
      items:    ml + 332,
      total:    ml + 390,
    };
    const ROW_H = 22;

    // Helper: draw table header row
    const drawTableHeader = () => {
      const hY = doc.y;
      doc.rect(ml, hY, cw, ROW_H).fill('#f1f5f9');
      doc.fill('#64748b').font('Helvetica-Bold').fontSize(7.5);
      doc.text('REF',      COL.ref,      hY + 7, { width: 56 });
      doc.text('CUSTOMER', COL.customer, hY + 7, { width: 134 });
      doc.text('DATE',     COL.date,     hY + 7, { width: 70 });
      doc.text('STATUS',   COL.status,   hY + 7, { width: 56 });
      doc.text('ITEMS',    COL.items,    hY + 7, { width: 55, align: 'right' });
      doc.text('TOTAL',    COL.total,    hY + 7, { width: pageW - ml - mr - (COL.total - ml), align: 'right' });
      doc.y = hY + ROW_H + 2;
    };

    drawTableHeader();

    // ── ROWS ─────────────────────────────────────────────────────────────────
    const STATUS_COLOR: Record<string, string> = {
      pending:    '#d97706',
      confirmed:  '#2563eb',
      processing: '#7c3aed',
      shipped:    '#6d28d9',
      delivered:  '#16a34a',
      cancelled:  '#dc2626',
    };

    let rowIdx = 0;

    for (const order of orders) {
      // Add new page if we're near the bottom
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        doc.y = 40;
        drawTableHeader();
      }

      const rowY = doc.y;
      const isEven = rowIdx % 2 === 0;

      // Alternating row background
      if (isEven) doc.rect(ml, rowY, cw, ROW_H).fill('#fafafa');

      const dateStr = order.created_at
        ? new Date(order.created_at).toLocaleDateString('en-GB')
        : '—';
      const ref = '#' + (order.id?.substring(0, 8).toUpperCase() ?? '???');
      const status = (order.status || 'pending').toLowerCase();
      const statusColor = STATUS_COLOR[status] ?? '#64748b';
      const itemCount = order.order_items?.length ?? 0;
      const productNames = (order.order_items ?? [])
        .map(i => {
          const cat = i.products?.categories?.name;
          return cat ? `[${cat}] ${i.products?.title || 'Product'}` : (i.products?.title || 'Product');
        })
        .slice(0, 2)
        .join(', ')
        + (itemCount > 2 ? ` +${itemCount - 2} more` : '');

      doc.fill('#374151').font('Helvetica-Bold').fontSize(7.5)
        .text(ref, COL.ref, rowY + 7, { width: 56 });

      doc.fill('#111827').font('Helvetica').fontSize(7.5)
        .text(order.customer_name || 'Guest', COL.customer, rowY + 3, { width: 128 });
      if (productNames) {
        doc.fill('#94a3b8').fontSize(6.5)
          .text(productNames, COL.customer, rowY + 13, { width: 128 });
      }

      doc.fill('#374151').font('Helvetica').fontSize(7.5)
        .text(dateStr, COL.date, rowY + 7, { width: 68 });

      doc.fill(statusColor).font('Helvetica-Bold').fontSize(7)
        .text(status.toUpperCase(), COL.status, rowY + 7, { width: 56 });

      doc.fill('#374151').font('Helvetica').fontSize(7.5)
        .text(String(itemCount), COL.items, rowY + 7, { width: 55, align: 'right' });

      doc.fill('#111827').font('Helvetica-Bold').fontSize(7.5)
        .text(fmt(Number(order.total_amount || 0)), COL.total, rowY + 7,
          { width: pageW - ml - mr - (COL.total - ml), align: 'right' });

      // Row separator
      doc.moveTo(ml, rowY + ROW_H).lineTo(ml + cw, rowY + ROW_H)
        .strokeColor('#e2e8f0').lineWidth(0.3).stroke();

      doc.y = rowY + ROW_H;
      rowIdx++;
    }

    // ── SUMMARY BOX ──────────────────────────────────────────────────────────
    doc.moveDown(1.5);
    if (doc.y > doc.page.height - 100) { doc.addPage(); doc.y = 40; }

    const sbY = doc.y;
    const sbW = 200;
    doc.rect(pageW - mr - sbW, sbY, sbW, 44).fill('#0f172a');
    doc.fill('#94a3b8').font('Helvetica').fontSize(8)
      .text('TOTAL REVENUE', pageW - mr - sbW + 10, sbY + 8, { width: sbW - 20 });
    doc.fill('#ffffff').font('Helvetica-Bold').fontSize(14)
      .text(fmt(totalRevenue), pageW - mr - sbW + 10, sbY + 20, { width: sbW - 20, align: 'right' });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    doc.moveDown(3);
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
      .text('JT Collections · Confidential Admin Report', { align: 'center' });

    doc.end();
  });
}
