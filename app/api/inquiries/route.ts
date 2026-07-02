import { NextResponse, type NextRequest } from 'next/server';
import type { InquiryFormData } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeText, sanitizeEmail, validateEmail, validatePhone } from '@/lib/utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { sendInquiryNotification } from '@/lib/email';

let supabaseClient: SupabaseClient | null = null;
const getClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Missing Supabase environment variables');
    }
    return null;
  }
  if (!supabaseClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    supabaseClient = createSupabaseClient(url, key);
  }
  return supabaseClient;
};

const validateInquiry = (data: Partial<InquiryFormData>): string | null => {
  if (!data.name || data.name.trim().length === 0) return 'Name is required';
  if (!data.email || !validateEmail(data.email)) return 'Valid email is required';
  if (!data.phone || !validatePhone(data.phone)) return 'Valid phone number is required';
  if (!data.message || data.message.trim().length === 0) return 'Message is required';
  if (data.message && data.message.length > 2000) return 'Message is too long (max 2000 characters)';
  return null;
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
    const { agency_id, property_id, name, email, phone, message }: InquiryFormData & { agency_id: string } = body;

    const validationError = validateInquiry({ property_id, name, email, phone, message });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!agency_id) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 });
    }

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

    // Send email notification
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
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}