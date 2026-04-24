# Supabase Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in the root of your frontend directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zoivmxuynubdvfzfoepx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_v6sseZw_ugsnRHYOFyAczA_evF3koXe
```

## 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 3. Files Created

The following files have been created for Supabase integration:

- `utils/supabase/server.ts` - Server-side Supabase client
- `utils/supabase/client.ts` - Browser-side Supabase client  
- `utils/supabase/middleware.ts` - Middleware utilities
- `middleware.ts` - Next.js middleware for session management

## 4. Database Schema

You'll need to create the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  resume_url TEXT,
  status TEXT DEFAULT 'pending',
  ai_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Contact Submissions Table
```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Next Steps

1. Set up the environment variables in `.env.local`
2. Create the database tables in Supabase
3. Enable authentication in Supabase dashboard
4. Update the authentication pages to use Supabase Auth
5. Integrate database operations with existing forms
