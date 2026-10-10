import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { EVENT_ID, getServerSupabase } from '@/lib/server-supabase';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request: Request) {
  const token = process.env.ZOOPLANET_WEBHOOK_TOKEN || '';
  const received = request.headers.get('x-webhook-token') || '';
  if (!token || Buffer.byteLength(received) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(received), Buffer.from(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const db = getServerSupabase();
    const before = new Date(Date.now() - 120000).toISOString();
    const { data, error } = await db.from('registrations').select('*')
      .eq('event_id', EVENT_ID).is('confirmation_sent_at', null)
      .lt('created_at', before).or(`confirmation_queued_at.is.null,confirmation_queued_at.lt.${before}`)
      .order('created_at').limit(10);
    if (error) throw error;
    let accepted = 0;
    for (const row of data || []) {
      // A conditional update leases each pending message to a single worker.
      const { data: claimed, error: claimError } = await db.from('registrations')
        .update({ confirmation_queued_at: new Date().toISOString() })
        .eq('id', row.id).is('confirmation_sent_at', null)
        .or(`confirmation_queued_at.is.null,confirmation_queued_at.lt.${before}`)
        .select('id').maybeSingle();
      if (claimError || !claimed) continue;
      try {
        const response = await fetch('https://twipagency.app.n8n.cloud/webhook/zooplanet/registration-confirmation', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Token': token },
          body: JSON.stringify({ ...row, registration_id: row.id }), signal: AbortSignal.timeout(5000),
        });
        if (response.ok) accepted++;
      } catch { /* The lease expires; the next scheduled run retries. */ }
    }
    return NextResponse.json({ pending: data?.length || 0, accepted });
  } catch {
    return NextResponse.json({ error: 'Retry unavailable' }, { status: 503 });
  }
}
