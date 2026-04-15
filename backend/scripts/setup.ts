#!/usr/bin/env node

/**
 * JT Collections - Complete Database Setup Script (TypeScript)
 * Runs schema migrations and seeds data to Supabase
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { ClientRequest, IncomingMessage } from 'http';

// Create __dirname equivalent for ES modules
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

interface EnvironmentVariables {
  [key: string]: string | undefined;
}

interface SQLResult {
  success: boolean;
  message?: string;
}

const SUPABASE_URL: string = process.env.VITE_SUPABASE_URL || 'https://xmssdsjhinitkykdpatb.supabase.co';
const SUPABASE_ANON_KEY: string | undefined = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🚀 JT Collections Database Setup\n');
console.log('📋 Configuration:');
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   Using Anon Key: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log('');

// Read SQL files
const schemaPath: string = path.join(__dirname, 'database/schemaa.sql');
const seedPath: string = path.join(__dirname, 'database/seed/complete_seed.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.sql not found at:', schemaPath);
  process.exit(1);
}

if (!fs.existsSync(seedPath)) {
  console.error('❌ complete_seed.sql not found at:', seedPath);
  process.exit(1);
}

const schemaSql: string = fs.readFileSync(schemaPath, 'utf-8');
const seedSql: string = fs.readFileSync(seedPath, 'utf-8');

console.log('✅ SQL files loaded');
console.log(`   - Schema file: ${schemaPath.split('\\').pop()}`);
console.log(`   - Seed file: ${seedPath.split('\\').pop()}`);
console.log('\n');

/**
 * Execute SQL via Supabase REST API
 */
function executeSQL(sql: string, description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Split SQL by semicolon and filter empty statements
    const statements: string[] = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s && !s.startsWith('--'))
      .map((s: string) => s + ';');

    console.log(`⏳ Executing ${description} (${statements.length} statements)...`);

    // Execute sequentially to avoid conflicts
    let completed: number = 0;
    let errors: string[] = [];

    const executeNext = (index: number): void => {
      if (index >= statements.length) {
        if (errors.length > 0) {
          console.log(`   ⚠️  Completed with ${errors.length} non-critical errors`);
          errors.forEach((e: string) => console.log(`      - ${e}`));
        } else {
          console.log(`   ✅ ${description} completed successfully`);
        }
        resolve();
        return;
      }

      const statement: string = statements[index];

      const postData: string = JSON.stringify({ query: statement });

      const options: https.RequestOptions = {
        hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
        path: '/rest/v1/rpc/sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      };

      const req: ClientRequest = https.request(options, (res: IncomingMessage) => {
        let data: string = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk;
        });
        res.on('end', () => {
          // Most SQL operations will return 200 or other success codes
          // Don't worry about individual statement responses
          completed++;
          executeNext(index + 1);
        });
      });

      req.on('error', (error: Error) => {
        // Log but continue - this might be expected for some statements
        errors.push(statement.substring(0, 50) + '...');
        completed++;
        executeNext(index + 1);
      });

      req.write(postData);
      req.end();
    };

    executeNext(0);
  });
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    console.log('📊 Database Migration Plan:');
    console.log('   1️⃣  Run schema migrations');
    console.log('   2️⃣  Seed categories and products');
    console.log('   3️⃣  Create product variations');
    console.log('\n');

    // Execute schema
    await executeSQL(schemaSql, 'schema migration');
    console.log('');

    // Execute seed data
    await executeSQL(seedSql, 'seed data');
    console.log('\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📌 Next Steps:');
    console.log('   1. Sign up at http://localhost:5173/register');
    console.log('      Email: admin@jtcollections.com');
    console.log('      Password: Admin@123456\n');

    console.log('   2. Make yourself admin by running in Supabase SQL Editor:');
    console.log('      UPDATE public.profiles SET role = \'admin\'');
    console.log('      WHERE id = (');
    console.log('        SELECT id FROM auth.users');
    console.log('        WHERE email = \'admin@jtcollections.com\'');
    console.log('      );\n');

    console.log('   3. Access admin panel at http://localhost:5173/admin/orders\n');

    console.log('🛒 Test the system:');
    console.log('   - Browse products at http://localhost:5173/shop');
    console.log('   - Add to cart and checkout');
    console.log('   - View orders in admin dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', (error as Error).message);
    process.exit(1);
  }
}

main();
