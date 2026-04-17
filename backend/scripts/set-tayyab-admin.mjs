import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xmssdsjhinitkykdpatb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.HKoJzX_NxIbj7jPvnGEqVHRUdaZMBqEhzm1_2gJmVHk'
);

const TARGET_EMAIL = 'tayyabjavaid71@gmail.com';

const { data, error } = await supabase.auth.admin.listUsers();
if (error) { console.error('listUsers error:', error.message); process.exit(1); }

const user = data.users.find(u => u.email === TARGET_EMAIL);
if (!user) {
  console.log(`"${TARGET_EMAIL}" not found in Supabase Auth.`);
  console.log('They need to sign up first at /register, then re-run this script.');
  process.exit(0);
}

console.log('Found user:', user.id, user.email);

const { error: upsertErr } = await supabase
  .from('profiles')
  .upsert({ id: user.id, role: 'admin' }, { onConflict: 'id' });

if (upsertErr) { console.error('Upsert error:', upsertErr.message); process.exit(1); }

console.log(`SUCCESS: "${TARGET_EMAIL}" is now role=admin`);
console.log('They can now log in at /login and will be redirected to /admin/dashboard');
