import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';
import { InquiryStatusSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = await checkRateLimit(ip, RATE_LIMITS.ADMIN_API);

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .single();

  const agency_id = agency?.id;

  if (!agency_id) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 403 });
  }

  const body = await request.json();
  const validationResult = InquiryStatusSchema.safeParse(body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map((e) => e.message).join(', ');
    return NextResponse.json({ error: errorMessages }, { status: 400 });
  }

  const { status } = validationResult.data;

  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .eq('agency_id', agency_id);

  if (error) {
    logger.error('Failed to update inquiry status', { inquiryId: id, error: error.message });
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 400 });
  }

  await logAudit({
    action: 'update',
    resource_type: 'inquiry',
    resource_id: id,
    user_id: user.id,
    agency_id,
    ip_address: ip,
    user_agent: request.headers.get('user-agent') ?? undefined,
    metadata: { status },
  });

  return NextResponse.json({ success: true });
}