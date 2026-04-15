import fs from 'fs';
import path from 'path';

const envFile = path.join(process.cwd(), 'client', '.env.local');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🔍 ENVIRONMENT CONFIGURATION CHECK                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Check if .env.local exists
if (!fs.existsSync(envFile)) {
  console.log('❌ .env.local file NOT found!');
  console.log('   Location: frontend/.env.local');
  console.log('   Action: Create .env.local file with Supabase credentials\n');
  process.exit(1);
}

console.log('✅ .env.local file exists\n');

// Read .env.local
const envContent = fs.readFileSync(envFile, 'utf-8');
const envLines = envContent.split('\n').filter(line => !line.startsWith('#') && line.trim());

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const envObj: Record<string, string> = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  envObj[key.trim()] = valueParts.join('=').trim();
});

console.log('📋 ENVIRONMENT VARIABLES CHECK:\n');

let allValid = true;

requiredVars.forEach(varName => {
  if (envObj[varName] && envObj[varName] !== `YOUR_${varName}_HERE`) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`❌ ${varName} - MISSING or placeholder value`);
    allValid = false;
  }
});

console.log('\n════════════════════════════════════════════════════════════════\n');

if (!allValid) {
  console.log('⚠️  MISSING ENVIRONMENT VARIABLES\n');
  console.log('📖 Follow these steps:\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select project: xmssdsjhinitkykdpatb');
  console.log('3. Click: Settings → API');
  console.log('4. Copy Project URL → VITE_SUPABASE_URL');
  console.log('5. Copy anon public key → VITE_SUPABASE_ANON_KEY');
  console.log('6. Update frontend/.env.local');
  console.log('7. Restart: npm run dev\n');
  process.exit(1);
}

console.log('✅ ALL ENVIRONMENT VARIABLES CONFIGURED CORRECTLY\n');
console.log('🚀 Ready to start frontend!\n');
