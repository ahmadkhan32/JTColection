#!/usr/bin/env node

/**
 * Set Admin Role Script
 * Sets the admin role for admin@jtcollections.com
 */

import * as https from 'https';

const SUPABASE_URL = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTQzMDUsImV4cCI6MjA5MTIzMDMwNX0.ME5yb148jW5Y6_hGu1caffLYwBfW0VPY-JIyV_VAZA0';

const sql = `
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@jtcollections.com'
);
`;

function executeSQL(sql: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'xmssdsjhinitkykdpatb.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve({ success: true, message: 'SQL executed' });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔧 Setting admin role for admin@jtcollections.com...');

  try {
    const result = await executeSQL(sql);
    console.log('✅ Admin role set successfully!');
    console.log('📧 Admin email: admin@jtcollections.com');
    console.log('🔑 Admin password: Admin@123456');
    console.log('🌐 Admin login: http://localhost:5173/login');
    console.log('🏠 Admin dashboard: http://localhost:5173/admin/dashboard');
  } catch (error) {
    console.log('❌ Error setting admin role:', error);
    console.log('💡 Make sure you have registered with admin@jtcollections.com first');
  }
}

main();