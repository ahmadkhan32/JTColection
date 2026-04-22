import { supabaseAdmin as supabase } from '../config/supabaseClient.js';
import { isSmtpConfigured, getTransporter } from '../config/smtp.js';

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  products?:  { title?: string };
  quantity:   number;
  price?:     number;
  price_at_purchase?: number;
  size?:      string;
  color?:     string;
}

interface EmailOrder {
  id:               string;
  customer_name?:   string;
  email?:           string;
  address?:         string;
  city?:            string;
  total_amount?:    number;
  currency?:        string;
  status?:          string;
  payment_method?:  string;
  user_id?:         string;
  order_items?:     OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Write a row to email_logs (best-effort — never throws). */
async function logEmail(
  order: EmailOrder,
  type: string,
  subject: string,
  status: 'sent' | 'failed',
  errorMsg?: string,
  attempts = 1
): Promise<void> {
  try {
    await supabase.from('email_logs').insert({
      order_id:  order.id,
      user_id:   order.user_id ?? null,
      email:     order.email ?? '',
      type,
      subject,
      status,
      error_msg: errorMsg ?? null,
      attempts,
      sent_at:   status === 'sent' ? new Date().toISOString() : null,
    });
  } catch (e: any) {
    // Logging must never break the order flow
    console.warn('[Email] DB log failed:', e?.message);
  }
}

/** Build HTML items table rows. */
function itemRows(items: OrderItem[], currency: string): string {
  if (!items?.length) return '<tr><td colspan="4" style="padding:12px;color:#94a3b8;text-align:center">No items</td></tr>';
  return items.map(item => {
    const name  = item.products?.title || 'Product';
    const attrs = [item.color, item.size].filter(Boolean).join(' / ');
    const price = Number(item.price_at_purchase ?? item.price ?? 0);
    const total = price * (item.quantity ?? 1);
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#111827">${name}${attrs ? `<br><span style="color:#94a3b8;font-size:11px">${attrs}</span>` : ''}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;text-align:center">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;text-align:right">${currency} ${price.toLocaleString()}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right">${currency} ${total.toLocaleString()}</td>
      </tr>`;
  }).join('');
}

/** Shared email wrapper with 1 automatic retry. */
async function sendMail(opts: Parameters<ReturnType<typeof getTransporter>['sendMail']>[0]): Promise<void> {
  const transporter = getTransporter();
  try {
    await transporter.sendMail(opts);
  } catch (firstErr: any) {
    console.warn('[Email] First attempt failed, retrying…', firstErr.message);
    // Wait 2 s then retry once
    await new Promise(r => setTimeout(r, 2000));
    await transporter.sendMail(opts); // throws on second failure — caller handles it
  }
}

// ── 1. Order Confirmation ─────────────────────────────────────────────────────

export const sendOrderConfirmationEmail = async (order: EmailOrder, pdfBuffer: Buffer): Promise<void> => {
  if (!isSmtpConfigured()) {
    console.log('[Email] SMTP not configured — skipping (set SMTP_USER + SMTP_PASS in .env)');
    return;
  }
  if (!order.email) {
    console.log('[Email] No customer email — skipping confirmation');
    return;
  }

  const currency = order.currency || 'PKR';
  const refId    = order.id.substring(0, 8).toUpperCase();
  const subject  = `JT Collections — Order Confirmed #${refId}`;
  const from     = process.env.SMTP_FROM
    ? `"JT Collections" <${process.env.SMTP_FROM}>`
    : `"JT Collections" <${process.env.SMTP_USER}>`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
  <!-- Header -->
  <div style="background:#0f172a;padding:32px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:-0.5px">JT Collections</h1>
    <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Premium Fashion &amp; Accessories</p>
  </div>
  <!-- Body -->
  <div style="padding:40px">
    <h2 style="color:#0f172a;margin-top:0;font-size:20px">Your Order is Confirmed! &#127881;</h2>
    <p style="color:#64748b;font-size:14px">Hi <strong style="color:#0f172a">${order.customer_name || 'Valued Customer'}</strong>, thank you for shopping with us. Your order has been received and is being processed.</p>

    <!-- Order summary -->
    <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin:24px 0;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Order Reference</td><td style="padding:9px 0;font-weight:700;border-bottom:1px solid #f1f5f9;text-align:right">#${refId}</td></tr>
        <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Status</td><td style="padding:9px 0;font-weight:700;text-transform:uppercase;border-bottom:1px solid #f1f5f9;text-align:right;color:#16a34a">${order.status || 'pending'}</td></tr>
        <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Delivery To</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;text-align:right">${[order.address, order.city].filter(Boolean).join(', ') || '—'}</td></tr>
        <tr><td style="padding:9px 0;color:#64748b">Payment Method</td><td style="padding:9px 0;font-weight:600;text-align:right">${order.payment_method || 'COD'}</td></tr>
      </table>
    </div>

    <!-- Items table -->
    <h3 style="color:#0f172a;font-size:15px;margin-bottom:8px">Order Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.05em">Product</th>
          <th style="padding:10px 12px;text-align:center;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.05em">Qty</th>
          <th style="padding:10px 12px;text-align:right;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.05em">Price</th>
          <th style="padding:10px 12px;text-align:right;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.05em">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows(order.order_items || [], currency)}</tbody>
      <tfoot>
        <tr style="background:#0f172a">
          <td colspan="3" style="padding:12px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Order Total</td>
          <td style="padding:12px;color:#ffffff;font-weight:800;font-size:16px;text-align:right">${currency} ${Number(order.total_amount || 0).toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <p style="color:#64748b;font-size:13px;margin-top:24px">&#128206; Your PDF invoice is attached to this email.</p>

    <!-- Footer -->
    <p style="color:#94a3b8;font-size:11px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center">
      JT Collections &nbsp;&middot;&nbsp; Premium Fashion &amp; Accessories<br>
      Questions? Email us at <a href="mailto:support@jtcollections.com" style="color:#6366f1">support@jtcollections.com</a>
    </p>
  </div>
</div>`;

  let attempts = 1;
  try {
    await sendMail({
      from,
      to:      order.email,
      subject,
      html,
      attachments: [{
        filename:    `JT-Invoice-${refId}.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
    console.log(`[Email] ✅ Confirmation sent to ${order.email}`);
    await logEmail(order, 'order_confirmation', subject, 'sent', undefined, attempts);
  } catch (firstErr: any) {
    attempts = 2;
    console.warn(`[Email] ⚠ Both attempts failed for ${order.email}:`, firstErr.message);
    await logEmail(order, 'order_confirmation', subject, 'failed', firstErr.message, attempts);
  }
};

// ── 2. Order Status Update ────────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, { heading: string; body: string; color: string }> = {
  confirmed:  { heading: 'Order Confirmed',       body: 'Your order has been confirmed and will be processed shortly.',      color: '#2563eb' },
  processing: { heading: 'Order Being Processed', body: 'Great news! Your order is now being prepared for dispatch.',        color: '#7c3aed' },
  shipped:    { heading: 'Order Shipped! &#128230;', body: 'Your order is on its way. Expect delivery within 2-5 business days.', color: '#0891b2' },
  delivered:  { heading: 'Order Delivered! &#127881;', body: 'Your order has been delivered. We hope you love your purchase!',   color: '#16a34a' },
  cancelled:  { heading: 'Order Cancelled',       body: 'Your order has been cancelled. Contact us if this was a mistake.',  color: '#dc2626' },
};

export const sendOrderStatusEmail = async (order: EmailOrder): Promise<void> => {
  if (!isSmtpConfigured()) return;
  if (!order.email) return;

  const statusInfo = STATUS_MESSAGES[order.status?.toLowerCase() ?? ''];
  if (!statusInfo) return; // no email for 'pending'

  const currency = order.currency || 'PKR';
  const refId    = order.id.substring(0, 8).toUpperCase();
  const subject  = `JT Collections — ${statusInfo.heading} #${refId}`;
  const from     = process.env.SMTP_FROM
    ? `"JT Collections" <${process.env.SMTP_FROM}>`
    : `"JT Collections" <${process.env.SMTP_USER}>`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
  <div style="background:#0f172a;padding:32px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:24px">JT Collections</h1>
    <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Premium Fashion &amp; Accessories</p>
  </div>
  <div style="padding:40px">
    <div style="border-left:4px solid ${statusInfo.color};padding-left:16px;margin-bottom:24px">
      <h2 style="color:#0f172a;margin:0 0 6px;font-size:18px">${statusInfo.heading}</h2>
      <p style="color:#64748b;margin:0;font-size:14px">Hi <strong>${order.customer_name || 'Valued Customer'}</strong>, ${statusInfo.body}</p>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #e2e8f0">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Order Ref</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #f1f5f9;text-align:right">#${refId}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">New Status</td><td style="padding:8px 0;font-weight:700;text-transform:uppercase;border-bottom:1px solid #f1f5f9;text-align:right;color:${statusInfo.color}">${order.status}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Total</td><td style="padding:8px 0;font-weight:700;text-align:right">${currency} ${Number(order.total_amount || 0).toLocaleString()}</td></tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:11px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center">
      JT Collections &nbsp;&middot;&nbsp; Questions? <a href="mailto:support@jtcollections.com" style="color:#6366f1">support@jtcollections.com</a>
    </p>
  </div>
</div>`;

  try {
    await sendMail({ from, to: order.email, subject, html });
    console.log(`[Email] ✅ Status update (${order.status}) sent to ${order.email}`);
    await logEmail(order, 'status_update', subject, 'sent');
  } catch (err: any) {
    console.warn(`[Email] ⚠ Status email failed for ${order.email}:`, err.message);
    await logEmail(order, 'status_update', subject, 'failed', err.message);
  }
};
