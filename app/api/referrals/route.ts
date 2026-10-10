import { NextResponse } from 'next/server';
import { EVENT_ID, getServerSupabase } from '@/lib/server-supabase';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code') || '';
  if (!/^[a-f0-9]{8,32}$/.test(code)) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  try {
    const { data, error } = await getServerSupabase().from('registrations')
      .select('referral_count').eq('event_id', EVENT_ID).eq('referral_code', code).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
