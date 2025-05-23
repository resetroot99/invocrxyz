import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import xml2js from 'xml2js';
import { createClient } from '@supabase/supabase-js';

// Create a direct server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.VECTOR_DB_KEY! // Using the service role key for admin-level access
);

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-ccc-signature') || '';
  const secret = process.env.CCC_WEBHOOK_SECRET!;
  const calc = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  
  if (calc !== sig) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  try {
    const js = await xml2js.parseStringPromise(raw, { explicitArray: false });
    const event = Object.keys(js)[0];
    
    await supabase.from('invoices').insert({
      id: js[event].DocumentInfo?.DocumentID || crypto.randomUUID(),
      user_id: req.headers.get('x-user-id') || null,
      ccc_status: event,
      raw_payload: raw,
      created_at: new Date().toISOString()
    });
    
    return NextResponse.json({ status: 'ok', event });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 