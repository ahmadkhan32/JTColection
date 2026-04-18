import nodemailer from 'nodemailer';

const isConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendOrderConfirmationEmail = async (order: any, pdfBuffer: Buffer): Promise<void> => {
  if (!isConfigured()) {
    console.log('[Email] SMTP not configured — skipping (set SMTP_USER + SMTP_PASS in .env to enable)');
    return;
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const currency = order.currency || 'PKR';
  const refId    = order.id.substring(0, 8).toUpperCase();

  try {
    await transporter.sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to:      order.email,
      subject: `JT Collections — Order Confirmed #${refId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:#0f172a;padding:32px 40px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px">JT Collections</h1>
            <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Premium Fashion & Accessories</p>
          </div>
          <div style="padding:40px">
            <h2 style="color:#0f172a;margin-top:0">Your Order is Confirmed! 🎉</h2>
            <p style="color:#64748b">Hi <strong>${order.customer_name}</strong>, your order has been received and is being processed.</p>
            <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e2e8f0">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:10px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Order Reference</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #f1f5f9">#${refId}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Status</td><td style="padding:10px 0;font-weight:700;text-transform:uppercase;border-bottom:1px solid #f1f5f9">${order.status}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Total</td><td style="padding:10px 0;font-weight:800;font-size:18px;border-bottom:1px solid #f1f5f9">${currency} ${Number(order.total_amount).toLocaleString()}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Address</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9">${order.address}, ${order.city}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b">Payment</td><td style="padding:10px 0">${order.payment_method || 'COD'}</td></tr>
              </table>
            </div>
            <p style="color:#64748b;font-size:13px">📎 Your invoice is attached to this email as a PDF.</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center">
              JT Collections &nbsp;·&nbsp; support@jtcollections.com
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename:    `JT-Invoice-${refId}.pdf`,
          content:     pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log(`[Email] ✅ Invoice sent to ${order.email}`);
  } catch (err: any) {
    console.warn(`[Email] ⚠ Failed to send to ${order.email}:`, err.message);
  }
};
