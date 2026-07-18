import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, hasPermission } from '@/lib/auth/authorize';
import { StripeCheckoutSchema } from '@/lib/validations';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const success = request.nextUrl.searchParams.get('success');
  const canceled = request.nextUrl.searchParams.get('canceled');

  if (success || canceled) {
    return redirect(`/admin/billing?success=${success ? '1' : ''}&canceled=${canceled ? '1' : ''}`);
  }

  return redirect('/admin/billing');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!hasPermission(user, 'manage_billing')) {
      return redirect('/admin/billing?error=forbidden');
    }

    const supabase = await createClient();

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', user.agency_id)
      .single();

    const agencyId = agency?.id;
    if (!agencyId) {
      return redirect('/onboarding');
    }

    const body = await request.json();
    const validationResult = StripeCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      return redirect('/admin/billing');
    }

    const { tier: validatedTier } = validationResult.data;
    const checkoutUrl = await createCheckoutSession(agencyId, validatedTier);

    if (checkoutUrl) {
      return redirect(checkoutUrl);
    }

    return redirect('/admin/billing');
  } catch {
    return redirect('/admin/login');
  }
}