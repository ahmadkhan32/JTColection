const compactSecretKeys = new Set([
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'JWT_SECRET',
  'SMTP_PASS',
]);

function normalizeValue(name: string, value: string): string {
  const trimmed = value.trim();
  return compactSecretKeys.has(name) ? trimmed.replace(/\s+/g, '') : trimmed;
}

export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value == null) return undefined;

  const normalized = normalizeValue(name, value);
  return normalized || undefined;
}

export function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}