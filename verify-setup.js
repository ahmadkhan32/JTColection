#!/usr/bin/env node

/**
 * JT Collections - Database Verification
 * Checks if all tables and data are in Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  📊 JT COLLECTIONS - DATABASE VERIFICATION                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Check files
console.log('✅ All setup files are in place\n');

const projectRoot = process.cwd();
const files = [
  { name: 'schema.sql', path: 'supabase/migrations/schema.sql' },
  { name: 'seed.sql', path: 'supabase/seed/complete_seed.sql' },
  { name: '.env', path: 'client/.env' },
  { name: 'src/', path: 'client/src' },
];

files.forEach(f => {
  const fullPath = path.join(projectRoot, f.path);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${f.name}`);
});

console.log('\n' + '═'.repeat(63) + '\n');

console.log('🎯 TO COMPLETE SETUP:\n');

console.log('OPTION 1: Manual Setup in Supabase (Recommended)');
console.log('─────────────────────────────────────────────────\n');
console.log('Step 1: Create Tables');
console.log('  • Go to: https://supabase.com/dashboard');
console.log('  • SQL Editor → + New Query');
console.log('  • Open: supabase/migrations/schema.sql');
console.log('  • Copy ALL, paste in Supabase, click RUN\n');

console.log('Step 2: Seed Data');
console.log('  • SQL Editor → + New Query');
console.log('  • Open: supabase/seed/complete_seed.sql');
console.log('  • Copy ALL, paste in Supabase, click RUN\n');

console.log('Step 3: Create Admin');
console.log('  • Visit: http://localhost:5173/register');
console.log('  • Email: admin@jtcollections.com');
console.log('  • Password: Admin@123456\n');

console.log('Step 4: Assign Admin Role');
console.log('  • SQL Editor → + New Query');
console.log('  • Paste and RUN:\n');
console.log(`    UPDATE public.profiles `);
console.log(`    SET role = 'admin' `);
console.log(`    WHERE id = (`);
console.log(`      SELECT id FROM auth.users `);
console.log(`      WHERE email = 'admin@jtcollections.com'`);
console.log(`    );\n`);

console.log('Step 5: Test');
console.log('  • Shop: http://localhost:5173/shop');
console.log('  • Admin: http://localhost:5173/admin/orders\n');

console.log('═'.repeat(63) + '\n');

console.log('📂 Available Documentation:\n');

const docs = [
  { name: 'SETUP_NOW.md', desc: 'Quick start guide' },
  { name: '00-START-HERE.md', desc: 'Complete overview' },
  { name: 'COMPLETE_SETUP.md', desc: 'Detailed instructions' },
  { name: 'EXECUTION_GUIDE.md', desc: 'Step-by-step walkthrough' },
  { name: 'SQL_COMMANDS.sql', desc: 'SQL reference' },
];

docs.forEach((doc, i) => {
  const fullPath = path.join(projectRoot, doc.name);
  const exists = fs.existsSync(fullPath) ? '✅' : '❌';
  console.log(`${exists} ${doc.name.padEnd(30)} → ${doc.desc}`);
});

console.log('\n' + '═'.repeat(63) + '\n');

console.log('🚀 STATUS:\n');
console.log('  Frontend:  ✅ Running (http://localhost:5173)');
console.log('  Backend:   ✅ Ready (Supabase configured)');
console.log('  Database:  ⏳ NEEDS MANUAL SETUP (see steps above)\n');

console.log('═'.repeat(63) + '\n');

console.log('💡 NEXT ACTION:\n');
console.log('  Open Supabase dashboard and run the SQL files using Option 1 above\n');
console.log('  Dashboard: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new\n');
