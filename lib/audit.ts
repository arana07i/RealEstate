import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import type { AuditAction } from '@/lib/types';

export interface AuditLogEntry {
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  user_id?: string;
  agency_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    logger.info('Audit Log', {
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      user_id: entry.user_id,
      agency_id: entry.agency_id,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent?.substring(0, 500),
      metadata: entry.metadata,
    });
  } catch (error) {
    logger.error('Failed to write audit log', { error: (error as Error).message });
  }
}

export function createAuditMiddleware(baseHandler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await baseHandler(request);
    
    if (request.method !== 'GET') {
      const agencyId = request.headers.get('x-agency-id');
      const userAgent = request.headers.get('user-agent');
      
      logAudit({
        action: request.method as AuditAction,
        resource_type: 'api_request',
        agency_id: agencyId ?? undefined,
        ip_address: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
        user_agent: userAgent ?? undefined,
        metadata: {
          pathname: request.nextUrl.pathname,
          status: response.status,
        },
      });
    }
    
    return response;
  };
}