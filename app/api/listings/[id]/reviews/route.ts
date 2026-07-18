import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseReviewRepository } from '@/lib/repositories/review-repository';
import { ReviewCreateSchema } from '@/lib/validations';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

async function getReviewRepository() {
  const supabase = await createClient();
  return new SupabaseReviewRepository(supabase);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reviewRepository = await getReviewRepository();

    const reviews = await reviewRepository.findAll({ listing_id: id });

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error('Failed to fetch reviews', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id: listingId } = await context.params;
    const reviewRepository = await getReviewRepository();

    const body = await request.json();
    const validationResult = ReviewCreateSchema.safeParse({ ...body, listing_id: listingId });

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { rating, comment } = validationResult.data;

    const review = await reviewRepository.create({
      listing_id: listingId,
      user_id: user.id,
      rating,
      comment,
    }, user.agency_id ?? undefined);

    if (!review) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'create',
      resource_type: 'review',
      resource_id: review.id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    logger.error('Failed to create review', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}