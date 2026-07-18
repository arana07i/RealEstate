import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { SupabaseUserRepository } from '@/lib/auth/repositories/user-repository';
import { createClient } from '@/lib/supabase/server';
import { UserRoleSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

const userRepository = new SupabaseUserRepository();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission(request, 'manage_users');
    const { id } = await context.params;

    const targetUser = await userRepository.getUserWithRole(id);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'super_admin' && targetUser.agency_id !== currentUser.agency_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch user', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission(request, 'manage_users');
    const { id } = await context.params;

    const targetUser = await userRepository.getUserWithRole(id);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'super_admin' && targetUser.agency_id !== currentUser.agency_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = UserRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { role } = validationResult.data;

    if (role === 'super_admin' && currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can assign super admin role' }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (!roleData) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const agencyId = currentUser.role === 'super_admin' ? targetUser.agency_id : currentUser.agency_id;

    await userRepository.removeRole(id, roleData.id, agencyId);
    await userRepository.assignRole(id, roleData.id, agencyId);

    const updatedUser = await userRepository.getUserWithRole(id);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update user role', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission(request, 'manage_users');
    const { id } = await context.params;

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    const targetUser = await userRepository.getUserWithRole(id);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'super_admin' && targetUser.agency_id !== currentUser.agency_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', id);

    if (roleError) {
      logger.error('Failed to delete user roles', { error: roleError.message });
    }

    const deleted = await userRepository.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to delete user', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
