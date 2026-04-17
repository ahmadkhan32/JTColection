/**
 * Run this script to add the missing `updated_at` column to the products table.
 *
 * Prerequisites:
 *   1. Get a Personal Access Token from: https://supabase.com/dashboard/account/tokens
 *   2. Set it as an environment variable, then run:
 *
 *        $env:SUPABASE_ACCESS_TOKEN="sbp_xxxxxxxxxxxx"
 *        node database/add-updated-at.mjs
 */

const PROJECT_REF = 'xmssdsjhinitkykdpatb';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('\n❌  Missing SUPABASE_ACCESS_TOKEN environment variable.');
  console.error(
    '   Get one from: https://supabase.com/dashboard/account/tokens\n' +
    '   Then run:\n' +
    '     $env:SUPABASE_ACCESS_TOKEN="sbp_xxxxxxxxxxxx"\n' +
    '     node database/add-updated-at.mjs\n'
  );
  process.exit(1);
}

const SQL = `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();`;

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  }
);

const body = await res.json().catch(() => ({}));

if (res.ok) {
  console.log('✅  Column added (or already existed). products.updated_at is ready.');
} else {
  console.error(`❌  API error ${res.status}:`, body);
  process.exit(1);
}
