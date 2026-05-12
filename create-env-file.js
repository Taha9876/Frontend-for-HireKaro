const fs = require('fs');
const path = require('path');

const content = 'NEXT_PUBLIC_SUPABASE_URL=https://zoivmxuynubdvfzfoepx.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_v6sseZw_ugsnRHYOFyAczA_evF3koXe';

fs.writeFileSync(path.join(__dirname, '.env.local'), content, 'utf8');
console.log('.env.local created successfully');
