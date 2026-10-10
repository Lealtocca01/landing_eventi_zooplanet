import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = process.env.ZOOPLANET_WEBHOOK_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Confirmation service unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    if (!body.registration_id || !body.email || !body.referral_code) {
      return NextResponse.json({ error: 'Invalid registration' }, { status: 400 });
    }

    const response = await fetch(
      'https://twipagency.app.n8n.cloud/webhook/zooplanet/registration-confirmation',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Token': token },
        body: JSON.stringify({
          registration_id: body.registration_id,
          email: body.email,
          referral_code: body.referral_code,
          first_name: body.first_name,
          last_name: body.last_name,
          phone: body.phone,
          participants: body.participants,
          time_slot: body.time_slot,
        }),
      }
    );
    return NextResponse.json({ accepted: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 502 });
  }
}
