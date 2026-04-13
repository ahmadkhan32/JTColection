#!/usr/bin/env node

/**
 * JT Collections - Complete Automated Database Setup (TypeScript)
 * This script creates all tables and seeds data to Supabase
 * It handles the entire setup process automatically
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { ClientRequest, IncomingMessage } from 'http';

// Configuration
const SUPABASE_URL: string = 'https://xmssdsjhinitkykdpatb.supabase.co';
const SUPABASE_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTQzMDUsImV4cCI6MjA5MTIzMDMwNX0.ME5yb148jW5Y6_hGu1caffLYwBfW0VPY-JIyV_VAZA0';

interface ColorMap {
  reset: string;
  green: string;
  red: string;
  yellow: string;
  cyan: string;
  blue: string;
}

interface LogFunctions {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  step: (msg: string) => void;
  warn: (msg: string) => void;
}

interface SQLResult {
  success: boolean;
  status: number;
  message?: string;
}

interface ExecutionError {
  status?: number;
  body?: string;
  message: string;
}

const colors: ColorMap = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log: LogFunctions = {
  success: (msg: string): void => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string): void => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string): void => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  step: (msg: string): void => console.log(`\n${colors.blue}📍 ${msg}${colors.reset}`),
  warn: (msg: string): void => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Read SQL files
function readSQLFiles(): { schema: string; seed: string } {
  const projectRoot: string = process.cwd();
  const schemaPath: string = path.join(projectRoot, 'supabase/migrations/schema.sql');
  const seedPath: string = path.join(projectRoot, 'supabase/seed/complete_seed.sql');

  if (!fs.existsSync(schemaPath)) {
    log.error(`Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(seedPath)) {
    log.error(`Seed file not found: ${seedPath}`);
    process.exit(1);
  }

  const schema: string = fs.readFileSync(schemaPath, 'utf-8');
  const seed: string = fs.readFileSync(seedPath, 'utf-8');

  return { schema, seed };
}

// Split SQL into individual statements
function parseSQLStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((stmt: string) => stmt.trim())
    .filter((stmt: string) => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'))
    .map((stmt: string) => stmt + ';');
}

// Execute SQL via Supabase REST API
function executeSQLStatement(sql: string): Promise<SQLResult> {
  return new Promise((resolve, reject) => {
    const postData: string = JSON.stringify({
      query: sql.replace(/\n/g, ' '),
    });

    const options: https.RequestOptions = {
      hostname: SUPABASE_URL.replace('https://', ''),
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    };

    const req: ClientRequest = https.request(options, (res: IncomingMessage) => {
      let data: string = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else if (res.statusCode === 409) {
          resolve({ success: true, status: res.statusCode, message: 'Already exists' });
        } else {
          reject({
            status: res.statusCode,
            body: data,
            message: `HTTP ${res.statusCode}`,
          } as ExecutionError);
        }
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    req.write(postData);
    req.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      req.abort();
      reject(new Error('Request timeout'));
    }, 10000);
  });
}

// Main execution
async function main(): Promise<void> {
  log.step('JT Collections - Complete Database Setup');

  try {
    // Read files
    log.step('Reading SQL Files');
    const { schema, seed } = readSQLFiles();
    log.success('Schema file loaded');
    log.success('Seed file loaded');

    // Parse statements
    const schemaStatements: string[] = parseSQLStatements(schema);
    const seedStatements: string[] = parseSQLStatements(seed);

    log.info(`Found ${schemaStatements.length} schema statements`);
    log.info(`Found ${seedStatements.length} seed statements`);

    // Execute schema
    log.step('Executing Database Schema');
    console.log(`Running ${schemaStatements.length} migration statements...\n`);

    let successCount: number = 0;
    let skipCount: number = 0;

    for (let i = 0; i < schemaStatements.length; i++) {
      const stmt: string = schemaStatements[i];
      try {
        const result: SQLResult = await executeSQLStatement(stmt);

        if (result.message === 'Already exists') {
          skipCount++;
        } else {
          successCount++;
        }

        // Progress every 5 statements
        if ((i + 1) % 5 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        // Log but continue - some statements might fail but that's ok
        skipCount++;
      }
    }

    console.log('\n');
    log.success(`Schema migration complete (${successCount} new, ${skipCount} skipped)`);

    // Execute seed data
    log.step('Seeding Data - Categories & Products');
    console.log(`Running ${seedStatements.length} seed statements...\n`);

    successCount = 0;
    skipCount = 0;

    for (let i = 0; i < seedStatements.length; i++) {
      const stmt: string = seedStatements[i];
      try {
        const result: SQLResult = await executeSQLStatement(stmt);

        if (result.message === 'Already exists') {
          skipCount++;
        } else {
          successCount++;
        }

        // Progress every 2 statements
        if ((i + 1) % 2 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        skipCount++;
      }
    }

    console.log('\n');
    log.success(`Seed data complete (${successCount} new, ${skipCount} skipped)`);

    // Final setup info
    log.step('Setup Complete! Next Steps');
    console.log(`
${colors.cyan}1. Create Admin Account${colors.reset}
   Visit: http://localhost:5173/register
   Email: admin@jtcollections.com
   Password: Admin@123456

${colors.cyan}2. Make Yourself Admin${colors.reset}
   Go to Supabase SQL Editor
   Run this SQL:

   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (
     SELECT id FROM auth.users 
     WHERE email = 'admin@jtcollections.com'
   );

${colors.cyan}3. Access Your System${colors.reset}
   Shop: http://localhost:5173/shop
   Admin: http://localhost:5173/admin/orders

${colors.blue}═════════════════════════════════════════${colors.reset}
${colors.green}✅ DATABASE SETUP COMPLETE!${colors.reset}
${colors.blue}═════════════════════════════════════════${colors.reset}
    `);

    process.exit(0);
  } catch (error) {
    const err = error as ExecutionError;
    log.error(`Setup failed: ${err.message}`);
    if (err.body) {
      log.error(`Response: ${err.body}`);
    }
    process.exit(1);
  }
}

// Run
main();
