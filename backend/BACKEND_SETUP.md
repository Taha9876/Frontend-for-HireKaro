# Backend Environment Variables Setup

## Required Environment Variables

The backend requires these environment variables in the `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/brainahire
SECRET_KEY=your-secret-key-here-change-this-in-production
```

## Database Setup

1. **Install PostgreSQL** on your system
2. **Create a database** named `brainahire`
3. **Update the DATABASE_URL** with your actual PostgreSQL credentials:
   - Replace `username` with your PostgreSQL username
   - Replace `password` with your PostgreSQL password
   - Update `localhost:5432` if your PostgreSQL runs on different host/port

## Generate Secret Key

Run this command to generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Replace `your-secret-key-here-change-this-in-production` with the generated key.

## Frontend Setup

For the frontend, create `.env.local` in the frontend directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zoivmxuynubdvfzfoepx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_v6sseZw_ugsnRHYOFyAczA_evF3koXe
```

## Restart Services

After setting up environment variables:
1. Stop both frontend and backend servers (Ctrl+C)
2. Restart the backend: `uvicorn app.main:app --reload`
3. Restart the frontend: `npm run dev` (in frontend directory)
