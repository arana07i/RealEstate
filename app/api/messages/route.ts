import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const MessageCreateSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['image', 'document']),
    size: z.number().int().positive(),
    mime_type: z.string(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'view_leads');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const conversation_id = searchParams.get('conversation_id');

    if (conversation_id) {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          sender_name,
          sender_avatar,
          content,
          created_at,
          status,
          attachments
        `)
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Failed to fetch messages', { error: error.message });
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
      }

      return NextResponse.json({ messages: messages || [] });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant_id,
        participant_name,
        participant_avatar,
        participant_presence,
        last_message,
        last_message_at,
        unread_count,
        property:listings(title, location)
      `)
      .eq('agency_id', user.agency_id)
      .order('last_message_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch conversations', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch messages', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'view_leads');
    const body = await request.json();
    const validationResult = MessageCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { conversation_id, content, attachments } = validationResult.data;
    const supabase = await createClient();

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, agency_id, participant_id')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        content,
        status: 'sent',
        attachments,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to send message', { error: error.message });
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to send message', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}