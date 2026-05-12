# Frontend Environment Variables Setup - MANUAL

## ⚠️ Important: Manual Setup Required

Due to Windows line ending issues, you must manually create the `.env.local` file.

## Steps to Create .env.local:

1. **Open your frontend directory**: `cd brain-a-hire/frontend`
2. **Create a new file**: Create a file named exactly `.env.local` (no .txt extension)
3. **Add these two lines** (each on its own line):

```
NEXT_PUBLIC_SUPABASE_URL=https://zoivmxuynubdvfzfoepx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_v6sseZw_ugsnRHYOFyAczA_evF3koXe
```

4. **Save the file**
5. **Restart your development server**: Stop (Ctrl+C) and restart `npm run dev`

## Verify Setup:

After creating the file and restarting the server:
- The "Supabase not configured" error should disappear
- Signup and login should work with Supabase authentication

## Troubleshooting:

- Make sure the file is named `.env.local` (not `.env.local.txt`)
- Ensure each variable is on its own line
- No extra spaces at the end of lines
- Restart the dev server after creating the file
