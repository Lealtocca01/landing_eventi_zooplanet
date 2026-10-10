import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EVENT_ID, getServerSupabase } from '@/lib/server-supabase';

const input = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  phone: z.string().trim().min(6).max(30),
  dog_breed: z.string().trim().min(1).max(100),
  participants: z.number().int().min(1).max(8),
  privacy_accepted: z.literal(true),
  referred_by: z.string().trim().regex(/^[a-f0-9]{8,32}$/).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = input.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Controlla i dati inseriti e il consenso privacy.' }, { status: 400 });
    if (Date.now() > Date.parse('2026-10-17T18:00:00+02:00')) {
      return NextResponse.json({ error: 'Le iscrizioni per questo evento sono chiuse.' }, { status: 410 });
    }
    const token = process.env.ZOOPLANET_WEBHOOK_TOKEN;
    if (!token) return NextResponse.json({ error: 'Il servizio non è disponibile. Riprova tra poco.' }, { status: 503 });
    const db = getServerSupabase();
    const { data, error } = await db.from('registrations')
      .insert({ ...parsed.data, event_id: EVENT_ID, time_slot: '15:00 - 18:00', confirmation_queued_at: new Date().toISOString() })
      .select().single();
    if (error) return NextResponse.json({ error: error.code === '23505' ? 'Questa email è già iscritta alla sfilata. Controlla la mail di conferma.' : 'Errore durante la registrazione. Riprova.' }, { status: error.code === '23505' ? 409 : 503 });
    // The database keeps unsent confirmations so the automation can retry them.
    let emailAccepted = false;
    try {
      const response = await fetch('https://twipagency.app.n8n.cloud/webhook/zooplanet/registration-confirmation', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Token': token },
        body: JSON.stringify({ ...data, registration_id: data.id }),
        signal: AbortSignal.timeout(15000),
      });
      emailAccepted = response.ok;
    } catch { /* Registration is saved; confirmation stays pending. */ }
    return NextResponse.json({ referral_code: data.referral_code, email_accepted: emailAccepted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Il servizio non è disponibile. Riprova tra poco.' }, { status: 503 });
  }
}
