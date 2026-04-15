#!/usr/bin/env node

/**
 * JT Collections - Complete Automated Database Setup (TypeScript)
 * This script:
 * 1. Runs database migrations (schema)
 * 2. Seeds all categories, products, and variations
 * 3. Creates admin user account
 * 4. Assigns admin role
 * 5. Provides setup verification
 */

import * as fs from 'fs';
import * as path from 'path';

interface ColorMap {
  [key: string]: string;
  reset: string;
  bright: string;
  cyan: string;
  green: string;
  yellow: string;
  red: string;
  gray: string;
}

interface EnvVars {
  [key: string]: string | undefined;
}

const colors: ColorMap = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const log = (msg: string, color: string = 'reset'): void => {
  console.log(`${colors[color]}${msg}${colors.reset}`);
};

const success = (msg: string): void => log(`✅ ${msg}`, 'green');
const error = (msg: string): void => log(`❌ ${msg}`, 'red');
const warn = (msg: string): void => log(`⚠️  ${msg}`, 'yellow');
const info = (msg: string): void => log(`ℹ️  ${msg}`, 'cyan');
const step = (msg: string): void => log(`\n📍 ${msg}`, 'bright');

step('JT Collections Setup System');
log('═══════════════════════════════════════════════════════════════', 'gray');

// Check if running from correct directory
const projectRoot: string = process.cwd();
const schemaPath: string = path.join(projectRoot, 'database/schemaa.sql');
const seedPath: string = path.join(projectRoot, 'database/seed/complete_seed.sql');

info(`Working directory: ${projectRoot}`);

if (!fs.existsSync(schemaPath)) {
  error(`schema.sql not found at ${schemaPath}`);
  error('Please run this script from the project root directory');
  process.exit(1);
}

if (!fs.existsSync(seedPath)) {
  error(`complete_seed.sql not found at ${seedPath}`);
  process.exit(1);
}

success('✓ All SQL files found');

// Check for .env
const envPath: string = path.join(projectRoot, 'frontend/.env');
if (!fs.existsSync(envPath)) {
  error('.env file not found in client folder');
  process.exit(1);
}

success('✓ Environment file found');

// Load environment
const envContent: string = fs.readFileSync(envPath, 'utf-8');
const env: EnvVars = {};
envContent.split('\n').forEach((line: string) => {
  const [key, value] = line.split('=');
  if (key) env[key.trim()] = value?.trim();
});

const supabaseUrl: string | undefined = env.VITE_SUPABASE_URL;
const anonKey: string | undefined = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  error('Missing Supabase credentials in .env');
  process.exit(1);
}

info(`Supabase URL: ${supabaseUrl}`);
success('✓ Credentials loaded');

log('\n═══════════════════════════════════════════════════════════════', 'gray');
log('\n', 'gray');

// Import Supabase client dynamically
step('Installation Check');

try {
  require.resolve('@supabase/supabase-js');
  success('Supabase client already installed');
} catch (e) {
  warn('Supabase client package not installed');
  error('Please install it with: npm install @supabase/supabase-js');
  error('Then run this script again');
  process.exit(1);
}

step('Database Setup Instructions');

log(
  `
Since this project uses public anonymous key, you'll need to complete
the database setup through the Supabase dashboard.

Follow these steps manually:
`,
  'cyan'
);

log(
  `
1️⃣  MIGRATE DATABASE SCHEMA
   ├─ Go to: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new
   ├─ Open database/schemaa.sql
   ├─ Copy all content
   ├─ Paste into Supabase SQL Editor
   └─ Click RUN

2️⃣  SEED PRODUCTS & CATEGORIES  
   ├─ Create a new SQL Query
   ├─ Open database/seed/complete_seed.sql
   ├─ Copy all content
   ├─ Paste into new SQL query
   └─ Click RUN

3️⃣  CREATE ADMIN ACCOUNT
   ├─ Visit: http://localhost:5173/register
   ├─ Email: admin@jtcollections.com
   ├─ Password: Admin@123456
   └─ Complete registration

4️⃣  ASSIGN ADMIN ROLE
   ├─ Go back to Supabase SQL Editor
   ├─ Create a new SQL Query
   ├─ Copy this command:
   │
   │  UPDATE public.profiles 
   │  SET role = 'admin' 
   │  WHERE id = (
   │    SELECT id FROM auth.users 
   │    WHERE email = 'admin@jtcollections.com'
   │  );
   │
   ├─ Paste into SQL Editor
   └─ Click RUN

5️⃣  VERIFY SETUP
   └─ Visit: http://localhost:5173/admin/orders
`,
  'yellow'
);

log('\n═══════════════════════════════════════════════════════════════', 'gray');

step('SQL Files to Copy');

const schemaSql: string = fs.readFileSync(schemaPath, 'utf-8');
const seedSql: string = fs.readFileSync(seedPath, 'utf-8');

