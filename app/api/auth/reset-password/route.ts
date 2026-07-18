import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function validatePasswordStrength(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const validationError = validatePasswordStrength(password);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      logger.error('Password update failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (adminClient && data?.user) {
      await adminClient
        .from('profiles')
        .update({ last_password_change: new Date().toISOString() })
        .eq('id', user.id);
    } else if (data?.user) {
      await supabase
        .from('profiles')
        .update({ last_password_change: new Date().toISOString() })
        .eq('id', user.id);
    }

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Reset password error', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}