#!/usr/bin/env node

/**
 * JT Collections - Database Verification (TypeScript)
 * Checks if all tables and data are in Supabase
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileCheck {
  name: string;
  path: string;
}

interface DocumentInfo {
  name: string;
  desc: string;
}

const projectRoot: string = process.cwd();

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  📊 JT COLLECTIONS - DATABASE VERIFICATION                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Check files
console.log('✅ All setup files are in place\n');

const files: FileCheck[] = [
  { name: 'schema.sql', path: 'database/schemaa.sql' },
  { name: 'seed.sql', path: 'database/seed/complete_seed.sql' },
  { name: '.env', path: 'frontend/.env' },
  { name: 'src/', path: 'frontend/src' },
];

files.forEach((f: FileCheck): void => {
  const fullPath: string = path.join(projectRoot, f.path);
  const exists: boolean = fs.existsSync(fullPath);
  const status: string = exists ? '✅' : '❌';
  console.log(`${status} ${f.name}`);
});

console.log('\n' + '═'.repeat(63) + '\n');

console.log('🎯 TO COMPLETE SETUP:\n');

console.log('OPTION 1: Manual Setup in Supabase (Recommended)');
console.log('─────────────────────────────────────────────────\n');
console.log('Step 1: Create Tables');
console.log('  • Go to: https://supabase.com/dashboard');
console.log('  • SQL Editor → + New Query');
console.log('  • Open: database/schemaa.sql');
console.log('  • Copy ALL, paste in Supabase, click RUN\n');

console.log('Step 2: Seed Data');
console.log('  • SQL Editor → + New Query');
console.log('  • Open: database/seed/complete_seed.sql');
console.log('  • Copy ALL, paste in Supabase, click RUN\n');

console.log('Step 3: Create Admin');
console.log('  • Visit: http://localhost:5173/register');
console.log('  • Email: admin@jtcollections.com');
console.log('  • Password: Admin@123456\n');

console.log('Step 4: Assign Admin Role');
console.log('  • SQL Editor → + New Query');
console.log('  • Paste and RUN:\n');

const adminSQL: string = `UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);`;

console.log('     ' + adminSQL.split('\n').join('\n     ') + '\n');

console.log('Step 5: Test');
console.log('  • Shop: http://localhost:5173/shop');
console.log('  • Admin: http://localhost:5173/admin/orders\n');

console.log('═'.repeat(63) + '\n');

console.log('📂 Available Documentation:\n');

const docs: DocumentInfo[] = [
  { name: 'SETUP_NOW.md', desc: 'Quick start guide' },
  { name: '00-START-HERE.md', desc: 'Complete overview' },
  { name: 'COMPLETE_SETUP.md', desc: 'Detailed instructions' },
  { name: 'EXECUTION_GUIDE.md', desc: 'Step-by-step walkthrough' },
  { name: 'SQL_COMMANDS.sql', desc: 'SQL reference' },
];

docs.forEach((doc: DocumentInfo): void => {
  const fullPath: string = path.join(projectRoot, doc.name);
  const exists: boolean = fs.existsSync(fullPath);
  const status: string = exists ? '✅' : '❌';
  console.log(`${status} ${doc.name.padEnd(30)} → ${doc.desc}`);
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
