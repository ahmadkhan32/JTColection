import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.RgreSxvDf5TA-2eH8dGDYiKY3deOqZWspR0Yb9Wsyg0';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  console.log('=== ORDER MIGRATION ===');

  console.log('Skipping DDL alters (run SQL in Supabase dashboard if needed).');

  // Step 2: Verify orders table is reachable
  const { data: sample, error: sampleErr } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at')
    .limit(3);

  if (sampleErr) {
    console.error('Cannot read orders table:', sampleErr.message);
    process.exit(1);
  }
  console.log(`Orders table OK — ${sample?.length ?? 0} sample rows read`);

  // Step 3: Seed 10 test orders with varied statuses
  console.log('\nSeeding test orders...');

  const testOrders = [
    { customer_name: 'Ayesha Khan',    email: 'ayesha@test.com',  phone: '0321-1234567', address: '12 Main Blvd',  city: 'Lahore',    postal_code: '54000', total_amount: 3500,  status: 'pending',    payment_method: 'COD',    payment_status: 'pending' },
    { customer_name: 'Sara Ahmed',     email: 'sara@test.com',    phone: '0300-9876543', address: '7 Garden Rd',   city: 'Karachi',   postal_code: '75500', total_amount: 7200,  status: 'confirmed',  payment_method: 'COD',    payment_status: 'pending' },
    { customer_name: 'Fatima Malik',   email: 'fatima@test.com',  phone: '0333-5551234', address: '3 Blue St',     city: 'Islamabad', postal_code: '44000', total_amount: 5800,  status: 'processing', payment_method: 'Online', payment_status: 'paid'    },
    { customer_name: 'Zainab Ali',     email: 'zainab@test.com',  phone: '0345-7778888', address: '88 Rose Ave',   city: 'Faisalabad', postal_code: '38000', total_amount: 2900, status: 'shipped',    payment_method: 'COD',    payment_status: 'pending' },
    { customer_name: 'Nadia Hassan',   email: 'nadia@test.com',   phone: '0312-4445566', address: '22 Park Lane',  city: 'Multan',    postal_code: '60000', total_amount: 6100,  status: 'delivered',  payment_method: 'Online', payment_status: 'paid'    },
    { customer_name: 'Hina Sheikh',    email: 'hina@test.com',    phone: '0316-2223344', address: '5 Canal View',  city: 'Lahore',    postal_code: '54000', total_amount: 4400,  status: 'delivered',  payment_method: 'COD',    payment_status: 'paid'    },
    { customer_name: 'Maryam Baig',    email: 'maryam@test.com',  phone: '0311-6667778', address: '9 Clifton Blk', city: 'Karachi',   postal_code: '75600', total_amount: 9800,  status: 'cancelled',  payment_method: 'Online', payment_status: 'pending' },
    { customer_name: 'Sana Javed',     email: 'sana@test.com',    phone: '0341-8889990', address: '44 F-7 Sector', city: 'Islamabad', postal_code: '44000', total_amount: 3200,  status: 'pending',    payment_method: 'COD',    payment_status: 'pending' },
    { customer_name: 'Rabia Iqbal',    email: 'rabia@test.com',   phone: '0331-0001112', address: '17 Model Town', city: 'Lahore',    postal_code: '54000', total_amount: 8500,  status: 'processing', payment_method: 'Online', payment_status: 'paid'    },
    { customer_name: 'Amna Tariq',     email: 'amna@test.com',    phone: '0323-3334445', address: '2 Shadman St',  city: 'Lahore',    postal_code: '54000', total_amount: 4750,  status: 'shipped',    payment_method: 'COD',    payment_status: 'pending' },
  ];

  let inserted = 0;
  for (const order of testOrders) {
    const { error } = await supabase.from('orders').insert(order);
    if (error) {
      console.warn(`  SKIP ${order.customer_name}: ${error.message}`);
    } else {
      inserted++;
      console.log(`  + ${order.customer_name} [${order.status}] $${order.total_amount}`);
    }
  }

  console.log(`\nSeeded ${inserted}/${testOrders.length} test orders`);

  // Step 4: Print final stats
  const { data: all } = await supabase.from('orders').select('status, total_amount');
  if (all) {
    const stats = {
      total:      all.length,
      pending:    all.filter(o => o.status === 'pending').length,
      confirmed:  all.filter(o => o.status === 'confirmed').length,
      processing: all.filter(o => o.status === 'processing').length,
      shipped:    all.filter(o => o.status === 'shipped').length,
      delivered:  all.filter(o => o.status === 'delivered').length,
      cancelled:  all.filter(o => o.status === 'cancelled').length,
      revenue:    all.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0),
    };
    console.log('\n=== FINAL ORDER STATS ===');
    console.table(stats);
  }

  console.log('\nDone! Run your servers:');
  console.log('  Backend:  npm run dev (in /backend)');
  console.log('  Frontend: npm run dev (in /frontend)');
}

run().catch(e => { console.error(e); process.exit(1); });
