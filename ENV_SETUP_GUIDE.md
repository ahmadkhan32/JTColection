# 🔐 ENVIRONMENT VARIABLES SETUP GUIDE

## ⚡ QUICK START (2 Minutes)

### Step 1: Get Supabase Credentials
1. Open: https://supabase.com/dashboard
2. Select your project: **xmssdsjhinitkykdpatb**
3. Go to: **Settings** (bottom left sidebar)
4. Click: **API** tab

### Step 2: Copy Your Credentials
- Look for "Project URL" and "Project API keys"
- **Project URL** = Copy this to VITE_SUPABASE_URL
  - Example: `https://xmssdsjhinitkykdpatb.supabase.co`
- **Anon public** key = Copy this to VITE_SUPABASE_ANON_KEY
  - This is the "anon" key (starts with `eyJ...`)

### Step 3: Update .env.local
1. Open: `client/.env.local`
2. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual key
3. Save the file

### Step 4: Restart Frontend
```bash
cd client
npm run dev
```

---

## 📋 COMPLETE .env.local EXAMPLE

```env
# Supabase
VITE_SUPABASE_URL=https://xmssdsjhinitkykdpatb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3Nkc2poanJkd3B...

# API
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=5000

# App
VITE_APP_NAME=JT Collections
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

---

## ✅ VERIFICATION

After setting up .env.local:

1. **Check frontend loads:**
   - Go to: http://localhost:5174
   - You should see the JT Collections homepage

2. **Check Supabase connection:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - No errors should appear

3. **Check services work:**
   - Try to register a new account
   - If registration works → Supabase is connected ✅

---

## 🆘 TROUBLESHOOTING

### Error: "Failed to initialize Supabase client"
- **Fix:** Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- **Verify:** Copy-paste directly from Supabase dashboard
- **Restart:** Run `npm run dev` again

### Error: "Missing environment variable"
- **Fix:** Make sure .env.local file exists in `client/` folder
- **Check:** File should have both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- **Restart:** Kill terminal and run `npm run dev` again

### Products/Categories not loading
- **Fix:** Make sure you've run schema.sql in Supabase (Step 1 in MASTER_SETUP_GUIDE.md)
- **Fix:** Make sure you've run complete_seed.sql in Supabase (Step 2 in MASTER_SETUP_GUIDE.md)
- **Check:** Test data with this query in Supabase SQL Editor:
  ```sql
  SELECT COUNT(*) FROM public.products;
  -- Should return: 12
  ```

---

## 📚 FILES RELATED TO ENVIRONMENT

| File | Purpose |
|------|---------|
| `client/.env.local` | Environment variables for frontend |
| `client/src/services/supabaseClient.ts` | Supabase client initialization |
| `client/vite.config.ts` | Vite configuration |
| `client/tsconfig.json` | TypeScript configuration |

---

## 🔒 SECURITY NOTES

⚠️ **IMPORTANT:**
- The ANON_KEY in .env.local is PUBLIC and safe to expose
- Never put your Supabase SERVICE_KEY in frontend .env files
- Service key is only for backend/server code
- Keep the SERVICE_KEY private and in .env on your server only

✅ **Safe to commit to git:**
- .env.local (contains only public anon key)

❌ **Never commit to git:**
- SERVICE_KEY credentials
- Admin API keys
- Database passwords

---

## ✨ NEXT STEPS

1. **Get Supabase credentials** (2 minutes)
2. **Update .env.local** file (1 minute)
3. **Restart frontend** (npm run dev)
4. **Test homepage** (should load fine)
5. **Continue with MASTER_SETUP_GUIDE.md** for full setup

---

Made with ❤️ by JT Collections

