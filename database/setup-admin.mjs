/**
 * Creates (or fixes) the admin Supabase account and verifies the backend login.
 * Run: node database/setup-admin.mjs
 */

const SK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.RgreSxvDf5TA-2eH8dGDYiKY3deOqZWspR0Yb9Wsyg0';
const BASE = 'https://xmssdsjhinitkykdpatb.supabase.co';
const ADMIN_EMAIL = 'admin@jtcollections.com';
const ADMIN_PASS  = 'Admin@123456';
const H = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' };

async function api(url, method = 'GET', body, extraHeaders = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...H, ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// 1. Find existing auth user
const { data: list } = await api(`${BASE}/auth/v1/admin/users?per_page=100`);
const existing = list?.users?.find(u => u.email === ADMIN_EMAIL);

let userId;
if (existing) {
  userId = existing.id;
  const r = await api(`${BASE}/auth/v1/admin/users/${userId}`, 'PUT', { password: ADMIN_PASS, email_confirm: true });
  console.log(`✅ Auth user exists (${userId}) — password reset, email confirmed: ${r.ok}`);
} else {
  const r = await api(`${BASE}/auth/v1/admin/users`, 'POST', { email: ADMIN_EMAIL, password: ADMIN_PASS, email_confirm: true });
  if (!r.ok) { console.error('❌ Failed to create auth user:', r.data); process.exit(1); }
  userId = r.data.id;
  console.log(`✅ Auth user created: ${userId}`);
}

// 2. Force-update role in users table via PATCH
const ur = await api(`${BASE}/rest/v1/users?id=eq.${userId}`, 'PATCH',
  { role: 'admin', name: 'JT Admin' },
  { Prefer: 'return=minimal' }
);
console.log(`✅ users table role=admin: ${ur.ok ? 'OK' : JSON.stringify(ur.data)}`);

// 3. Force-update role in profiles table via PATCH
const pr = await api(`${BASE}/rest/v1/profiles?id=eq.${userId}`, 'PATCH',
  { role: 'admin', full_name: 'JT Admin' },
  { Prefer: 'return=minimal' }
);
console.log(`✅ profiles table role=admin: ${pr.ok ? 'OK' : JSON.stringify(pr.data)}`);

// 4. Test backend login
const lr = await api('http://localhost:3001/api/auth/login', 'POST', { email: ADMIN_EMAIL, password: ADMIN_PASS });
if (lr.ok) {
  const role = lr.data?.user?.role;
  console.log(`✅ Backend login OK → role=${role} → redirects to ${role === 'admin' ? '/admin/dashboard' : '/shop'}`);
} else {
  console.error('❌ Backend login failed:', lr.data);
}
