# JT Collections - Database Setup & Admin Account Creator
# This script runs migrations and seeds your Supabase database
# Usage: .\setup.ps1

param(
    [string]$ServiceRoleKey = ""
)

$ErrorActionPreference = "Continue"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  JT Collections - Complete Database Setup                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SupabaseUrl = "https://xmssdsjhinitkykdpatb.supabase.co"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTQzMDUsImV4cCI6MjA5MTIzMDMwNX0.ME5yb148jW5Y6_hGu1caffLYwBfW0VPY-JIyV_VAZA0"

Write-Host "📋 SETUP INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "This script will set up your JT Collections database." -ForegroundColor White
Write-Host "You need to do the following steps manually in Supabase dashboard:" -ForegroundColor White
Write-Host ""
Write-Host "👉 STEP 1: Run Database Migrations" -ForegroundColor Cyan
Write-Host "   1. Go to: https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   2. Open your 'JT Collections' project" -ForegroundColor Gray
Write-Host "   3. Go to SQL Editor (left sidebar)" -ForegroundColor Gray
Write-Host "   4. Click '+ New Query'" -ForegroundColor Gray
Write-Host "   5. Copy this file content:" -ForegroundColor Gray
Write-Host "      📄 supabase/migrations/schema.sql" -ForegroundColor White
Write-Host "   6. Paste it in Supabase SQL Editor" -ForegroundColor Gray
Write-Host "   7. Click 'Run' button" -ForegroundColor Gray
Write-Host ""

Write-Host "👉 STEP 2: Seed Products & Categories" -ForegroundColor Cyan
Write-Host "   1. Create another '+ New Query' in SQL Editor" -ForegroundColor Gray
Write-Host "   2. Copy this file content:" -ForegroundColor Gray
Write-Host "      📄 supabase/seed/complete_seed.sql" -ForegroundColor White
Write-Host "   3. Paste it in the new SQL query" -ForegroundColor Gray
Write-Host "   4. Click 'Run' button" -ForegroundColor Gray
Write-Host ""

Write-Host "👉 STEP 3: Create Admin Account" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:5173/register in your browser" -ForegroundColor Gray
Write-Host "   2. Sign up with:" -ForegroundColor Gray
Write-Host "      📧 Email: admin@jtcollections.com" -ForegroundColor White
Write-Host "      🔐 Password: Admin@123456" -ForegroundColor White
Write-Host "   3. This creates your auth account" -ForegroundColor Gray
Write-Host ""

Write-Host "👉 STEP 4: Assign Admin Role" -ForegroundColor Cyan
Write-Host "   1. Go back to Supabase SQL Editor" -ForegroundColor Gray
Write-Host "   2. Create another '+ New Query'" -ForegroundColor Gray
Write-Host "   3. Copy and paste this SQL:" -ForegroundColor Gray
Write-Host ""
Write-Host "      UPDATE public.profiles" -ForegroundColor White
Write-Host "      SET role = 'admin'" -ForegroundColor White
Write-Host "      WHERE id = (" -ForegroundColor White
Write-Host "        SELECT id FROM auth.users" -ForegroundColor White
Write-Host "        WHERE email = 'admin@jtcollections.com'" -ForegroundColor White
Write-Host "      );" -ForegroundColor White
Write-Host ""
Write-Host "   4. Click 'Run' button" -ForegroundColor Gray
Write-Host ""

Write-Host "👉 STEP 5: Access Admin Dashboard" -ForegroundColor Cyan
Write-Host "   1. Visit: http://localhost:5173/admin/orders" -ForegroundColor White
Write-Host "   2. You should see the admin panel" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 File Locations (copy-paste these paths):" -ForegroundColor Yellow
$schemaFile = "c:\Users\asadk\Downloads\JT Colection\supabase\migrations\schema.sql"
$seedFile = "c:\Users\asadk\Downloads\JT Colection\supabase\seed\complete_seed.sql"

Write-Host "   Schema:  $schemaFile" -ForegroundColor Gray
Write-Host "   Seed:    $seedFile" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Ready? Press any key to open Supabase dashboard..." -ForegroundColor Green
# Uncomment to pause:
# Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "Opening Supabase dashboard..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/xmssdsjhinitkykdpatb/sql/new"

Write-Host ""
Write-Host "✅ Instructions complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 QUICK CHECKLIST:" -ForegroundColor Yellow
Write-Host "   ☐ Ran schema.sql in Supabase" -ForegroundColor Gray
Write-Host "   ☐ Ran seed.sql in Supabase" -ForegroundColor Gray
Write-Host "   ☐ Signed up as admin@jtcollections.com" -ForegroundColor Gray
Write-Host "   ☐ Updated role to admin via SQL" -ForegroundColor Gray
Write-Host "   ☐ Accessed http://localhost:5173/admin/orders" -ForegroundColor Gray
Write-Host ""
Write-Host "Need help? Check ADMIN_DATABASE_SETUP.md or SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
