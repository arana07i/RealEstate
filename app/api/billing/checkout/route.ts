import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  if (success || canceled) {
    return redirect(`/admin/billing?success=${success ? '1' : ''}&canceled=${canceled ? '1' : ''}`);
  }

  return redirect('/admin/billing');
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .single();

  const agencyId = agency?.id;
  if (!agencyId) {
    return redirect('/onboarding');
  }

  const formData = await request.formData();
  const tier = formData.get('tier') as 'starter' | 'professional' | 'enterprise';

  if (!tier || !['starter', 'professional', 'enterprise'].includes(tier)) {
    return redirect('/admin/billing');
  }

  const checkoutUrl = await createCheckoutSession(agencyId, tier);

  if (checkoutUrl) {
    return redirect(checkoutUrl);
  }

  return redirect('/admin/billing');
}