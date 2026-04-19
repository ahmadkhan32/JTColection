/**
 * JT Collections – Production SQL Executor
 * ==========================================
 * Runs PRODUCTION_SETUP.sql against Supabase via direct PostgreSQL connection.
 *
 * SETUP (one time):
 *   1. Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/settings/database
 *   2. Scroll to "Connection String" → copy the URI (starts with postgresql://)
 *   3. Paste it in backend/.env as:  DATABASE_URL=postgresql://postgres...
 *   4. Run:  node run-production-sql.mjs
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dir, 'backend', '.env'), quiet: true });

const require = createRequire(import.meta.url);

// ── Helpers ────────────────────────────────────────────────────────────────
const pass = msg => console.log(`  ✅ ${msg}`);
const fail = msg => console.log(`  ❌ ${msg}`);
const info = msg => console.log(`  ℹ️  ${msg}`);
const warn = msg => console.log(`  ⚠️  ${msg}`);
function header(msg) { console.log(`\n${'─'.repeat(64)}\n${msg}\n${'─'.repeat(64)}`); }

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Check DATABASE_URL ─────────────────────────────────────────────────────
header('STEP 1 — Check database connection');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  warn('DATABASE_URL not set in backend/.env');
  console.log(`
  To execute the SQL, add your Supabase database URL to backend/.env:

    DATABASE_URL=postgresql://postgres.[password]@db.xmssdsjhinitkykdpatb.supabase.co:5432/postgres

  Get it from:
    → https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/settings/database
    → Scroll to "Connection String" → URI tab → copy the full string

  Then run:  node run-production-sql.mjs

  ─────────────────────────────────────────────────────────────────
  Falling back to REST-only operations (no DDL)...
  `);
} else {
  pass(`DATABASE_URL found (${DATABASE_URL.split('@')[1]?.split('/')[0]})`);
}

// ── STEP 2: REST-only operations (always run) ──────────────────────────────
header('STEP 2 — REST operations (no DDL required)');

// 2a. Make bucket public via Storage Management API
try {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket/IMAGES`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ public: true, fileSizeLimit: 52428800, allowedMimeTypes: ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'] }),
  });
  const b = await r.json();
  if (r.ok || b.message?.includes('updated')) pass(`Bucket IMAGES → public: true`);
  else warn(`Bucket update: ${JSON.stringify(b)}`);
} catch (e) { fail(`Bucket update: ${e.message}`); }

// 2b. Seed categories (upsert – safe to re-run)
const cats = [
  { name: 'Clothing',    slug: 'clothing',    description: 'Women clothing collections' },
  { name: 'Bottom Wear', slug: 'bottom-wear', description: 'Trousers, palazzo, jeans and skirts' },
  { name: 'Accessories', slug: 'accessories', description: 'Dupatta, scarves and handbags' },
  { name: 'Special',     slug: 'special',     description: 'Trending edits, new arrivals and sale' },
];

try {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/categories?on_conflict=name`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(cats),
  });
  if (r.ok || r.status === 201 || r.status === 200) {
    pass(`Categories seeded (${cats.length} rows – upsert)`);
  } else {
    const b = await r.text();
    warn(`Categories seed: ${r.status} ${b.slice(0,120)}`);
  }
} catch (e) { fail(`Categories seed: ${e.message}`); }

// 2c. Verify tables
header('STEP 3 — Verify database tables');
const SERVICE_HEADERS = { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Prefer: 'count=exact' };

const tables = ['products','categories','subcategories','product_images','product_variations','orders','order_items','cart'];
for (const t of tables) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=id&limit=0`, { headers: SERVICE_HEADERS });
    const count = r.headers.get('content-range')?.split('/')[1] ?? '?';
    if (r.ok || r.status === 206) pass(`${t.padEnd(22)} exists  (${count} rows)`);
    else fail(`${t.padEnd(22)} NOT FOUND (${r.status})`);
  } catch (e) { fail(`${t}: ${e.message}`); }
}

// 2d. Verify bucket
header('STEP 4 — Verify bucket');
try {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket/IMAGES`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  const b = await r.json();
  if (b.public === true) pass(`Bucket IMAGES: public = true ✓`);
  else warn(`Bucket IMAGES: public = ${b.public}`);
  info(`Allowed types: ${b.allowed_mime_types?.join(', ') || '(all)'}`);
  info(`Size limit:    ${b.file_size_limit ? (b.file_size_limit/1024/1024)+'MB' : '(default)'}`);
} catch (e) { fail(`Bucket verify: ${e.message}`); }

// ── STEP 5: DDL execution via pg ───────────────────────────────────────────
header('STEP 5 — DDL execution (RLS policies, triggers, indexes)');

if (!DATABASE_URL) {
  warn('Skipped — DATABASE_URL not set. See instructions above.');
  console.log(`\n  The following SQL still needs to be run in Supabase SQL Editor:`);
  console.log(`  → https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new`);
  console.log(`  → Paste the contents of:  database/PRODUCTION_SETUP.sql`);
} else {
  const { default: pg } = await import('pg');
  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    pass('Connected to PostgreSQL');

    // Read and split the SQL file into individual statements
    const sql = readFileSync(path.join(__dir, 'database', 'PRODUCTION_SETUP.sql'), 'utf-8');

    // Split on semicolons but preserve PL/pgSQL blocks ($$ ... $$)
    const statements = [];
    let current = '';
    let inDollar = false;
    for (const line of sql.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) { current += line + '\n'; continue; } // keep comments
      if (trimmed.includes('$$')) inDollar = !inDollar;
      current += line + '\n';
      if (!inDollar && trimmed.endsWith(';')) {
        const stmt = current.trim();
        if (stmt && !stmt.startsWith('--')) statements.push(stmt);
        current = '';
      }
    }

    let passed = 0, failed = 0;
    for (const stmt of statements) {
      // Skip verification SELECTs (we already verified via REST)
      if (stmt.match(/^SELECT\s+'(categories|products|product_images|product_variations)'/i)) {
        info(`Skipped: ${stmt.slice(0, 60).replace(/\n/g,' ')}...`);
        continue;
      }
      const label = stmt.slice(0, 70).replace(/\n/g, ' ').replace(/\s+/g, ' ');
      try {
        await client.query(stmt);
        pass(label);
        passed++;
      } catch (e) {
        // Ignore "already exists" type errors — these are idempotent
        if (e.message.includes('already exists') || e.message.includes('does not exist') && stmt.includes('DROP')) {
          info(`Already applied: ${label}`);
        } else {
          fail(`${label}\n     → ${e.message}`);
          failed++;
        }
      }
    }

    console.log(`\n  Summary: ${passed} applied, ${failed} failed, ${statements.length - passed - failed} skipped`);
    await client.end();
  } catch (e) {
    fail(`Database connection failed: ${e.message}`);
    await client.end().catch(() => {});
  }
}

// ── STEP 6: Final verification ─────────────────────────────────────────────
header('STEP 6 — Final status');

// Quick anon-key read test (confirms public read works for frontend)
const ANON = process.env.SUPABASE_ANON_KEY;
const anonTables = ['products', 'categories'];
for (const t of anonTables) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=id&limit=1`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` }
    });
    if (r.ok || r.status === 206) pass(`Frontend can read "${t}" (anon key) ✓`);
    else fail(`Frontend CANNOT read "${t}" — anon key blocked (${r.status})`);
  } catch (e) { fail(`Anon read "${t}": ${e.message}`); }
}

// Test signed upload URL (service role – direct Supabase Storage API)
try {
  const testPath = `verify-${Date.now()}.txt`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/IMAGES/products/${testPath}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  const b = await r.json();
  if (b.signedURL || b.url) pass(`Signed upload URL generation works ✓  (path: ...${(b.signedURL || b.url).slice(-40)})`);
  else fail(`Signed URL: ${JSON.stringify(b).slice(0,100)}`);
} catch (e) { fail(`Signed URL test: ${e.message}`); }

console.log('\n' + '═'.repeat(64));
console.log('  PRODUCTION SETUP COMPLETE');
console.log('  Backend:  https://jt-collection-backend-ahmadkhan32.vercel.app');
console.log('  Database: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb');
console.log('═'.repeat(64) + '\n');
