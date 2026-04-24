# Backend Supabase Database Connection Setup

To connect your backend to Supabase database without changing the backend code, you need to update the DATABASE_URL in the .env file.

## Get Supabase Database Connection String

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/zoivmxuynubdvfzfoepx/settings/database
2. Scroll down to "Connection string"
3. Copy the "URI" format connection string
4. It will look like: `postgresql://postgres.xxxx:xxxx@aws-0-xxx.pooler.supabase.com:5432/postgres`

## Update backend .env file

Replace the DATABASE_URL in `backend/.env` with the Supabase connection string:

```env
# Database - Use Supabase connection string
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-xxx.pooler.supabase.com:5432/postgres

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
APP_NAME=Brain_A_Hire
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bilalshakeel.ahmed15@gmail.com
SMTP_PASSWORD=rply symn tmne qmws

# OpenAI key
OPENAI_API_KEY=your_openai_api_key_here

SHORTLIST_THRESHOLD=0.60
```

## Backend will work with Supabase

Since your backend uses SQLAlchemy (Python ORM), it will work seamlessly with Supabase because:
- Supabase is built on PostgreSQL
- SQLAlchemy supports PostgreSQL
- No code changes needed, just the connection string

## Run the backend

After updating the .env file:
```bash
cd brain-a-hire/backend
uvicorn app.main:app --reload
```

The backend will now connect to Supabase instead of local PostgreSQL.