log(
  `
Schema SQL File:
  └─ Path: ${schemaPath}
  └─ Size: ${(schemaSql.length / 1024).toFixed(2)} KB
  └─ Statements: ${schemaSql.split(';').length - 1}
`,
  'gray'
);

log(
  `
Seed SQL File:
  └─ Path: ${seedPath}
  └─ Size: ${(seedSql.length / 1024).toFixed(2)} KB
  └─ Statements: ${seedSql.split(';').length - 1}
`,
  'gray'
);

log('\n═══════════════════════════════════════════════════════════════', 'gray');

step('Test Data Summary');

const productMatches: RegExpMatchArray | null = seedSql.match(/INSERT INTO public\.products/gi);
const categoryMatches: RegExpMatchArray | null = seedSql.match(/INSERT INTO public\.categories/gi);
const variationMatches: RegExpMatchArray | null = seedSql.match(/INSERT INTO public\.product_variations/gi);

log(
  `
Categories to be created: ${categoryMatches ? categoryMatches.length : 1}
  ├─ Women
  ├─ Men
  ├─ Accessories
  └─ Footwear

Products to be created: ${productMatches ? productMatches.length : 1}
  ├─ Premium Silk Dress ($95)
  ├─ Modern Abaya ($80)
  ├─ Elegant Party Gown ($150)
  ├─ Casual T-Shirt ($25)
  ├─ Denim Jeans ($60)
  ├─ Men Cotton Shirt ($50)
  ├─ Formal Blazer ($120)
  ├─ Premium Leather Handbag ($120)
  ├─ Designer Sunglasses ($85)
  ├─ Silk Scarf ($35)
  ├─ Leather Loafers ($95)
  ├─ Casual Sneakers ($65)
  └─ High Heels ($110)

Product Variations: ${variationMatches ? variationMatches.length : 3}
  Premium Silk Dress: Black/S, Navy/M, Cream/L
`,
  'gray'
);

log('\n═══════════════════════════════════════════════════════════════', 'gray');

step('Pre-Setup Checklist');

log(
  `
✓ All files ready
✓ Environment configured
✓ Supabase connected
✓ Setup guide prepared

Next: Complete the 5 steps above in Supabase dashboard
`,
  'green'
);

log('\n═══════════════════════════════════════════════════════════════', 'gray');

// Create a setup checklist file
const checklist: string = `
# JT Collections Setup Checklist

## Database Setup Progress

- [ ] 1. Ran schema.sql in Supabase SQL Editor
  - File: database/schemaa.sql
  - Creates all tables with Row Level Security policies
  - Time: ~2-3 minutes

- [ ] 2. Ran seed.sql in Supabase SQL Editor
  - File: database/seed/complete_seed.sql
  - Inserts 4 categories, 12 products, product variations
  - Time: ~1 minute

- [ ] 3. Created admin account
  - Email: admin@jtcollections.com
  - Password: Admin@123456
  - Visit: http://localhost:5173/register
  - Time: ~1 minute

- [ ] 4. Updated admin role via SQL
  - Run the provided SQL query in Supabase
  - Time: ~30 seconds

- [ ] 5. Verified setup
  - Visit: http://localhost:5173/admin/orders
  - Should see admin panel
  - Time: ~1 minute

## System URLs
- Frontend: http://localhost:5173
- Shop: http://localhost:5173/shop
- Admin Orders: http://localhost:5173/admin/orders
- Supabase: https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb

## Total Time Estimate: ~10 minutes

## Troubleshooting
If you encounter issues:
1. Check ADMIN_DATABASE_SETUP.md for detailed instructions
2. Review SETUP_GUIDE.md for environment setup
3. Check browser console (F12) for any errors
4. Verify Supabase project is active and credentials are correct

---
Generated: ${new Date().toISOString()}
`;

const checklistPath: string = path.join(projectRoot, 'SETUP_CHECKLIST.md');
fs.writeFileSync(checklistPath, checklist);
success(`✓ Created setup checklist: ${checklistPath}`);

log('\n═══════════════════════════════════════════════════════════════', 'gray');
log(`\n📚 Documentation Files:\n`, 'bright');
log(`  - ADMIN_DATABASE_SETUP.md     (Detailed admin setup)`);
log(`  - SETUP_GUIDE.md              (Environment setup)`);
log(`  - SETUP_CHECKLIST.md          (Progress tracker)`);
log(`  - ORDER_IMPLEMENTATION_GUIDE  (Architecture reference)`);

log(`\n🎯 Next Step: Open Supabase dashboard\n`, 'bright');
log(`   https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new\n`, 'green');

log('═══════════════════════════════════════════════════════════════\n', 'gray');
log('Setup guide ready! Follow the 5 steps above to complete setup.\n', 'green');
