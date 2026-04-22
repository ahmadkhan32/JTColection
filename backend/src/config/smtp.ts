// ── SMTP Transporter ─────────────────────────────────────────────────────────
// Centralised Nodemailer transporter — imported by email.service.ts.
// Configure via environment variables (see .env.example).

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Returns true when the minimum SMTP credentials are present in the environment. */
export const isSmtpConfigured = (): boolean =>
  !!(process.env.SMTP_USER && process.env.SMTP_PASS);

/** Singleton transporter. Cached after first call. */
let _transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',  // true = port 465
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    // Allow self-signed certs in dev (never set this in production)
    ...(process.env.NODE_ENV !== 'production'
      ? { tls: { rejectUnauthorized: false } }
      : {}),
  });

  return _transporter;
};
