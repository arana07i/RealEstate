import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseReviewRepository } from '@/lib/repositories/review-repository';
import { ReviewDeleteSchema } from '@/lib/validations';
import { getAuthenticatedUser, canManageReviews } from '@/lib/auth/authorize';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

async function getReviewRepository() {
  const supabase = await createClient();
  return new SupabaseReviewRepository(supabase);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!canManageReviews(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviewRepository = await getReviewRepository();
    const reviews = await reviewRepository.findAll();

    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    logger.error('Failed to fetch reviews', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!canManageReviews(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviewRepository = await getReviewRepository();

    const body = await request.json();
    const validationResult = ReviewDeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { id } = validationResult.data;

    const deleted = await reviewRepository.delete(id, user.agency_id ?? undefined);

    if (!deleted) {
      return NextResponse.json({ error: 'Review not found or failed to delete' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'delete',
      resource_type: 'review',
      resource_id: id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    logger.error('Failed to delete review', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}