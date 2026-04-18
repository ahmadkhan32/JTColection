/**
 * Run this script to create the shipping and returns tables in Supabase.
 * Usage: node backend/scripts/setup-shipping-returns.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.RgreSxvDf5TA-2eH8dGDYiKY3deOqZWspR0Yb9Wsyg0';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Execute raw SQL via postgres function ─────────────────────────────────────
async function sql(statement, label) {
  console.log(`\n▶  ${label}`);
  const { error } = await supabase.rpc('exec_sql', { sql: statement }).single();
  if (error) {
    // Try the direct query approach as fallback
    console.warn(`   RPC not available, trying query: ${error.message}`);
    return false;
  }
  console.log(`   ✓ Done`);
  return true;
}

// ── Verify a table exists by querying it ──────────────────────────────────────
async function tableExists(name) {
  const { error } = await supabase.from(name).select('id').limit(1);
  // If error contains "relation" it means table doesn't exist
  if (error && error.message.toLowerCase().includes('relation')) return false;
  if (error && error.code === 'PGRST200') return false;
  return true;
}

async function main() {
  console.log('=== SHIPPING & RETURNS TABLE SETUP ===\n');

  // Check if tables already exist
  const shippingOk = await tableExists('shipping');
  const returnsOk  = await tableExists('returns');

  if (shippingOk && returnsOk) {
    console.log('✅ Both tables already exist — nothing to do!');
    console.log('\n   shipping table: OK');
    console.log('   returns  table: OK');
    process.exit(0);
  }

  console.log(`shipping table: ${shippingOk ? '✓ exists' : '✗ MISSING'}`);
  console.log(`returns  table: ${returnsOk  ? '✓ exists' : '✗ MISSING'}`);

  console.log('\n─────────────────────────────────────────────────────────');
  console.log('The tables could not be created automatically because');
  console.log('Supabase does not allow direct DDL via the JS client.');
  console.log('');
  console.log('ACTION REQUIRED:');
  console.log('1. Open https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb');
  console.log('2. Go to SQL Editor (left sidebar)');
  console.log('3. Click "+ New query"');
  console.log('4. Paste the SQL below and click RUN');
  console.log('─────────────────────────────────────────────────────────\n');

  console.log(`-- =====================================================
-- PASTE THIS ENTIRE BLOCK IN SUPABASE SQL EDITOR
-- =====================================================

CREATE TABLE IF NOT EXISTS shipping (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        uuid,
  user_id         uuid,
  address         text        NOT NULL,
  city            text        NOT NULL,
  country         text        NOT NULL DEFAULT 'Pakistan',
  postal_code     text,
  shipping_method text        NOT NULL DEFAULT 'standard',
  status          text        NOT NULL DEFAULT 'processing',
  tracking_number text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS returns (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid,
  user_id       uuid,
  reason        text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending',
  refund_status text        NOT NULL DEFAULT 'not_processed',
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_shipping_all" ON shipping;
DROP POLICY IF EXISTS "service_role_returns_all"  ON returns;

CREATE POLICY "service_role_shipping_all" ON shipping USING (true) WITH CHECK (true);
CREATE POLICY "service_role_returns_all"  ON returns  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shipping_order_id ON shipping (order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_user_id  ON shipping (user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id  ON returns  (order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id   ON returns  (user_id);

SELECT 'Tables created successfully' AS result;
`);

  process.exit(1);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
