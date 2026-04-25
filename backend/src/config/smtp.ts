// ── SMTP Transporter ─────────────────────────────────────────────────────────
// Centralised Nodemailer transporter — imported by email.service.ts.
// Configure via environment variables (see .env.example).

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getEnv } from './env.js';

/** Returns true when the minimum SMTP credentials are present in the environment. */
export const isSmtpConfigured = (): boolean =>
  !!(getEnv('SMTP_USER') && getEnv('SMTP_PASS'));

/** Singleton transporter. Cached after first call. */
let _transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
  if (_transporter) return _transporter;

  const host = getEnv('SMTP_HOST') || 'smtp.gmail.com';
  const port = Number(getEnv('SMTP_PORT')) || 587;
  const secure = getEnv('SMTP_SECURE') === 'true';
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');

  if (!user || !pass) {
    throw new Error('SMTP transport requested without SMTP_USER/SMTP_PASS');
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,  // true = port 465
    auth: {
      user,
      pass,
    },
    // Allow self-signed certs in dev (never set this in production)
    ...(process.env.NODE_ENV !== 'production'
      ? { tls: { rejectUnauthorized: false } }
      : {}),
  });

  return _transporter;
};
