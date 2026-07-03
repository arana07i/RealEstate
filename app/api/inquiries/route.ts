import { NextResponse, type NextRequest } from 'next/server';
import { InquirySchema } from '@/lib/validations';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeText, sanitizeEmail } from '@/lib/utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { sendInquiryNotification } from '@/lib/email';

let supabaseClient: SupabaseClient | null = null;
const getClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  if (!supabaseClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    supabaseClient = createSupabaseClient(url, key);
  }
  return supabaseClient;
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = await checkRateLimit(ip, RATE_LIMITS.INQUIRIES);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    
    const validationResult = InquirySchema.safeParse({
      ...body,
      agency_id: body.agency_id,
    });
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { agency_id, property_id, name, email, phone, message } = validationResult.data;

    const supabase = getClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { error } = await supabase.from('inquiries').insert({
      agency_id,
      property_id: property_id || null,
      name: sanitizeText(name),
      email: sanitizeEmail(email),
      phone: sanitizeText(phone),
      message: sanitizeText(message),
      status: 'new',
    });

    if (error) {
      logger.error('Failed to submit inquiry', { error: error.message, property_id });
      return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('email')
      .eq('id', agency_id)
      .single();
    if (agency?.email) {
      sendInquiryNotification(agency.email, { name, email, phone, message }).catch((e) =>
        logger.error('Failed to send inquiry notification', { error: e.message })
      );
    }

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
  } catch (err) {
    logger.error('Invalid request body', { error: (err as Error).message });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}