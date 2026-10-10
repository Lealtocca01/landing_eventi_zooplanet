import { createClient } from '@supabase/supabase-js';

export const EVENT_ID = 'sfilata-cuccioli-2026-10-17';
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Database unavailable');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
