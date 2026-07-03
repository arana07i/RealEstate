import { logger } from '@/lib/logger';
import { reportError } from '@/lib/monitoring';
import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string): NextResponse {
  const err = error instanceof Error ? error : new Error(String(error));
  
  logger.error(context || 'Server error', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV !== 'production') {
    reportError(err, { context });
  }

  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function formatValidationError(zodError: { errors: Array<{ path: string[]; message: string }> }): string {
  return zodError.errors.map((e) => e.message).join(', ');
}