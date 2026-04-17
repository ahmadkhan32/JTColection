$key  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poaW5pdGt5a2RwYXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1NDMwNSwiZXhwIjoyMDkxMjMwMzA1fQ.RgreSxvDf5TA-2eH8dGDYiKY3deOqZWspR0Yb9Wsyg0'
$base = 'https://xmssdsjhinitkykdpatb.supabase.co'
$hdrs = @{
  'Authorization' = "Bearer $key"
  'apikey'        = $key
  'Content-Type'  = 'application/json'
}

Write-Host "Fetching auth users..."
$resp   = Invoke-RestMethod -Uri "$base/auth/v1/admin/users?per_page=1000" -Headers $hdrs
$target = $resp.users | Where-Object { $_.email -eq 'tayyabjavaid71@gmail.com' }

if (-not $target) {
  Write-Host "NOT FOUND: tayyabjavaid71@gmail.com has no Supabase account. Register first at /register."
  exit 0
}

Write-Host "Found: $($target.id)  $($target.email)"

$body   = @{ id = $target.id; role = 'admin' } | ConvertTo-Json -Compress
$upsert = @{
  'Authorization' = "Bearer $key"
  'apikey'        = $key
  'Content-Type'  = 'application/json'
  'Prefer'        = 'resolution=merge-duplicates'
}
Invoke-RestMethod -Method Post `
  -Uri "$base/rest/v1/profiles?on_conflict=id" `
  -Headers $upsert `
  -Body $body | Out-Null

Write-Host "SUCCESS: tayyabjavaid71@gmail.com is now role=admin"
Write-Host "They can now log in at /login and will be redirected to /admin/dashboard"
