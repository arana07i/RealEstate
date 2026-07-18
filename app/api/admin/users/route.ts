import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { SupabaseUserRepository } from '@/lib/auth/repositories/user-repository';
import { createClient } from '@/lib/supabase/server';
import { UserCreateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

const userRepository = new SupabaseUserRepository();

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requirePermission(request, 'manage_users');

    const users = await userRepository.getAllUsers(currentUser.role === 'super_admin' ? undefined : currentUser.agency_id ?? undefined);

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch users', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission(request, 'manage_users');

    const body = await request.json();
    const validationResult = UserCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { email, full_name, role, agency_id } = validationResult.data;

    if (currentUser.role !== 'super_admin' && agency_id !== currentUser.agency_id) {
      return NextResponse.json({ error: 'Cannot create users in other agencies' }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError || !authData.user) {
      logger.error('Failed to create auth user', { error: authError?.message });
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const userId = authData.user.id;

    const profile = await userRepository.create({
      id: userId,
      agency_id: agency_id || currentUser.agency_id,
      email,
      full_name: full_name || null,
      avatar_url: null,
    });

    if (!profile) {
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleData) {
      await userRepository.assignRole(userId, roleData.id, profile.agency_id);
    }

    const userWithRole = await userRepository.getUserWithRole(userId);

    return NextResponse.json({ user: userWithRole }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create user', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
