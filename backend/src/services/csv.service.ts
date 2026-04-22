// ── CSV Export Service ─────────────────────────────────────────────────────
// Generates Excel-compatible UTF-8 CSV from orders.
// No external dependency — built using plain string manipulation.

interface ExportOrderItem {
  quantity: number;
  price?: number;
  price_at_purchase?: number;
  size?: string;
  color?: string;
  products?: { title?: string; categories?: { name?: string } | null };
}

export interface ExportOrder {
  id: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  total_amount?: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  created_at?: string;
  order_items?: ExportOrderItem[];
}

/** Escape a CSV field: wrap in double-quotes and escape inner quotes. */
function csvField(value: unknown): string {
  const str = value == null ? '' : String(value);
  // If the string contains commas, newlines, or quotes, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(fields: unknown[]): string {
  return fields.map(csvField).join(',');
}

/**
 * Generate a CSV string from an array of orders.
 * Each order item becomes its own row (flattened).
 * Orders with no items produce one row with empty item columns.
 */
export function generateOrdersCSV(orders: ExportOrder[]): string {
  const headers = [
    'Order ID',
    'Order Ref',
    'Date',
    'Customer Name',
    'Email',
    'Phone',
    'City',
    'Address',
    'Status',
    'Payment Method',
    'Currency',
    'Category',
    'Product',
    'Color',
    'Size',
    'Qty',
    'Unit Price (PKR)',
    'Line Total (PKR)',
    'Order Total (PKR)',
  ];

  const rows: string[] = [csvRow(headers)];

  for (const order of orders) {
    const dateStr = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-GB')
      : '';
    const ref = order.id?.substring(0, 8).toUpperCase() ?? '';
    const currency = order.currency || 'PKR';

    const items = order.order_items ?? [];

    if (items.length === 0) {
      // One empty row for the order with no items
      rows.push(csvRow([
        order.id,
        ref,
        dateStr,
        order.customer_name || 'Guest',
        order.email || '',
        order.phone || '',
        order.city || '',
        order.address || '',
        order.status || '',
        order.payment_method || 'COD',
        currency,
        '', '', '', '', '', '',
        order.total_amount ?? 0,
      ]));
    } else {
      for (const item of items) {
        const unitPrice = Number(item.price_at_purchase ?? item.price ?? 0);
        const lineTotal = unitPrice * (item.quantity ?? 1);
        const category = item.products?.categories?.name || '';
        rows.push(csvRow([
          order.id,
          ref,
          dateStr,
          order.customer_name || 'Guest',
          order.email || '',
          order.phone || '',
          order.city || '',
          order.address || '',
          order.status || '',
          order.payment_method || 'COD',
          currency,
          category,
          item.products?.title || 'Product',
          item.color || '',
          item.size || '',
          item.quantity ?? 1,
          unitPrice,
          lineTotal,
          order.total_amount ?? 0,
        ]));
      }
    }
  }

  // BOM prefix ensures Excel opens as UTF-8 correctly
  return '\uFEFF' + rows.join('\r\n');
}
