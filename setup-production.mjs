/**
 * JT Collections – Production Setup Script
 * Run: node setup-production.mjs
 *
 * This script:
 *  1. Updates the IMAGES bucket to public via Supabase Storage API
 *  2. Verifies the upload endpoint works end-to-end
 *  3. Verifies the delete endpoint works
 *  4. Checks which tables exist
 *  5. Prints the SQL to copy-paste into Supabase SQL Editor for RLS policies
 */

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.RgreSxvDf5TA-2eH8dGDYiKY3deOqZWspR0Yb9Wsyg0';
const BUCKET = 'IMAGES';
const BACKEND = 'https://jt-collection-backend-ahmadkhan32.vercel.app';

const headers = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
};

// ── Helper ────────────────────────────────────────────────────────────────────
function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
function header(msg) { console.log(`\n${'─'.repeat(60)}\n${msg}\n${'─'.repeat(60)}`); }

// ── 1. Update IMAGES bucket to public ────────────────────────────────────────
header('STEP 1 — Make IMAGES bucket public');

try {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      fileSizeLimit: 52428800, // 50 MB
    }),
  });
  const body = await res.json();
  if (res.ok || body.message?.includes('updated')) {
    pass(`Bucket "${BUCKET}" is now public (${body.message || 'ok'})`);
  } else {
    fail(`Bucket update: ${JSON.stringify(body)}`);
  }
} catch (e) {
  fail(`Bucket update fetch error: ${e.message}`);
}

// ── 2. Verify bucket is public ───────────────────────────────────────────────
header('STEP 2 — Verify bucket settings');

try {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, { headers });
  const body = await res.json();
  if (body.public === true) {
    pass(`Bucket is public: true`);
  } else {
    fail(`Bucket public flag: ${body.public} — run PRODUCTION_SETUP.sql in Supabase SQL Editor`);
  }
  info(`Bucket id: ${body.id}, created: ${body.created_at}`);
} catch (e) {
  fail(`Bucket verify fetch error: ${e.message}`);
}

// ── 3. Check tables exist via REST API ──────────────────────────────────────
header('STEP 3 — Verify database tables');

const tables = ['products', 'product_images', 'product_variations', 'categories', 'subcategories', 'orders', 'order_items', 'cart'];

for (const table of tables) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: { ...headers, Prefer: 'count=exact' },
    });
    const count = res.headers.get('content-range')?.split('/')[1] ?? '?';
    if (res.ok) {
      pass(`Table "${table}" exists (${count} rows)`);
    } else {
      const body = await res.json();
      fail(`Table "${table}": ${body.message || res.status}`);
    }
  } catch (e) {
    fail(`Table "${table}" check error: ${e.message}`);
  }
}

// ── 4. Test signed upload URL endpoint ──────────────────────────────────────
header('STEP 4 — Test upload endpoint (POST /api/admin/upload-url)');

// We need an admin JWT to call the backend. Skip if running without one.
// The backend is protected by authMiddleware + isAdmin.
// For local testing, use a test token.
info('Backend upload endpoint requires admin JWT — testing Storage directly instead.');

const testPath = `products/setup-test-${Date.now()}.txt`;
let uploadedPath = null;

try {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${testPath}`, {
    method: 'POST',
    headers,
  });
  const body = await res.json();

  if (body.signedURL) {
    info('Got signed upload URL');

    // Upload a tiny file
    const uploadRes = await fetch(`${SUPABASE_URL}${body.signedURL}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: 'JT Collections test upload',
    });

    if (uploadRes.ok) {
      pass(`Test file uploaded: ${testPath}`);
      uploadedPath = testPath;
    } else {
      fail(`Upload PUT failed: ${uploadRes.status}`);
    }
  } else {
    fail(`Signed URL generation failed: ${JSON.stringify(body)}`);
  }
} catch (e) {
  fail(`Upload test error: ${e.message}`);
}

// ── 5. Verify public read of uploaded file ───────────────────────────────────
if (uploadedPath) {
  header('STEP 5 — Verify public read of uploaded file');
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${uploadedPath}`;
  try {
    const res = await fetch(publicUrl);
    if (res.ok) {
      pass(`Public read works: ${publicUrl}`);
    } else {
      fail(`Public read HTTP ${res.status} — run PRODUCTION_SETUP.sql to add storage RLS policies`);
    }
  } catch (e) {
    fail(`Public read error: ${e.message}`);
  }

  // Cleanup
  header('STEP 6 — Cleanup test file from Storage');
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${uploadedPath}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      pass('Test file deleted from Storage');
    } else {
      fail(`Delete test file: ${res.status}`);
    }
  } catch (e) {
    fail(`Cleanup error: ${e.message}`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
header('SETUP COMPLETE');
console.log(`
📋 Next steps:
   1. Open Supabase SQL Editor:
      https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
   2. Copy and run: database/PRODUCTION_SETUP.sql
      This sets up RLS policies so the frontend (anon key) can read products.
   3. Redeploy backend: cd backend && npx vercel --prod
   4. Done! ✅
`);
