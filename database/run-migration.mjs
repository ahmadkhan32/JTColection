import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.cQiOgfLXi3_8X1KrYvG2qILqQ8KBKm9Y3yZ5PQR8xOg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Running migration: fixing orders table...');

  // Step 1: Drop NOT NULL on user_id via raw SQL endpoint
  const ddlStatements = [
    'ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL',
    "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email text",
    "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postal_code text DEFAULT ''",
    "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'COD'",
    "ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'",
  ];

  for (const sql of ddlStatements) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({ query: sql })
    });
    console.log(`  > ${sql.substring(0, 60)}...  status: ${res.status}`);
  }

  // Step 2: Insert test orders
  console.log('\nInserting 10 test orders...');
  const orders = [
    { customer_name: 'Ahmed Khan',    phone: '+923001234567', email: 'ahmed@example.com',   address: 'House 123, Main Street',        city: 'Lahore',     postal_code: '54000', total_amount: 250.00,  status: 'pending',    payment_method: 'COD',          payment_status: 'pending' },
    { customer_name: 'Fatima Ali',    phone: '+923004567890', email: 'fatima@example.com',  address: 'Apartment 5B, Park Road',       city: 'Karachi',    postal_code: '75500', total_amount: 395.00,  status: 'processing', payment_method: 'COD',          payment_status: 'paid' },
    { customer_name: 'Hassan Raza',   phone: '+923109876543', email: 'hassan@example.com',  address: 'Office 201, Business Hub',      city: 'Islamabad',  postal_code: '44000', total_amount: 520.00,  status: 'shipped',    payment_method: 'Card Payment', payment_status: 'paid' },
    { customer_name: 'Sara Khan',     phone: '+923155555555', email: 'sara@example.com',    address: 'Villa 45, Defence Road',        city: 'Lahore',     postal_code: '54792', total_amount: 180.50,  status: 'delivered',  payment_method: 'Card Payment', payment_status: 'paid' },
    { customer_name: 'Muhammad Ali',  phone: '+923201234567', email: 'malik@example.com',   address: 'Apt 12A, Tower B',              city: 'Karachi',    postal_code: '75600', total_amount: 675.00,  status: 'pending',    payment_method: 'COD',          payment_status: 'pending' },
    { customer_name: 'Aisha Malik',   phone: '+923335555555', email: 'aisha@example.com',   address: 'House 7, Garden Street',        city: 'Islamabad',  postal_code: '44050', total_amount: 420.75,  status: 'processing', payment_method: 'Card Payment', payment_status: 'paid' },
    { customer_name: 'Hassan Ahmed',  phone: '+923456666666', email: 'hbahmed@example.com', address: 'Block 5, New Town',             city: 'Faisalabad', postal_code: '38000', total_amount: 310.00,  status: 'shipped',    payment_method: 'COD',          payment_status: 'pending' },
    { customer_name: 'Zainab Hassan', phone: '+923167777777', email: 'zainab@example.com',  address: 'Street 123, Model Town',        city: 'Lahore',     postal_code: '54000', total_amount: 895.50,  status: 'delivered',  payment_method: 'Card Payment', payment_status: 'paid' },
    { customer_name: 'Khalid Ahmed',  phone: '+923298888888', email: 'khalid@example.com',  address: 'Flat 4, Green Centre',          city: 'Karachi',    postal_code: '75270', total_amount: 545.00,  status: 'pending',    payment_method: 'COD',          payment_status: 'pending' },
    { customer_name: 'Mariam Khan',   phone: '+923019999999', email: 'mariam@example.com',  address: 'Res 456, Bahria Town',          city: 'Rawalpindi', postal_code: '46000', total_amount: 720.00,  status: 'shipped',    payment_method: 'Card Payment', payment_status: 'paid' },
  ];

  const { data, error } = await supabase.from('orders').insert(orders).select('id, customer_name, status');

  if (error) {
    console.error('Insert error:', error.message);
    console.error('Hint:', error.hint || error.details);
  } else {
    console.log(`\n✅ Inserted ${data.length} orders:`);
    data.forEach(o => console.log(`   - ${o.customer_name} (${o.status}) [${o.id.slice(0,8)}]`));
  }
}

main().catch(console.error);
