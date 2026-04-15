#!/usr/bin/env node

/**
 * JT Collections - Database Setup Guide (TypeScript)
 * This script verifies your setup and provides copy-paste SQL for Supabase
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRoot: string = process.cwd();
const schemaPath: string = path.join(projectRoot, 'database/schemaa.sql');
const seedPath: string = path.join(projectRoot, 'database/seed/complete_seed.sql');
const envPath: string = path.join(projectRoot, 'frontend/.env');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🚀 JT COLLECTIONS - DATABASE SETUP GUIDE                     ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📋 Verifying setup files...\n');

let allFilesExist: boolean = true;

if (fs.existsSync(schemaPath)) {
  const size: number = fs.statSync(schemaPath).size;
  console.log(`  ✅ schema.sql (${(size / 1024).toFixed(1)} KB)`);
} else {
  console.log(`  ❌ schema.sql NOT FOUND`);
  allFilesExist = false;
}

if (fs.existsSync(seedPath)) {
  const size: number = fs.statSync(seedPath).size;
  console.log(`  ✅ complete_seed.sql (${(size / 1024).toFixed(1)} KB)`);
} else {
  console.log(`  ❌ complete_seed.sql NOT FOUND`);
  allFilesExist = false;
}

if (fs.existsSync(envPath)) {
  console.log(`  ✅ .env configured`);
  const envContent: string = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('VITE_SUPABASE_URL')) {
    console.log(`  ✅ Supabase credentials present`);
  }
} else {
  console.log(`  ❌ .env NOT FOUND`);
  allFilesExist = false;
}

if (!allFilesExist) {
  console.log('\n❌ Some files are missing. Please check your setup.\n');
  process.exit(1);
}

console.log('\n✅ All files verified!\n');

// Count SQL statements
const schema: string = fs.readFileSync(schemaPath, 'utf-8');
const seed: string = fs.readFileSync(seedPath, 'utf-8');

const schemaStatements: number = schema.split(';').filter((s: string) => s.trim() && !s.trim().startsWith('--')).length;
const seedStatements: number = seed.split(';').filter((s: string) => s.trim() && !s.trim().startsWith('--')).length;

console.log('📊 SQL Files Summary:');
console.log(`  Schema: ${schemaStatements} statements`);
console.log(`  Seed:   ${seedStatements} statements\n`);

console.log('════════════════════════════════════════════════════════════════\n');
console.log('🎯 SETUP INSTRUCTIONS (3 STEPS - 10 MINUTES)\n');

console.log('STEP 1️⃣: Create Database Tables');
console.log('─────────────────────────────────');
console.log('  1. Go to: https://supabase.com/dashboard');
console.log('  2. Select: xmssdsjhinitkykdpatb project');
console.log('  3. Click: SQL Editor (left sidebar)');
console.log('  4. Click: + New Query');
console.log('  5. Copy ALL content from: database/schemaa.sql');
console.log('  6. Paste into SQL Editor');
console.log('  7. Click: RUN ✅\n');

console.log('STEP 2️⃣: Seed Data (Categories & Products)');
console.log('───────────────────────────────────────────');
console.log('  1. Click: + New Query (in SQL Editor)');
console.log('  2. Copy ALL content from: database/seed/complete_seed.sql');
console.log('  3. Paste into SQL Editor');
console.log('  4. Click: RUN ✅\n');

console.log('STEP 3️⃣: Create Admin Account');
console.log('─────────────────────────────');
console.log('  1. Visit: http://localhost:5173/register');
console.log('  2. Email: admin@jtcollections.com');
console.log('  3. Password: Admin@123456');
console.log('  4. Click: Sign Up ✅\n');

console.log('ADMIN ROLE (After Step 3):');
console.log('─────────────────────────');
console.log('  1. Go to Supabase SQL Editor');
console.log('  2. Click: + New Query');
console.log('  3. Paste and RUN:\n');

const adminSQL: string = `UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jtcollections.com'
);`;

console.log('     ' + adminSQL.split('\n').join('\n     ') + '\n');

console.log('════════════════════════════════════════════════════════════════\n');

console.log('✅ DONE! Your setup is ready.\n');

console.log('🚀 NEXT STEPS:');
console.log('  1. Follow the 3 steps above');
console.log('  2. Visit: http://localhost:5173/shop');
console.log('  3. Add products to cart');
console.log('  4. Checkout');
console.log('  5. Go to: http://localhost:5173/admin/orders');
console.log('  6. See your order!\n');

console.log('📱 KEY LINKS:');
console.log('  Shop:     http://localhost:5173/shop');
console.log('  Admin:    http://localhost:5173/admin/orders');
console.log('  Register: http://localhost:5173/register');
console.log('  Supabase: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql\n');

console.log('💡 TIPS:');
console.log('  • If a statement fails with "already exists", that\'s OK!');
console.log('  • All SQL uses IF NOT EXISTS so it won\'t duplicate');
console.log('  • Run the entire file, errors for existing items are normal\n');

console.log('════════════════════════════════════════════════════════════════\n');
console.log('📄 Other guides:');
console.log('  - SETUP_NOW.md ..................... Quick start');
console.log('  - 00-START-HERE.md ................ Overview');
console.log('  - COMPLETE_SETUP.md .............. Detailed instructions');
console.log('  - EXECUTION_GUIDE.md ............. Step-by-step');
console.log('  - SQL_COMMANDS.sql ............... Copy-paste reference\n');

console.log('Ready? Go to Supabase SQL Editor and paste the SQL files! 🚀\n');
